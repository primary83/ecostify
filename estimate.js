/* ========================================
   Ecostify — Estimate Results Page (v2)
   Advanced AI estimate with:
   - Location-aware pricing
   - Multi-tier estimates (budget/mid/premium)
   - Urgency indicator
   - DIY vs Pro recommendation
   - Cost breakdown chart
   - Time estimate & best season
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    const data = JSON.parse(sessionStorage.getItem('ecostify_estimate') || 'null');

    if (!data) {
        window.location.href = '/';
        return;
    }

    // Kick off both AI estimate and providers in parallel
    fetchAIEstimate(data);
    initProviders(data);
});

/* ────────────────────────────────────────
   Reverse Geocode — turn lat/lng into city, state
   Uses free Nominatim API (no key needed)
   ──────────────────────────────────────── */

async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
            headers: { 'User-Agent': 'Ecostify/1.0' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const addr = data.address || {};
        return {
            city: addr.city || addr.town || addr.village || addr.hamlet || '',
            state: addr.state || '',
            country: addr.country_code || ''
        };
    } catch {
        return null;
    }
}

/* ────────────────────────────────────────
   AI Estimate
   ──────────────────────────────────────── */

async function fetchAIEstimate(data) {
    const loading = document.getElementById('loading');
    const loadingText = loading?.querySelector('p');

    try {
        if (loadingText) loadingText.textContent = data.photoData
            ? 'AI is analyzing your photo...'
            : 'AI is analyzing your request...';

        const body = {
            category: data.category,
            description: data.description || ''
        };

        if (data.photoData) {
            body.photoData = data.photoData;
        }
        if (data.extraPhotos && data.extraPhotos.length > 0) {
            body.extraPhotos = data.extraPhotos;
        }

        // Add location data for pricing accuracy
        if (data.location) {
            body.lat = data.location.lat;
            body.lng = data.location.lng;

            // Try to get city/state for even better accuracy
            if (loadingText && data.photoData) {
                loadingText.textContent = 'AI is analyzing your photo & local pricing...';
            } else if (loadingText) {
                loadingText.textContent = 'AI is analyzing local pricing...';
            }

            const geo = await reverseGeocode(data.location.lat, data.location.lng);
            if (geo && geo.city) {
                body.city = geo.city;
                body.state = geo.state;
                // Store for display
                data._locationLabel = `${geo.city}, ${geo.state}`;
            }
        }

        const res = await fetch('/api/estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error(`API returned ${res.status}`);

        const estimate = await res.json();

        if (!estimate.title || !estimate.priceRange || !estimate.tips) {
            throw new Error('Incomplete AI response');
        }

        renderEstimate(data, estimate);

    } catch (err) {
        console.warn('AI API unavailable, using local estimate:', err.message);
        const estimate = generateLocalEstimate(data.category, data.description);
        renderEstimate(data, estimate);
    }
}

/* ────────────────────────────────────────
   Providers — auto-detect & fetch
   ──────────────────────────────────────── */

async function initProviders(data) {
    const loadingEl = document.getElementById('providers-loading');
    const listEl = document.getElementById('providers-list');
    const emptyEl = document.getElementById('providers-empty');

    // Silently auto-detect location — no prompts, no permission popups
    // Works on both mobile and desktop via IP geolocation fallback
    let location = data.location || null;

    if (!location) {
        const cached = sessionStorage.getItem('ecostify_location');
        if (cached) location = JSON.parse(cached);
    }

    if (!location) {
        location = await requestLocation();
    }

    if (location) {
        await fetchProviders(location.lat, location.lng, data.category);
    } else {
        // No location available — show helpful message
        if (loadingEl) loadingEl.hidden = true;
        renderNoLocation(data.category);
    }

    async function fetchProviders(lat, lng, category) {
        try {
            const res = await fetch('/api/providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, category })
            });

            if (!res.ok) throw new Error(`Providers API returned ${res.status}`);

            const result = await res.json();
            const providers = result.providers || [];

            if (loadingEl) loadingEl.hidden = true;

            if (providers.length === 0) {
                renderNoResults(category);
            } else {
                renderRealProviders(providers, result.userLat, result.userLng);
            }

        } catch (err) {
            console.warn('Providers API unavailable:', err.message);
            if (loadingEl) loadingEl.hidden = true;
            renderNoResults(category);
        }
    }

    function buildProviderCard(p, isReal) {
        const ratingStars = p.rating ? generateStars(p.rating) : '';
        const openBadge = p.isOpen === 'open'
            ? '<span class="provider-status-badge open">Open</span>'
            : p.isOpen === 'closed'
            ? '<span class="provider-status-badge closed">Closed</span>'
            : '';

        // Photo with <img> tag (handles Google Places redirects) + onerror fallback
        const fallbackInitial = escHtml(p.name.charAt(0));
        const photoHtml = p.photoUrl
            ? `<div class="provider-photo">
                <img src="${p.photoUrl}" alt="${escHtml(p.name)}" class="provider-photo-img" loading="lazy"
                     onerror="this.parentElement.classList.add('provider-photo-fallback');this.outerHTML='<span>${fallbackInitial}</span>';">
               </div>`
            : `<div class="provider-photo provider-photo-fallback"><span>${fallbackInitial}</span></div>`;

        // Service tags
        const tags = (p.serviceTags || [p.specialty || '']).filter(Boolean);
        const tagsHtml = tags.map(t => `<span class="provider-tag">${escHtml(t)}</span>`).join('');

        // Verified badge for providers with high ratings
        const verifiedHtml = p.rating >= 4.0 && p.reviews >= 10
            ? `<span class="provider-verified-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> VERIFIED</span>`
            : '';

        return `
            <div class="provider-card-v2">
                ${photoHtml}
                <div class="provider-card-body">
                    <div class="provider-card-top">
                        <div class="provider-name-row">
                            <h3 class="provider-name-v2">${escHtml(p.name)}</h3>
                            <div class="provider-badges-row">
                                ${openBadge}
                                ${verifiedHtml}
                            </div>
                        </div>
                        ${p.address ? `<p class="provider-address-v2">${escHtml(p.address)}</p>` : ''}
                        <div class="provider-rating-row">
                            ${p.rating ? `<span class="provider-stars-v2">${ratingStars} <strong>${p.rating.toFixed ? p.rating.toFixed(1) : p.rating}</strong></span>` : ''}
                            ${p.reviews ? `<span class="provider-reviews-v2">(${p.reviews.toLocaleString()})</span>` : ''}
                            ${p.distanceText ? `<span class="provider-distance-v2">${p.distanceText}</span>` : ''}
                        </div>
                        <div class="provider-tags-row">${tagsHtml}</div>
                    </div>
                    <div class="provider-actions-v2">
                        ${p.phone ? `<a href="tel:${p.phone.replace(/\D/g, '')}" class="provider-btn provider-btn-call">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                            Call
                        </a>` : ''}
                        ${p.mapsUrl ? `<a href="${p.mapsUrl}" target="_blank" rel="noopener" class="provider-btn provider-btn-details">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Google Maps
                        </a>` : ''}
                        ${p.website ? `<a href="${p.website}" target="_blank" rel="noopener" class="provider-btn provider-btn-website">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            Website
                        </a>` : ''}
                        ${p.phone ? `<a href="tel:${p.phone.replace(/\D/g, '')}" class="provider-btn provider-btn-quote">Get Quote</a>`
                        : `<button class="provider-btn provider-btn-quote">Get Quote</button>`}
                    </div>
                </div>
            </div>
        `;
    }

    function generateStars(rating) {
        const full = Math.floor(rating);
        const half = rating - full >= 0.3 ? 1 : 0;
        const empty = 5 - full - half;
        return '<span class="stars">'
            + '&#9733;'.repeat(full)
            + (half ? '&#9734;' : '')
            + '&#9734;'.repeat(Math.max(0, empty - (half ? 0 : 0)))
            + '</span>';
    }

    function renderRealProviders(providers, userLat, userLng) {
        if (listEl) {
            // Build Google Maps embed showing all provider locations
            let mapHtml = '';
            if (userLat && userLng && providers.length > 0) {
                // Use Google Maps Embed API with search to show area
                const center = `${userLat},${userLng}`;
                const apiKey = ''; // Will use static map with markers
                // Build an OpenStreetMap iframe as free alternative
                const bbox = getBBox(userLat, userLng, providers);
                mapHtml = `
                    <div class="providers-map-wrap">
                        <iframe class="providers-map"
                            src="https://www.google.com/maps?q=auto+repair&ll=${center}&z=13&output=embed"
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            allowfullscreen></iframe>
                    </div>
                `;
            }

            listEl.innerHTML = mapHtml + `<div class="providers-grid">${providers.map(p => buildProviderCard(p, true)).join('')}</div>`;
            listEl.hidden = false;

            // GA4: Track provider action clicks
            listEl.querySelectorAll('.provider-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.provider-card-v2');
                    const name = card?.querySelector('.provider-name-v2')?.textContent || '';
                    let action = 'quote';
                    if (btn.classList.contains('provider-btn-call')) action = 'call';
                    else if (btn.classList.contains('provider-btn-details')) action = 'maps';
                    else if (btn.classList.contains('provider-btn-website')) action = 'website';
                    if (typeof gtag === 'function') gtag('event', 'provider_clicked', {
                        provider_name: name, action_type: action
                    });
                });
            });
        }
    }

    function getBBox(lat, lng, providers) {
        let minLat = lat, maxLat = lat, minLng = lng, maxLng = lng;
        providers.forEach(p => {
            if (p.lat && p.lng) {
                minLat = Math.min(minLat, p.lat);
                maxLat = Math.max(maxLat, p.lat);
                minLng = Math.min(minLng, p.lng);
                maxLng = Math.max(maxLng, p.lng);
            }
        });
        return { minLat, maxLat, minLng, maxLng };
    }

    function renderNoLocation(category) {
        const searchQuery = category === 'auto' ? 'auto+repair+near+me' : 'home+repair+near+me';
        const searchLabel = category === 'auto' ? 'auto repair shops' : 'home service providers';
        if (listEl) {
            listEl.innerHTML = `
                <div class="providers-no-location">
                    <div class="providers-msg-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <h3>Couldn't detect your location</h3>
                    <p>We weren't able to determine your area automatically. You can search for ${searchLabel} directly on Google Maps.</p>
                    <div class="providers-msg-actions">
                        <a href="https://www.google.com/maps/search/${searchQuery}" target="_blank" rel="noopener" class="btn btn-accent">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Search on Google Maps
                        </a>
                        <button class="btn btn-ghost" onclick="location.reload()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                            Try Again
                        </button>
                    </div>
                </div>
            `;
            listEl.hidden = false;
        }
    }

    function renderNoResults(category) {
        const searchQuery = category === 'auto' ? 'auto+repair+near+me' : 'home+repair+near+me';
        const searchLabel = category === 'auto' ? 'auto repair shops' : 'home service providers';
        if (listEl) {
            listEl.innerHTML = `
                <div class="providers-no-location">
                    <div class="providers-msg-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <h3>No providers found nearby</h3>
                    <p>We couldn't find ${searchLabel} in your immediate area. Try searching on Google Maps to expand your search radius.</p>
                    <div class="providers-msg-actions">
                        <a href="https://www.google.com/maps/search/${searchQuery}" target="_blank" rel="noopener" class="btn btn-accent">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Search on Google Maps
                        </a>
                        <button class="btn btn-ghost" onclick="location.reload()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                            Try Again
                        </button>
                    </div>
                </div>
            `;
            listEl.hidden = false;
        }
    }
}

async function requestLocation() {
    // Strategy 1: Use browser geolocation ONLY if already granted (no prompts!)
    try {
        if (navigator.geolocation && navigator.permissions) {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            if (perm.state === 'granted') {
                const loc = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => resolve(null),
                        { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
                    );
                });
                if (loc) {
                    sessionStorage.setItem('ecostify_location', JSON.stringify(loc));
                    return loc;
                }
            }
        }
    } catch (e) { /* permissions API not supported, fall through */ }

    // Strategy 2: Silent IP-based geolocation (works on mobile + desktop, no prompts)
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timer);
        const data = await res.json();
        if (data.latitude && data.longitude) {
            const loc = { lat: data.latitude, lng: data.longitude };
            sessionStorage.setItem('ecostify_location', JSON.stringify(loc));
            return loc;
        }
    } catch (e) { /* IP lookup failed, fall through */ }

    return null;
}

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ────────────────────────────────────────
   Render Estimate (v2 — full advanced layout)
   ──────────────────────────────────────── */

function renderEstimate(data, estimate) {
    const loading = document.getElementById('loading');
    const content = document.getElementById('results-content');
    const badge = document.getElementById('result-badge');
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const card = document.getElementById('estimate-card');
    const photoWrap = document.getElementById('result-photo-wrap');
    const photo = document.getElementById('result-photo');

    // Reset loading state (important for resubmit flow)
    if (loading) loading.hidden = true;
    if (content) content.style.opacity = '1';

    badge.textContent = data.category === 'auto' ? 'Auto Services' : 'Home Services';
    badge.className = `badge ${data.category === 'auto' ? 'badge-auto' : 'badge-home'}`;

    title.textContent = estimate.title;
    subtitle.textContent = estimate.subtitle;

    if (data.photoData) {
        // Show all uploaded photos in a grid
        const allPhotos = [data.photoData];
        if (data.extraPhotos) allPhotos.push(...data.extraPhotos);

        if (allPhotos.length === 1) {
            photo.src = data.photoData;
            photoWrap.hidden = false;
        } else {
            // Replace single img with a photo grid
            photoWrap.innerHTML = `<div class="result-photos-grid">${allPhotos.map((p, i) =>
                `<img src="${p}" alt="Photo ${i + 1}" class="result-photo-thumb">`
            ).join('')}</div>`;
            photoWrap.hidden = false;
        }
    }

    // Build location label
    const locationLabel = data._locationLabel || '';

    // Build urgency badge
    const urgencyConfig = {
        high:   { icon: '&#9888;', label: 'Urgent', cls: 'urgency-high' },
        medium: { icon: '&#9679;', label: 'Moderate Priority', cls: 'urgency-medium' },
        low:    { icon: '&#10003;', label: 'No Rush', cls: 'urgency-low' }
    };
    const urg = urgencyConfig[estimate.urgency] || urgencyConfig.medium;

    // Build DIY badge
    const diyConfig = {
        yes:     { icon: '&#128736;', label: 'DIY Friendly', cls: 'diy-yes' },
        partial: { icon: '&#9881;', label: 'Partially DIY', cls: 'diy-partial' },
        no:      { icon: '&#128119;', label: 'Hire a Pro', cls: 'diy-no' }
    };
    const diy = diyConfig[estimate.diyFeasibility] || diyConfig.no;

    // Build price tiers HTML
    let tiersHtml = '';
    if (estimate.priceTiers) {
        const t = estimate.priceTiers;
        tiersHtml = `
            <div class="price-tiers">
                <div class="price-tier tier-budget">
                    <div class="tier-label">&#128176; Budget</div>
                    <div class="tier-range">${t.budget?.range || '—'}</div>
                    <div class="tier-desc">${t.budget?.description || ''}</div>
                </div>
                <div class="price-tier tier-mid">
                    <div class="tier-label">&#9878; Mid-Range</div>
                    <div class="tier-range">${t.midRange?.range || '—'}</div>
                    <div class="tier-desc">${t.midRange?.description || ''}</div>
                </div>
                <div class="price-tier tier-premium">
                    <div class="tier-label">&#10024; Premium</div>
                    <div class="tier-range">${t.premium?.range || '—'}</div>
                    <div class="tier-desc">${t.premium?.description || ''}</div>
                </div>
            </div>
        `;
    }

    // Build trust badge — dynamic based on data confidence
    let trustBadgeTitle = 'AI-Powered Estimate';
    let trustBadgeDesc = 'This estimate is generated by AI using national and regional pricing data. Always compare 2&#8211;3 quotes from local providers for the most accurate price.';
    let trustBadgeClass = '';

    if (estimate.confidence) {
        if (estimate.confidence.level === 'high') {
            trustBadgeTitle = 'Data-Backed Estimate';
            trustBadgeDesc = 'Calibrated with Bureau of Labor Statistics wage data and BEA regional price parities for ' + (locationLabel || 'your area') + '. Always compare 2&#8211;3 quotes from local providers.';
            trustBadgeClass = 'trust-badge-data-high';
        } else if (estimate.confidence.level === 'medium') {
            trustBadgeTitle = 'AI + Data Estimate';
            trustBadgeDesc = 'Enhanced with regional labor data. Results may vary based on project scope and local conditions. Compare 2&#8211;3 quotes for best accuracy.';
            trustBadgeClass = 'trust-badge-data-medium';
        }
    }

    const trustBadgeHtml = `
        <div class="trust-badge-strip ${trustBadgeClass}">
            <div class="trust-badge">
                <div class="trust-badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div class="trust-badge-text">
                    <span class="trust-badge-title">${trustBadgeTitle}</span>
                    <span class="trust-badge-desc">${trustBadgeDesc}</span>
                </div>
            </div>
            <div class="trust-stats">
                <div class="trust-stat">
                    <span class="trust-stat-num">150+</span>
                    <span class="trust-stat-label">Services covered</span>
                </div>
                <div class="trust-stat">
                    <span class="trust-stat-num">Free</span>
                    <span class="trust-stat-label">Always free</span>
                </div>
                <div class="trust-stat">
                    <span class="trust-stat-num">Instant</span>
                    <span class="trust-stat-label">AI results</span>
                </div>
            </div>
        </div>
    `;

    // Build confidence badge (only shown when data-backed pricing is available)
    let confidenceHtml = '';
    if (estimate.confidence) {
        const c = estimate.confidence;
        const badgeClass = c.level === 'high' ? 'confidence-high' : c.level === 'medium' ? 'confidence-medium' : 'confidence-low';
        const badgeIcon = c.level === 'high' ? '&#9989;' : c.level === 'medium' ? '&#9888;&#65039;' : '&#8505;&#65039;';
        confidenceHtml = `
            <div class="confidence-badge ${badgeClass}">
                <span class="confidence-icon">${badgeIcon}</span>
                <div class="confidence-text">
                    <strong>${c.label}</strong>
                    <span>${c.message}</span>
                </div>
                ${c.score ? '<div class="confidence-score">' + c.score + '<span>/100</span></div>' : ''}
            </div>`;
    }

    // Build city comparison teaser
    let comparisonHtml = '';
    if (estimate.cityComparison && locationLabel) {
        const diff = parseInt(estimate.cityComparison);
        if (diff !== 0) {
            const direction = diff > 0 ? 'more' : 'less';
            const compClass = diff > 0 ? 'comparison-higher' : 'comparison-lower';
            comparisonHtml = `<div class="city-comparison ${compClass}"><span class="comparison-arrow">${diff > 0 ? '&#9650;' : '&#9660;'}</span> ${Math.abs(diff)}% ${direction} than national average</div>`;
        }
    }

    // Build data source citation
    let citationHtml = '';
    if (estimate.dataSources && estimate.dataSources.length > 0) {
        citationHtml = `
            <div class="data-citation">
                <div class="citation-header">
                    <span class="citation-icon">&#128202;</span>
                    <span class="citation-label">Data Sources</span>
                </div>
                <div class="citation-body">
                    <p>${estimate.dataSources.join(' &middot; ')}</p>
                    ${estimate.localLaborRate ? '<p class="citation-rate">Local labor rate: <strong>$' + estimate.localLaborRate + '/hr</strong> median</p>' : ''}
                    ${estimate.dataYear ? '<span class="citation-year">' + estimate.dataYear + '</span>' : ''}
                </div>
            </div>`;
    }

    // Build cost breakdown HTML (simple bar chart)
    let breakdownHtml = '';
    if (estimate.costBreakdown && Array.isArray(estimate.costBreakdown) && estimate.costBreakdown.length > 0) {
        const colors = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--red)', '#a78bfa'];
        breakdownHtml = `
            <div class="estimate-detail">
                <h3><span class="detail-icon icon-tip">&#9636;</span> Where Your Money Goes</h3>
                <div class="cost-breakdown">
                    <div class="breakdown-bar">
                        ${estimate.costBreakdown.map((item, i) => `
                            <div class="breakdown-segment" style="width:${item.percentage}%; background:${colors[i % colors.length]}" title="${item.item}: ${item.percentage}%"></div>
                        `).join('')}
                    </div>
                    <div class="breakdown-legend">
                        ${estimate.costBreakdown.map((item, i) => `
                            <div class="legend-item">
                                <span class="legend-dot" style="background:${colors[i % colors.length]}"></span>
                                <span class="legend-label">${item.item}</span>
                                <span class="legend-pct">${item.percentage}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Build meta row (time estimate, best season)
    let metaHtml = '';
    if (estimate.timeEstimate || estimate.bestSeason) {
        metaHtml = `
            <div class="estimate-meta-row">
                ${estimate.timeEstimate ? `<div class="meta-chip"><span class="meta-icon">&#9202;</span> ${estimate.timeEstimate}</div>` : ''}
                ${estimate.bestSeason && estimate.bestSeason !== 'Any time' ? `<div class="meta-chip"><span class="meta-icon">&#9788;</span> Best: ${estimate.bestSeason}</div>` : ''}
            </div>
        `;
    }

    // Build detected info tag (filter out null/empty/"null" strings)
    let detectedHtml = '';
    const dv = estimate.detectedVehicle && estimate.detectedVehicle !== 'null' && estimate.detectedVehicle !== 'N/A' ? estimate.detectedVehicle : null;
    const dm = estimate.detectedMaterials && estimate.detectedMaterials !== 'null' && estimate.detectedMaterials !== 'N/A' ? estimate.detectedMaterials : null;
    if (dv || dm) {
        const items = [];
        if (dv) items.push(`<span class="detected-item">&#128663; ${dv}</span>`);
        if (dm) items.push(`<span class="detected-item">&#128269; ${dm}</span>`);
        detectedHtml = `<div class="detected-banner">${items.join('')}</div>`;
    }

    // Build tips HTML with icons instead of bullets
    const tipIcons = ['&#128161;', '&#128176;', '&#128197;', '&#9989;', '&#128270;'];
    const tipsHtml = estimate.tips.map((t, i) => `
        <div class="tip-item">
            <span class="tip-icon">${tipIcons[i % tipIcons.length]}</span>
            <span>${t}</span>
        </div>
    `).join('');

    // Build red flags HTML with icons
    const flagsHtml = estimate.redFlags.map(f => `
        <div class="flag-item">
            <span class="flag-icon">&#128308;</span>
            <span>${f}</span>
        </div>
    `).join('');

    // Build CTA button
    const ctaHtml = `
        <div class="estimate-cta">
            <a href="#providers-section" class="btn btn-accent btn-cta-providers" onclick="document.getElementById('providers-section').scrollIntoView({behavior:'smooth'});return false;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Compare Quotes from Local Pros
            </a>
        </div>
    `;

    card.innerHTML = `
        ${detectedHtml}
        <div class="estimate-price">
            <div class="label">Estimated Cost Range${locationLabel ? ` <span class="location-tag">&#128205; ${locationLabel}</span>` : ''}</div>
            <div class="range">${estimate.priceRange}</div>
            ${comparisonHtml}
        </div>

        ${tiersHtml}

        ${trustBadgeHtml}

        ${confidenceHtml}

        <div class="estimate-badges-row">
            <div class="estimate-badge ${urg.cls}">
                <span>${urg.icon}</span> ${urg.label}
            </div>
            <a href="#providers-section" class="estimate-badge ${diy.cls} badge-clickable" onclick="document.getElementById('providers-section').scrollIntoView({behavior:'smooth'});return false;" title="Scroll to providers">
                <span>${diy.icon}</span> ${diy.label}
            </a>
        </div>

        <div class="urgency-diy-notes">
            ${estimate.urgencyNote ? `<p class="note-item"><strong>Priority:</strong> ${estimate.urgencyNote}</p>` : ''}
            ${estimate.diyNote ? `<p class="note-item"><strong>DIY:</strong> ${estimate.diyNote}</p>` : ''}
        </div>

        ${metaHtml}

        <div class="estimate-detail">
            <h3><span class="detail-icon icon-tip">&#10003;</span> What's Likely Needed</h3>
            <p>${estimate.description}</p>
        </div>

        ${breakdownHtml}

        ${citationHtml}

        <div class="estimate-detail estimate-tips-section">
            <h3><span class="detail-icon icon-tip">&#9733;</span> Money-Saving Tips</h3>
            <div class="tips-grid">${tipsHtml}</div>
        </div>

        <div class="estimate-detail estimate-flags-section">
            <h3><span class="detail-icon icon-flag">&#9888;</span> Red Flags to Watch</h3>
            <div class="flags-list">${flagsHtml}</div>
        </div>

        ${ctaHtml}
    `;

    loading.hidden = true;
    content.hidden = false;

    // GA4: Track estimate generated
    if (typeof gtag === 'function') gtag('event', 'estimate_generated', {
        category: data.category, title: estimate.title,
        price_range: estimate.priceRange, has_photo: !!data.photoData,
        confidence: estimate.confidence?.level || 'none'
    });

    // Save to local history with result
    try {
        const history = JSON.parse(localStorage.getItem('ecostify_history') || '[]');
        if (history.length > 0) {
            history[0].title = estimate.title;
            history[0].priceRange = estimate.priceRange;
            localStorage.setItem('ecostify_history', JSON.stringify(history));
        }
    } catch(e) {}

    initEmailCapture(data, estimate);
    initFollowupChat(data, estimate);
    initScopingQuestions(data, estimate);
}

/* ────────────────────────────────────────
   Email Capture
   ──────────────────────────────────────── */

function initEmailCapture(data, estimate) {
    const form = document.getElementById('email-form');
    const input = document.getElementById('email-input');
    const success = document.getElementById('email-success');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = input?.value?.trim();
        if (!email) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        try {
            await fetch('/api/capture-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    category: data.category,
                    title: estimate.title,
                    priceRange: estimate.priceRange,
                    description: data.description || '',
                    timestamp: new Date().toISOString()
                })
            });
        } catch (err) {
            console.warn('Email capture error:', err.message);
        }

        form.hidden = true;
        if (success) success.hidden = false;
        sessionStorage.setItem('ecostify_email_captured', email);

        // GA4: Track email capture
        if (typeof gtag === 'function') gtag('event', 'email_captured', {
            category: data.category, service: estimate.title
        });
    });

    const alreadyCaptured = sessionStorage.getItem('ecostify_email_captured');
    if (alreadyCaptured) {
        form.hidden = true;
        if (success) success.hidden = false;
    }
}

/* ────────────────────────────────────────
   Follow-Up Chat
   ──────────────────────────────────────── */

function initFollowupChat(data, estimate) {
    const form = document.getElementById('followup-form');
    const input = document.getElementById('followup-input');
    const messagesEl = document.getElementById('followup-messages');

    if (!form || !input || !messagesEl) return;

    let chatCount = 0;
    const MAX_CHATS = 5;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = input.value.trim();
        if (!question) return;
        if (chatCount >= MAX_CHATS) {
            addMessage('system', 'You\'ve reached the follow-up limit. Start a new estimate for more questions.');
            return;
        }

        // Show user message
        addMessage('user', question);
        input.value = '';
        input.disabled = true;

        // Show typing indicator
        const typingId = addMessage('ai', '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>');

        try {
            const body = {
                question,
                category: data.category,
                originalEstimate: {
                    title: estimate.title,
                    priceRange: estimate.priceRange,
                    description: estimate.description
                }
            };

            // Add location if available
            if (data._locationLabel) {
                const parts = data._locationLabel.split(', ');
                if (parts.length >= 2) {
                    body.city = parts[0];
                    body.state = parts[1];
                }
            }

            const res = await fetch('/api/followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error(`API ${res.status}`);
            const result = await res.json();

            // Remove typing indicator
            removeMessage(typingId);

            // Build answer
            let answerHtml = result.answer || 'Sorry, I couldn\'t process that question.';
            if (result.updatedRange) {
                answerHtml += `<div class="followup-updated-range">Updated estimate: <strong>${result.updatedRange}</strong></div>`;
            }
            if (result.quickTip) {
                answerHtml += `<div class="followup-tip"><strong>Tip:</strong> ${result.quickTip}</div>`;
            }

            addMessage('ai', answerHtml);
            chatCount++;

            // GA4: Track followup chat
            if (typeof gtag === 'function') gtag('event', 'followup_sent', {
                chat_number: chatCount, category: data.category
            });

        } catch (err) {
            removeMessage(typingId);
            addMessage('ai', 'Sorry, I couldn\'t answer that right now. Try rephrasing your question.');
            console.warn('Followup error:', err.message);
        }

        input.disabled = false;
        input.focus();

        // Update placeholder after first question
        if (chatCount === 1) {
            input.placeholder = 'Ask another question...';
        }
        if (chatCount >= MAX_CHATS) {
            input.placeholder = 'Follow-up limit reached';
            input.disabled = true;
            form.querySelector('button').disabled = true;
        }
    });

    let msgIdCounter = 0;

    function addMessage(role, html) {
        const id = `msg-${++msgIdCounter}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = `followup-msg followup-${role}`;
        div.innerHTML = html;
        messagesEl.appendChild(div);
        // Scroll into view
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

/* ────────────────────────────────────────
   Local Fallback Estimate (v2 — includes new fields)
   ──────────────────────────────────────── */

function generateLocalEstimate(category, description) {
    const desc = (description || '').toLowerCase();

    // Default new fields for all fallback estimates
    const defaults = {
        priceTiers: null,
        costBreakdown: null,
        urgency: 'medium',
        urgencyNote: 'Schedule within the next few weeks for best results.',
        diyFeasibility: 'no',
        diyNote: 'We recommend getting a professional assessment.',
        timeEstimate: null,
        bestSeason: null
    };

    if (category === 'auto') {
        if (desc.includes('brake') || desc.includes('grinding') || desc.includes('squealing')) {
            return { ...defaults, title: 'Brake Pad Replacement', subtitle: 'Based on your description, this appears to be a brake system issue.', priceRange: '$150 — $400',
                priceTiers: { budget: { range: '$150 — $200', description: 'Economy pads, single axle' }, midRange: { range: '$250 — $350', description: 'Ceramic pads, both axles' }, premium: { range: '$400 — $600', description: 'OEM pads + rotor resurfacing' } },
                costBreakdown: [{ item: 'Parts', percentage: 40 }, { item: 'Labor', percentage: 55 }, { item: 'Shop fees', percentage: 5 }],
                urgency: 'high', urgencyNote: 'Grinding brakes are a safety hazard — address within 1-2 days.',
                diyFeasibility: 'partial', diyNote: 'Experienced DIYers can save $100-200 on labor. Requires jack stands and basic tools.',
                timeEstimate: '1-2 hours', bestSeason: 'Any time',
                description: 'Worn brake pads typically need replacement. If rotors are scored, they may need resurfacing or replacement too.',
                tips: ['Get quotes from at least 2-3 shops', 'Ask if rotors need resurfacing', 'OEM pads last longer but ceramic aftermarket pads work well', 'Most shops offer free brake inspections'],
                redFlags: ['Being told all 4 rotors need replacement without proof', 'Quotes over $600 for basic pad replacement', 'Pressure to do the work immediately'] };
        }
        if (desc.includes('wrap') || desc.includes('vinyl')) {
            return { ...defaults, title: 'Vehicle Wrap', subtitle: 'Full or partial vinyl wrap for your vehicle.', priceRange: '$500 — $6,000',
                priceTiers: { budget: { range: '$500 — $1,500', description: 'Partial wrap (roof, hood, mirrors)' }, midRange: { range: '$2,000 — $3,500', description: 'Full wrap, standard vinyl' }, premium: { range: '$4,000 — $6,000+', description: 'Full wrap, premium vinyl (3M, Avery), color-shift or specialty finish' } },
                costBreakdown: [{ item: 'Vinyl material', percentage: 35 }, { item: 'Labor', percentage: 55 }, { item: 'Surface prep', percentage: 10 }],
                urgency: 'low', urgencyNote: 'Cosmetic upgrade — schedule at your convenience.',
                diyFeasibility: 'partial', diyNote: 'Small sections (mirrors, roof) are DIY-able with patience. Full wraps require professional skill.',
                timeEstimate: '2-5 days', bestSeason: 'Spring or fall (moderate temps help adhesion)',
                description: 'Vehicle wrap costs depend on vehicle size, vinyl quality, and design complexity. Full wraps on sedans are less than trucks/SUVs.',
                tips: ['Ask to see a portfolio of completed wraps', '3M and Avery Dennison are the top vinyl brands', 'A good wrap lasts 5-7 years', 'Color-change wraps are cheaper than custom-designed graphics'],
                redFlags: ['Shops unwilling to show past work', 'Prices under $1,500 for a full wrap — likely low-quality vinyl', 'No warranty offered on the wrap'] };
        }
        return { ...defaults, title: 'Auto Service Estimate', subtitle: 'Here\'s what you should expect.', priceRange: '$100 — $500',
            description: 'Repair costs vary. A proper diagnostic will narrow the issue and cost.',
            tips: ['Get 2-3 quotes before committing', 'Ask for itemized estimates (parts vs. labor)', 'Check online reviews for mechanics', 'Don\'t feel pressured to decide on the spot'],
            redFlags: ['Shops that won\'t give written estimates', 'New problems "found" after approving initial work', 'Labor rates over $180/hour at non-dealership'] };
    }

    // Home fallbacks
    if (desc.includes('kitchen') || desc.includes('remodel')) {
        return { ...defaults, title: 'Kitchen Remodel', subtitle: 'Cost estimate for your kitchen renovation.', priceRange: '$5,000 — $80,000',
            priceTiers: { budget: { range: '$5,000 — $15,000', description: 'Cosmetic refresh: paint, hardware, backsplash' }, midRange: { range: '$25,000 — $50,000', description: 'New counters, cabinets, appliances, flooring' }, premium: { range: '$60,000 — $100,000+', description: 'Full gut renovation with layout changes' } },
            costBreakdown: [{ item: 'Cabinets', percentage: 30 }, { item: 'Labor', percentage: 25 }, { item: 'Appliances', percentage: 18 }, { item: 'Countertops', percentage: 12 }, { item: 'Other', percentage: 15 }],
            urgency: 'low', urgencyNote: 'Plan carefully — a well-planned remodel avoids costly changes mid-project.',
            diyFeasibility: 'partial', diyNote: 'Demo, painting, and backsplash are DIY-able. Plumbing, electrical, and countertops need pros.',
            timeEstimate: '6-12 weeks', bestSeason: 'Late fall or winter (contractors are less busy, better pricing)',
            description: 'Kitchen remodel costs depend on scope, materials, and whether you\'re changing the layout. Keeping plumbing in place saves thousands.',
            tips: ['Keep the existing layout to save $3,000-$8,000 in plumbing', 'Cabinet refacing saves 40-50% vs new cabinets', 'Shop appliance sales on Black Friday and Memorial Day', 'Get 3-5 detailed quotes and compare line by line'],
            redFlags: ['Asking for more than 30% upfront', 'No written contract with detailed scope', 'Unusually low bid (often means cut corners)', 'Unwilling to pull permits for electrical/plumbing work'] };
    }

    return { ...defaults, title: 'Home Service Estimate', subtitle: 'Here\'s what you should expect.', priceRange: '$100 — $500',
        description: 'Home repair costs vary. A contractor can provide a more accurate estimate on-site.',
        tips: ['Get 2-3 quotes from licensed, insured contractors', 'Ask for references and check reviews', 'Get scope, timeline, and cost in writing', 'Never pay more than 30% upfront'],
        redFlags: ['No written estimate provided', 'Full payment before starting', 'No proof of license or insurance', 'Pressure to sign immediately'] };
}

/* ────────────────────────────────────────
   Scoping Questionnaire — narrows estimate
   ──────────────────────────────────────── */

function initScopingQuestions(data, estimate) {
    const section = document.getElementById('scoping-section');
    const container = document.getElementById('scoping-questions');
    const resultEl = document.getElementById('scoping-result');

    if (!section || !container || !resultEl) return;

    // If returning from a refined estimate, hide scoping and show badge
    const isRefined = sessionStorage.getItem('ecostify_refined');
    if (isRefined) {
        sessionStorage.removeItem('ecostify_refined');
        section.hidden = true;
        // Insert "Refined estimate" badge at top of estimate card
        const card = document.querySelector('.estimate-card');
        if (card) {
            const badge = document.createElement('div');
            badge.className = 'refined-badge';
            badge.innerHTML = '<span>&#10024;</span> Refined estimate based on your selections';
            card.insertBefore(badge, card.firstChild);
        }
        return;
    }

    const t = (estimate.title || '').toLowerCase();

    // Define question sets keyed by service type
    const questionSets = {
        brake: [
            { title: 'Which axle needs work?', options: ['Front only', 'Rear only', 'All four wheels'] },
            { title: 'Pad quality preference?', options: ['Economy (semi-metallic)', 'Mid-range (ceramic)', 'OEM/Premium'] },
            { title: 'Do your rotors need work?', options: ['Just pads', 'Pads + resurface', 'Pads + new rotors'] }
        ],
        oil: [
            { title: 'Oil type?', options: ['Conventional', 'Synthetic blend', 'Full synthetic'] },
            { title: 'Where do you want it done?', options: ['Quick lube (Jiffy, Valvoline)', 'Independent mechanic', 'Dealership', 'DIY'] }
        ],
        wrap: [
            { title: 'Wrap coverage?', options: ['Partial (hood/roof)', 'Full body wrap', 'Commercial/fleet'] },
            { title: 'Finish type?', options: ['Gloss', 'Matte/Satin', 'Chrome/Specialty'] },
            { title: 'Vehicle size?', options: ['Sedan/Coupe', 'SUV/Truck', 'Van/Large vehicle'] }
        ],
        kitchen: [
            { title: 'Remodel scope?', options: ['Cosmetic refresh', 'Mid-range update', 'Full gut renovation'] },
            { title: 'Kitchen size?', options: ['Small (< 100 sq ft)', 'Medium (100-200 sq ft)', 'Large (200+ sq ft)'] },
            { title: 'Keeping current layout?', options: ['Yes, same layout', 'Minor changes', 'Complete redesign'] }
        ],
        bathroom: [
            { title: 'Bathroom type?', options: ['Half bath', 'Full bath', 'Master suite'] },
            { title: 'Remodel scope?', options: ['Cosmetic update', 'Full remodel', 'Gut renovation'] }
        ],
        roof: [
            { title: 'Roofing material?', options: ['Asphalt shingles', 'Metal', 'Tile/Slate'] },
            { title: 'Roof size?', options: ['Small (< 1,500 sq ft)', 'Medium (1,500-2,500)', 'Large (2,500+)'] },
            { title: 'Current condition?', options: ['Repair needed', 'Full replacement', 'Storm damage (insurance)'] }
        ],
        hvac: [
            { title: 'System type?', options: ['Central AC only', 'Furnace only', 'AC + Furnace bundle', 'Heat pump'] },
            { title: 'Home size?', options: ['Under 1,500 sq ft', '1,500-2,500 sq ft', 'Over 2,500 sq ft'] }
        ],
        painting: [
            { title: 'How many rooms?', options: ['1-2 rooms', '3-5 rooms', 'Whole house'] },
            { title: 'Paint quality?', options: ['Builder grade', 'Mid-range (Behr, Valspar)', 'Premium (Ben Moore, Sherwin)'] }
        ],
        flooring: [
            { title: 'Flooring type?', options: ['Hardwood', 'LVP/Vinyl plank', 'Tile', 'Carpet'] },
            { title: 'Area to cover?', options: ['Single room', 'Multiple rooms', 'Whole house'] }
        ],
        generalAuto: [
            { title: 'Vehicle type?', options: ['Sedan/Coupe', 'SUV/Truck', 'Luxury/European'] },
            { title: 'Where?', options: ['Independent shop', 'Dealership', 'Chain (Midas, Firestone)'] }
        ],
        generalHome: [
            { title: 'Project urgency?', options: ['Emergency', 'Within 2 weeks', 'Flexible timeline'] },
            { title: 'Property type?', options: ['Single family home', 'Condo/Townhome', 'Multi-unit'] }
        ]
    };

    // Detect which question set to use based on keywords in the title
    let questions = null;

    if (t.includes('brake') || t.includes('grinding') || t.includes('rotor')) {
        questions = questionSets.brake;
    } else if (t.includes('oil change') || t.includes('oil filter')) {
        questions = questionSets.oil;
    } else if (t.includes('wrap') || t.includes('vinyl')) {
        questions = questionSets.wrap;
    } else if (t.includes('kitchen')) {
        questions = questionSets.kitchen;
    } else if (t.includes('bathroom') || t.includes('bath remodel')) {
        questions = questionSets.bathroom;
    } else if (t.includes('roof')) {
        questions = questionSets.roof;
    } else if (t.includes('hvac') || t.includes('furnace') || t.includes('air condition') || t.includes('heat pump')) {
        questions = questionSets.hvac;
    } else if (t.includes('paint') || t.includes('interior paint')) {
        questions = questionSets.painting;
    } else if (t.includes('floor') || t.includes('hardwood') || t.includes('tile') || t.includes('carpet') || t.includes('vinyl plank')) {
        questions = questionSets.flooring;
    } else if (data.category === 'auto') {
        questions = questionSets.generalAuto;
    } else {
        questions = questionSets.generalHome;
    }

    if (!questions || questions.length === 0) return;

    // Track answers
    const answers = [];

    // Render the first question
    renderQuestion(0);

    // Show the section
    section.hidden = false;

    function renderQuestion(index) {
        const q = questions[index];
        const qDiv = document.createElement('div');
        qDiv.className = 'scoping-q';
        qDiv.setAttribute('data-q', index);

        const titleP = document.createElement('p');
        titleP.className = 'scoping-q-title';
        titleP.textContent = q.title;
        qDiv.appendChild(titleP);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'scoping-options';

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'scoping-opt';
            btn.setAttribute('data-value', opt);
            btn.textContent = opt;
            btn.addEventListener('click', () => handleOptionClick(btn, index, opt));
            optionsDiv.appendChild(btn);
        });

        qDiv.appendChild(optionsDiv);
        container.appendChild(qDiv);
    }

    function handleOptionClick(btn, qIndex, value) {
        // Mark selected, deselect siblings
        const siblings = btn.parentElement.querySelectorAll('.scoping-opt');
        siblings.forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');

        // Store / update answer
        answers[qIndex] = value;

        // After a short delay, show next question or final result
        setTimeout(() => {
            const nextIndex = qIndex + 1;

            // Remove any already-rendered future questions (in case user re-taps an earlier answer)
            const existing = container.querySelectorAll('.scoping-q');
            existing.forEach(el => {
                const idx = parseInt(el.getAttribute('data-q'), 10);
                if (idx > qIndex) el.remove();
            });
            // Trim future answers
            answers.length = nextIndex;

            if (nextIndex < questions.length) {
                renderQuestion(nextIndex);
                // Hide result if previously shown
                resultEl.hidden = true;
            } else {
                showResult();
            }
        }, 300);
    }

    function showResult() {
        const answersStr = answers.join(' \u00B7 ');

        // GA4: Track scoping completed
        if (typeof gtag === 'function') gtag('event', 'scoping_answered', {
            service: estimate.title, answers: answersStr
        });

        // Build scoping detail string with question titles for context
        const scopingDetails = questions.map((q, i) => `${q.title.replace('?','')} ${answers[i]}`).join('. ');

        resultEl.innerHTML = `
            <div class="scoping-result-inner">
                <div class="scoping-result-icon">&#9989;</div>
                <div class="scoping-result-text">
                    <p class="scoping-result-label">Your selections</p>
                    <p class="scoping-result-answers">${escHtml(answersStr)}</p>
                </div>
                <p class="scoping-result-hint">These details help providers give you a more accurate quote.</p>
            </div>
            <button class="btn btn-accent btn-update-estimate" id="btn-update-estimate">
                &#8635; Update My Estimate
            </button>
        `;
        resultEl.hidden = false;

        // Wire up resubmit button
        const resubmitBtn = document.getElementById('btn-update-estimate');
        if (resubmitBtn) {
            resubmitBtn.addEventListener('click', () => {
                // Build enhanced description with scoping answers
                const enhancedDesc = `${data.description || estimate.title}. Scope details: ${scopingDetails}`;
                const modifiedData = { ...data, description: enhancedDesc };

                // Set refined flag so scoping hides on reload
                sessionStorage.setItem('ecostify_refined', 'true');

                // Show loading state
                const resultsContent = document.getElementById('results-content');
                const loading = document.getElementById('loading');
                const loadingText = loading?.querySelector('p');
                if (resultsContent) resultsContent.style.opacity = '0.3';
                if (loading) {
                    loading.hidden = false;
                    if (loadingText) loadingText.textContent = 'Refining your estimate with your selections...';
                }

                // Re-run the full estimate
                fetchAIEstimate(modifiedData);
            });
        }

        // Scroll result into view
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Save to sessionStorage for provider reference
        try {
            sessionStorage.setItem('ecostify_scoping', JSON.stringify({
                service: estimate.title,
                answers: answers,
                scopingDetails: scopingDetails,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {}
    }
}
