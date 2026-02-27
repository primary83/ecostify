/* ========================================
   Ecostify — Main App JS (v2)
   Multi-photo upload (up to 4),
   drag & drop, camera/gallery buttons,
   auto location detection, mobile menu
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ── Proactive location detection (silent, no prompts) ──
    let userLocation = null;

    function detectLocation() {
        const cached = sessionStorage.getItem('ecostify_location');
        if (cached) { userLocation = JSON.parse(cached); return; }

        // Strategy 1: Browser geolocation (if already permitted — no new prompts)
        if (navigator.geolocation && navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(perm => {
                if (perm.state === 'granted') {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            sessionStorage.setItem('ecostify_location', JSON.stringify(userLocation));
                        },
                        () => {},
                        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
                    );
                }
            }).catch(() => {});
        }

        // Strategy 2: IP-based geolocation (silent, no permission needed)
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(d => {
                if (d.latitude && d.longitude && !userLocation) {
                    userLocation = { lat: d.latitude, lng: d.longitude };
                    sessionStorage.setItem('ecostify_location', JSON.stringify(userLocation));
                }
            })
            .catch(() => {});
    }
    detectLocation();

    // ── Mobile menu toggle ──
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => navLinks.classList.remove('open'))
        );
    }

    // ── Detect mobile ──
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || ('ontouchstart' in window)
        || (window.innerWidth <= 768);

    // ── Animated stat counters ──
    function animateCounters() {
        document.querySelectorAll('.stat-num[data-count]').forEach(el => {
            if (el._animated) return;
            const target = parseInt(el.dataset.count);
            const duration = 1600;
            const startTime = performance.now();
            el._animated = true;
            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = current.toLocaleString() + '+';
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    const statsSection = document.querySelector('.stats-strip');
    if (statsSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { animateCounters(); observer.disconnect(); }
        }, { threshold: 0.3 });
        observer.observe(statsSection);
    } else {
        animateCounters();
    }

    // ── Activity ticker — duplicate items for seamless loop ──
    const ticker = document.getElementById('ticker-track');
    if (ticker) {
        ticker.innerHTML += ticker.innerHTML; // double the content for seamless scroll
    }

    // ── Service pickers ──
    setupServicePicker('auto');
    setupServicePicker('home');

    function setupServicePicker(category) {
        const picker = document.getElementById(`${category}-service-picker`);
        if (!picker) return;

        const tabs = picker.querySelectorAll('.picker-tab');
        const groups = picker.querySelectorAll('.chip-group');
        const chips = picker.querySelectorAll('.chip-service');
        const textarea = document.getElementById(`${category}-desc`);

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const groupName = tab.dataset.group;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                groups.forEach(g => {
                    g.classList.toggle('active', g.dataset.group === groupName);
                });
            });
        });

        // Chip selection → fills textarea
        chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                // Deselect all chips across all groups
                chips.forEach(c => c.classList.remove('selected'));
                // Select this chip
                chip.classList.add('selected');
                // Fill the textarea with the service description
                if (textarea) {
                    textarea.value = chip.dataset.service;
                    textarea.focus();
                }
            });
        });

        // If user types in textarea, deselect chips
        if (textarea) {
            textarea.addEventListener('input', () => {
                const val = textarea.value.trim();
                // Only deselect if the text doesn't match any chip
                const matchingChip = Array.from(chips).find(c => c.dataset.service === val);
                if (!matchingChip) {
                    chips.forEach(c => c.classList.remove('selected'));
                }
            });
        }
    }

    // ── Upload zones ──
    setupUploadZone('auto');
    setupUploadZone('home');

    function setupUploadZone(category) {
        const zone = document.getElementById(`${category}-upload-zone`);
        const cameraInput = document.getElementById(`${category}-photo`);
        const galleryInput = document.getElementById(`${category}-photo-gallery`);
        const placeholder = zone?.querySelector('.upload-placeholder');
        const previewGrid = zone?.querySelector('.upload-preview-grid');
        const thumbsContainer = document.getElementById(`${category}-thumbs`);
        const addMoreBtn = document.getElementById(`${category}-add-more`);
        const cameraBtn = zone?.querySelector('.btn-upload-camera');
        const galleryBtn = zone?.querySelector('.btn-upload-gallery');

        if (!zone || !cameraInput) return;

        // Store photos as base64 array (max 4)
        const MAX_PHOTOS = 4;
        zone._photos = []; // array of { dataUrl: string }
        zone._addingMode = 'camera'; // track which input triggered "add more"

        // ── Camera button ──
        if (cameraBtn) {
            cameraBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone._addingMode = 'camera';
                cameraInput.value = '';
                cameraInput.click();
            });
        }

        // ── Gallery button ──
        if (galleryBtn && galleryInput) {
            galleryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone._addingMode = 'gallery';
                galleryInput.value = '';
                galleryInput.click();
            });
        }

        // ── Add more button (in preview state) ──
        if (addMoreBtn) {
            addMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (zone._photos.length >= MAX_PHOTOS) return;
                if (isMobile) {
                    // On mobile, default to camera for "add more"
                    zone._addingMode = 'camera';
                    cameraInput.value = '';
                    cameraInput.click();
                } else {
                    zone._addingMode = 'gallery';
                    galleryInput ? galleryInput.click() : cameraInput.click();
                }
            });
        }

        // ── Desktop zone click ──
        zone.addEventListener('click', (e) => {
            if (e.target.closest('.upload-remove-thumb')) return;
            if (e.target.closest('.btn-upload-camera')) return;
            if (e.target.closest('.btn-upload-gallery')) return;
            if (e.target.closest('.btn-add-photo')) return;
            // Only trigger on placeholder state
            if (zone._photos.length === 0 && !isMobile) {
                zone._addingMode = 'gallery';
                (galleryInput || cameraInput).click();
            }
        });

        // ── File selected from camera ──
        cameraInput.addEventListener('change', () => {
            if (cameraInput.files && cameraInput.files[0]) {
                addPhoto(cameraInput.files[0]);
            }
        });

        // ── File selected from gallery ──
        if (galleryInput) {
            galleryInput.addEventListener('change', () => {
                if (galleryInput.files && galleryInput.files[0]) {
                    addPhoto(galleryInput.files[0]);
                }
            });
        }

        // ── Drag & drop ──
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (e.dataTransfer.files) {
                // Accept multiple dropped files up to MAX_PHOTOS
                const files = Array.from(e.dataTransfer.files).slice(0, MAX_PHOTOS - zone._photos.length);
                files.forEach(f => addPhoto(f));
            }
        });

        function addPhoto(file) {
            if (zone._photos.length >= MAX_PHOTOS) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                zone._photos.push({ dataUrl: e.target.result });
                renderThumbs();
                if (typeof gtag === 'function') gtag('event', 'photo_uploaded', {
                    category: category, photo_count: zone._photos.length
                });
            };
            reader.readAsDataURL(file);
        }

        function removePhoto(index) {
            zone._photos.splice(index, 1);
            if (zone._photos.length === 0) {
                // Back to placeholder state
                placeholder.hidden = false;
                previewGrid.hidden = true;
            } else {
                renderThumbs();
            }
        }

        function renderThumbs() {
            placeholder.hidden = true;
            previewGrid.hidden = false;

            thumbsContainer.innerHTML = zone._photos.map((photo, i) => `
                <div class="preview-thumb">
                    <img src="${photo.dataUrl}" alt="Photo ${i + 1}">
                    <button type="button" class="upload-remove-thumb" data-index="${i}">&times;</button>
                    <span class="thumb-number">${i + 1}</span>
                </div>
            `).join('');

            // Show/hide "add more" button
            if (addMoreBtn) {
                addMoreBtn.hidden = zone._photos.length >= MAX_PHOTOS;
            }

            // Wire up remove buttons
            thumbsContainer.querySelectorAll('.upload-remove-thumb').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removePhoto(parseInt(btn.dataset.index));
                });
            });
        }
    }

    // ── Form submission ──
    document.querySelectorAll('.estimate-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = form.dataset.category;
            const textarea = form.querySelector('textarea');
            const zone = document.getElementById(`${category}-upload-zone`);
            const description = textarea?.value?.trim();
            const photos = zone?._photos || [];
            const hasPhotos = photos.length > 0;

            if (!description && !hasPhotos) {
                if (zone) {
                    zone.style.borderColor = '#f87171';
                    setTimeout(() => { zone.style.borderColor = ''; }, 2000);
                }
                if (textarea) {
                    textarea.focus();
                    textarea.style.borderColor = '#f87171';
                    setTimeout(() => { textarea.style.borderColor = ''; }, 2000);
                }
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.49-8.49l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51"/></svg>
                    Analyzing${hasPhotos ? ` ${photos.length} photo${photos.length > 1 ? 's' : ''}` : ''}...`;
            }

            // Build data
            const data = {
                category,
                description: description || '',
                hasPhoto: hasPhotos,
                photoCount: photos.length,
                timestamp: Date.now()
            };

            // Attach location
            const cachedLoc = sessionStorage.getItem('ecostify_location');
            if (cachedLoc) {
                data.location = JSON.parse(cachedLoc);
            } else if (userLocation) {
                data.location = userLocation;
            }

            // Attach photo data (first photo as primary, extras as additional)
            if (hasPhotos) {
                data.photoData = photos[0].dataUrl;
                if (photos.length > 1) {
                    data.extraPhotos = photos.slice(1).map(p => p.dataUrl);
                }
            }

            // GA4: Track estimate request
            if (typeof gtag === 'function') gtag('event', 'estimate_requested', {
                category: data.category, has_photo: data.hasPhoto,
                photo_count: data.photoCount, has_description: !!data.description
            });

            function saveAndGo() {
                sessionStorage.setItem('ecostify_estimate', JSON.stringify(data));
                // Save to local estimate history
                try {
                    const history = JSON.parse(localStorage.getItem('ecostify_history') || '[]');
                    history.unshift({
                        category,
                        description: description || 'Photo analysis',
                        timestamp: Date.now()
                    });
                    // Keep last 20
                    localStorage.setItem('ecostify_history', JSON.stringify(history.slice(0, 20)));
                } catch(e) {}
                window.location.href = '/estimate.html';
            }

            // Get location silently if we don't have it (IP fallback, no prompts)
            if (!data.location) {
                fetch('https://ipapi.co/json/')
                    .then(r => r.json())
                    .then(d => {
                        if (d.latitude && d.longitude) {
                            data.location = { lat: d.latitude, lng: d.longitude };
                            sessionStorage.setItem('ecostify_location', JSON.stringify(data.location));
                        }
                        saveAndGo();
                    })
                    .catch(() => saveAndGo());
            } else {
                saveAndGo();
            }
        });
    });

});
