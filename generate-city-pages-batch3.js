#!/usr/bin/env node
/* ============================================================
   Ecostify — City Service Page Generator (Batch 3)
   Generates 80 static HTML pages: 5 cities × 16 services
   + 5 city index pages = 85 pages total
   Uses BLS OEWS wage data + FRED RPP cost-of-living multipliers
   Formula: (Local Hourly Wage × Labor Hours) + (National Avg Parts × RPP Multiplier)
   ============================================================ */

const fs = require('fs');
const path = require('path');

// ── Batch 1 cities (for cross-linking) ──────────────────────
const BATCH1_CITIES = [
    { slug: 'houston',        name: 'Houston',        state: 'TX' },
    { slug: 'los-angeles',    name: 'Los Angeles',    state: 'CA' },
    { slug: 'chicago',        name: 'Chicago',        state: 'IL' },
    { slug: 'phoenix',        name: 'Phoenix',        state: 'AZ' },
    { slug: 'philadelphia',   name: 'Philadelphia',   state: 'PA' },
    { slug: 'san-antonio',    name: 'San Antonio',    state: 'TX' },
    { slug: 'dallas',         name: 'Dallas',         state: 'TX' },
    { slug: 'san-diego',      name: 'San Diego',      state: 'CA' },
    { slug: 'denver',         name: 'Denver',         state: 'CO' },
    { slug: 'miami',          name: 'Miami',          state: 'FL' },
];

// ── Batch 2 cities (for cross-linking) ──────────────────────
const BATCH2_CITIES = [
    { slug: 'new-york',       name: 'New York',       state: 'NY' },
    { slug: 'atlanta',        name: 'Atlanta',        state: 'GA' },
    { slug: 'seattle',        name: 'Seattle',        state: 'WA' },
    { slug: 'tampa',          name: 'Tampa',          state: 'FL' },
    { slug: 'minneapolis',    name: 'Minneapolis',    state: 'MN' },
    { slug: 'charlotte',      name: 'Charlotte',      state: 'NC' },
    { slug: 'las-vegas',      name: 'Las Vegas',      state: 'NV' },
    { slug: 'austin',         name: 'Austin',         state: 'TX' },
    { slug: 'nashville',      name: 'Nashville',      state: 'TN' },
    { slug: 'portland',       name: 'Portland',       state: 'OR' },
];

// ── 5 New Target Cities (metro areas) ────────────────────────
const CITIES = [
    { slug: 'san-jose',       name: 'San Jose',       state: 'CA', metro: 'San Jose-Sunnyvale-Santa Clara',        pop: '2.0M' },
    { slug: 'jacksonville',   name: 'Jacksonville',   state: 'FL', metro: 'Jacksonville',                          pop: '1.6M' },
    { slug: 'indianapolis',   name: 'Indianapolis',   state: 'IN', metro: 'Indianapolis-Carmel-Anderson',          pop: '2.1M' },
    { slug: 'columbus',       name: 'Columbus',       state: 'OH', metro: 'Columbus',                              pop: '2.1M' },
    { slug: 'san-francisco',  name: 'San Francisco',  state: 'CA', metro: 'San Francisco-Oakland-Berkeley',        pop: '4.7M' },
];

// All cities combined for cross-linking
const ALL_CITIES = [...BATCH1_CITIES, ...BATCH2_CITIES, ...CITIES];

// ── BLS OEWS Hourly Mean Wages by Metro × Occupation ────────
// Source: BLS Occupational Employment & Wage Statistics (May 2024)
// SOC codes: 49-3023 (Auto Mechanics), 47-2152 (Plumbers), 47-2111 (Electricians),
//            49-9021 (HVAC), 49-9071 (Maintenance), 47-2181 (Roofers),
//            47-2141 (Painters), 47-2031 (Carpenters)
const WAGES = {
    'san-jose':      { autoMech: 32.40, plumber: 39.80, electrician: 44.20, hvac: 34.80, maintenance: 29.10, roofer: 29.60, painter: 28.90, carpenter: 36.40 },
    jacksonville:    { autoMech: 23.40, plumber: 26.80, electrician: 27.40, hvac: 24.90, maintenance: 20.60, roofer: 19.50, painter: 19.90, carpenter: 23.20 },
    indianapolis:    { autoMech: 24.20, plumber: 28.60, electrician: 29.80, hvac: 26.10, maintenance: 21.50, roofer: 20.80, painter: 21.00, carpenter: 24.90 },
    columbus:        { autoMech: 24.50, plumber: 28.20, electrician: 29.40, hvac: 25.80, maintenance: 21.30, roofer: 20.40, painter: 20.80, carpenter: 24.60 },
    'san-francisco': { autoMech: 33.10, plumber: 41.60, electrician: 46.80, hvac: 36.20, maintenance: 30.40, roofer: 31.20, painter: 30.10, carpenter: 38.20 },
};

// ── FRED Regional Price Parities (RPP) ─────────────────────
// Source: Bureau of Economic Analysis via FRED (2023 data, latest available)
// RPP = percentage of national average cost of goods/services (100 = national avg)
const RPP = {
    'san-jose':      120.5,
    jacksonville:    97.3,
    indianapolis:    93.1,
    columbus:        93.8,
    'san-francisco': 122.8,
};

// ── 16 Services (8 Auto + 8 Home) ──────────────────────────
const SERVICES = [
    // ─── AUTO SERVICES ───
    {
        slug: 'brake-pad-replacement',
        name: 'Brake Pad Replacement',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 1,
        laborHoursHigh: 2,
        partsNationalLow: 80,
        partsNationalHigh: 250,
        shortDesc: 'front and rear brake pad replacement',
        icon: '\u{1F527}',
        relatedBlog: '/blog/brake-pad-replacement-cost',
    },
    {
        slug: 'oil-change',
        name: 'Oil Change',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 0.5,
        laborHoursHigh: 1,
        partsNationalLow: 25,
        partsNationalHigh: 90,
        shortDesc: 'conventional and synthetic oil change service',
        icon: '\u{1F6E2}\uFE0F',
        relatedBlog: '/blog/oil-change-cost',
    },
    {
        slug: 'car-wrap',
        name: 'Full Car Wrap',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 15,
        laborHoursHigh: 40,
        partsNationalLow: 800,
        partsNationalHigh: 3000,
        shortDesc: 'full vehicle vinyl wrap',
        icon: '\u{1F3A8}',
        relatedBlog: '/blog/how-much-does-a-car-wrap-cost',
    },
    {
        slug: 'ceramic-coating',
        name: 'Ceramic Coating',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 8,
        laborHoursHigh: 20,
        partsNationalLow: 100,
        partsNationalHigh: 500,
        shortDesc: 'professional ceramic coating application',
        icon: '\u2728',
        relatedBlog: '/blog/ceramic-coating-cost',
    },
    {
        slug: 'transmission-repair',
        name: 'Transmission Repair',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 4,
        laborHoursHigh: 15,
        partsNationalLow: 300,
        partsNationalHigh: 3500,
        shortDesc: 'transmission diagnosis, repair, and rebuild',
        icon: '\u2699\uFE0F',
        relatedBlog: '/blog/transmission-repair-cost',
    },
    {
        slug: 'window-tinting',
        name: 'Window Tinting',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 2,
        laborHoursHigh: 4,
        partsNationalLow: 80,
        partsNationalHigh: 400,
        shortDesc: 'automotive window tinting',
        icon: '\u{1FA9F}',
        relatedBlog: '/blog/window-tinting-cost',
    },
    {
        slug: 'ev-charger-installation',
        name: 'EV Charger Installation',
        category: 'auto',
        occupation: 'electrician',
        laborHoursLow: 3,
        laborHoursHigh: 8,
        partsNationalLow: 300,
        partsNationalHigh: 1200,
        shortDesc: 'Level 2 home EV charger installation',
        icon: '\u26A1',
        relatedBlog: '/blog/ev-charger-installation-cost',
    },
    {
        slug: 'ac-repair',
        name: 'AC Repair & Recharge',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 1,
        laborHoursHigh: 4,
        partsNationalLow: 50,
        partsNationalHigh: 600,
        shortDesc: 'automotive AC diagnosis, repair, and recharge',
        icon: '\u2744\uFE0F',
    },

    // ─── HOME SERVICES ───
    {
        slug: 'kitchen-remodel',
        name: 'Kitchen Remodel',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 80,
        laborHoursHigh: 300,
        partsNationalLow: 5000,
        partsNationalHigh: 35000,
        shortDesc: 'partial to full kitchen remodel',
        icon: '\u{1F373}',
        relatedBlog: '/blog/kitchen-remodel-cost-guide',
    },
    {
        slug: 'bathroom-remodel',
        name: 'Bathroom Remodel',
        category: 'home',
        occupation: 'plumber',
        laborHoursLow: 40,
        laborHoursHigh: 160,
        partsNationalLow: 2000,
        partsNationalHigh: 15000,
        shortDesc: 'partial to full bathroom remodel',
        icon: '\u{1F6BF}',
        relatedBlog: '/blog/bathroom-remodel-cost',
    },
    {
        slug: 'roof-replacement',
        name: 'Roof Replacement',
        category: 'home',
        occupation: 'roofer',
        laborHoursLow: 16,
        laborHoursHigh: 60,
        partsNationalLow: 3000,
        partsNationalHigh: 12000,
        shortDesc: 'full roof replacement',
        icon: '\u{1F3E0}',
        relatedBlog: '/blog/roof-replacement-cost',
    },
    {
        slug: 'hvac-replacement',
        name: 'HVAC Replacement',
        category: 'home',
        occupation: 'hvac',
        laborHoursLow: 8,
        laborHoursHigh: 24,
        partsNationalLow: 2500,
        partsNationalHigh: 8000,
        shortDesc: 'HVAC system replacement and installation',
        icon: '\u{1F321}\uFE0F',
        relatedBlog: '/blog/hvac-replacement-cost',
    },
    {
        slug: 'interior-painting',
        name: 'Interior Painting',
        category: 'home',
        occupation: 'painter',
        laborHoursLow: 16,
        laborHoursHigh: 60,
        partsNationalLow: 200,
        partsNationalHigh: 1200,
        shortDesc: 'whole-house or multi-room interior painting',
        icon: '\u{1F58C}\uFE0F',
        relatedBlog: '/blog/interior-painting-cost',
    },
    {
        slug: 'fence-installation',
        name: 'Fence Installation',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 12,
        laborHoursHigh: 40,
        partsNationalLow: 800,
        partsNationalHigh: 5000,
        shortDesc: 'wood, vinyl, or chain-link fence installation',
        icon: '\u{1F3D7}\uFE0F',
        relatedBlog: '/blog/fence-installation-cost',
    },
    {
        slug: 'flooring-installation',
        name: 'Flooring Installation',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 16,
        laborHoursHigh: 50,
        partsNationalLow: 1000,
        partsNationalHigh: 8000,
        shortDesc: 'hardwood, LVP, tile, or carpet flooring installation',
        icon: '\u{1FAB5}',
        relatedBlog: '/blog/flooring-installation-cost',
    },
    {
        slug: 'garage-door-replacement',
        name: 'Garage Door Replacement',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 3,
        laborHoursHigh: 8,
        partsNationalLow: 600,
        partsNationalHigh: 4000,
        shortDesc: 'garage door replacement and opener installation',
        icon: '\u{1F6AA}',
        relatedBlog: '/blog/garage-door-replacement-cost',
    },
];

// ── Content generation per service type ─────────────────────
function generateContentSections(service, city, costs) {
    const { slug, name: svcName, category } = service;
    const { name: cityName, state, metro } = city;
    const loc = `${cityName}, ${state}`;
    const rpp = RPP[city.slug];
    const rppLabel = rpp > 103 ? 'above the national average' : rpp < 97 ? 'below the national average' : 'close to the national average';

    let sections = '';

    // Opening paragraph
    sections += `<p>If you live in the ${metro} metro area and need ${service.shortDesc}, understanding local pricing before you call a shop can save you hundreds of dollars. Labor rates, material costs, and demand all vary by region, and ${cityName} has its own pricing dynamics shaped by the local economy and cost of living.</p>\n\n`;

    // Cost overview
    sections += `<p>Based on current labor rates and material costs in ${loc}, here is what you can expect to pay for ${service.shortDesc.replace(/^(a |an )/, '')} in 2026.</p>\n\n`;

    // Cost table
    sections += `<div class="cost-table">\n`;
    sections += `    <div class="cost-row"><span>Budget estimate</span><span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.budgetHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Mid-range estimate</span><span>$${costs.midLow.toLocaleString()} &ndash; $${costs.midHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Premium estimate</span><span>$${costs.premiumLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Labor portion</span><span>$${costs.laborCostLow.toLocaleString()} &ndash; $${costs.laborCostHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Parts &amp; materials</span><span>$${costs.partsCostLow.toLocaleString()} &ndash; $${costs.partsCostHigh.toLocaleString()}</span></div>\n`;
    sections += `</div>\n\n`;

    // How we calculated
    sections += `<h2>How We Calculate ${svcName} Costs in ${cityName}</h2>\n\n`;
    sections += `<p>These estimates combine two data sources from the federal government. Local hourly wages come from the Bureau of Labor Statistics Occupational Employment and Wage Statistics program, which surveys employers across the ${metro} metro area every year. The cost-of-living adjustment uses Regional Price Parities from the Bureau of Economic Analysis, which measure how much goods and services cost in ${cityName} compared to the national average.</p>\n\n`;
    sections += `<p>The ${cityName} metro area has a Regional Price Parity of <strong>${rpp}</strong>, meaning the overall cost of goods and services is ${rppLabel}. The local hourly wage for this trade is <strong>$${costs.hourlyWage.toFixed(2)}</strong> per hour, which directly impacts how much shops charge for labor.</p>\n\n`;

    // Why prices vary in this city
    sections += `<h2>Why ${svcName} Costs Vary in ${cityName}</h2>\n\n`;
    sections += `<p>Even within the ${metro} metro area, you will find a wide range of prices. Several factors drive this variation.</p>\n\n`;

    if (category === 'auto') {
        sections += `<p><strong>Shop type matters.</strong> Dealerships in ${cityName} typically charge 30 to 60 percent more than independent mechanics for the same service. National chains like Midas, Pep Boys, and Firestone fall somewhere in between. For most routine ${service.shortDesc}, an independent shop with strong reviews offers the best value.</p>\n\n`;
        sections += `<p><strong>Vehicle make and model.</strong> Luxury and European vehicles cost significantly more to service than economy brands. A ${svcName.toLowerCase()} on a BMW X5 or Mercedes GLE in ${cityName} can cost twice what the same job costs on a Honda CR-V or Toyota Camry.</p>\n\n`;
        sections += `<p><strong>Parts quality.</strong> OEM parts cost more than aftermarket alternatives but ensure factory-spec fitment. High-quality aftermarket brands often deliver comparable performance at 20 to 40 percent less.</p>\n\n`;
    } else {
        sections += `<p><strong>Contractor experience and licensing.</strong> Licensed, insured contractors in ${cityName} charge more than unlicensed handymen, but they offer permits, warranties, and accountability. For major ${service.shortDesc}, always verify that your contractor holds a valid ${state} license.</p>\n\n`;
        sections += `<p><strong>Material quality tiers.</strong> The gap between budget and premium materials is often larger than the gap in labor costs. Choosing mid-range materials is usually the best balance of quality and value for most ${cityName} homeowners.</p>\n\n`;
        sections += `<p><strong>Project scope and home size.</strong> A small-scale project can cost a fraction of a full-scale renovation. The estimates above cover typical residential projects in the ${metro} area, but your actual cost depends on the specific scope of work.</p>\n\n`;
    }

    // Neighborhood differences
    sections += `<p><strong>Neighborhood and demand.</strong> Shops and contractors in higher-income areas of ${cityName} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>\n\n`;

    // Tips section
    sections += `<h2>How to Save on ${svcName} in ${cityName}</h2>\n\n`;
    sections += `<p>Getting the best price in ${loc} comes down to preparation and smart shopping.</p>\n\n`;
    sections += `<p><strong>Get at least three quotes.</strong> Prices in the ${metro} area vary significantly between providers. Spending an hour collecting quotes can easily save you $${Math.round(costs.midLow * 0.15)} or more.</p>\n\n`;
    sections += `<p><strong>Check seasonal timing.</strong> ${category === 'auto' ? 'Many auto shops offer promotions during slower months. In ' + cityName + ', demand tends to dip in early spring and late fall.' : 'Home service demand in ' + cityName + ' peaks in spring and summer. Scheduling work in late fall or winter can get you better pricing and faster scheduling.'}</p>\n\n`;
    sections += `<p><strong>Read recent reviews.</strong> Google Reviews, Yelp, and NextDoor are valuable resources for finding reliable ${category === 'auto' ? 'mechanics and shops' : 'contractors'} in ${cityName}. Look for providers with consistent 4.5+ star ratings and detailed reviews mentioning fair pricing.</p>\n\n`;
    sections += `<p><strong>Ask about warranties.</strong> Reputable providers in ${cityName} stand behind their work. A written warranty on both parts and labor protects you from paying twice for the same problem.</p>\n\n`;

    // CTA
    sections += `<h2>Get a Personalized ${svcName} Estimate</h2>\n\n`;
    sections += `<p>These ranges reflect typical pricing in the ${metro} metro area, but your actual cost depends on your specific situation. Use our free AI-powered estimator to get a detailed, personalized quote based on your exact needs and location in ${cityName}.</p>\n\n`;

    return sections;
}

// ── Cost Calculation Engine ─────────────────────────────────
function calculateCosts(service, citySlug) {
    const wages = WAGES[citySlug];
    const rpp = RPP[citySlug] / 100;
    const hourlyWage = wages[service.occupation];

    const shopMarkupLow = 1.6;
    const shopMarkupHigh = 2.2;
    const laborCostLow = Math.round(hourlyWage * service.laborHoursLow * shopMarkupLow);
    const laborCostHigh = Math.round(hourlyWage * service.laborHoursHigh * shopMarkupHigh);

    const partsCostLow = Math.round(service.partsNationalLow * rpp);
    const partsCostHigh = Math.round(service.partsNationalHigh * rpp);

    const budgetLow = laborCostLow + partsCostLow;
    const budgetHigh = Math.round((laborCostLow + laborCostHigh) / 2) + Math.round((partsCostLow + partsCostHigh) / 2 * 0.7);

    const midLow = Math.round((budgetLow + budgetHigh) / 2 * 0.95);
    const midHigh = Math.round(laborCostHigh * 0.85 + partsCostHigh * 0.85);

    const premiumLow = midHigh;
    const premiumHigh = laborCostHigh + partsCostHigh;

    const round10 = (n) => Math.round(n / 10) * 10;

    return {
        hourlyWage,
        rpp: RPP[citySlug],
        laborCostLow: round10(laborCostLow),
        laborCostHigh: round10(laborCostHigh),
        partsCostLow: round10(partsCostLow),
        partsCostHigh: round10(partsCostHigh),
        budgetLow: round10(budgetLow),
        budgetHigh: round10(budgetHigh),
        midLow: round10(midLow),
        midHigh: round10(midHigh),
        premiumLow: round10(premiumLow),
        premiumHigh: round10(premiumHigh),
    };
}

// ── Related services for internal linking ───────────────────
function getRelatedServices(service, city) {
    return SERVICES
        .filter(s => s.slug !== service.slug && s.category === service.category)
        .slice(0, 4)
        .map(s => ({
            slug: s.slug,
            name: s.name,
            url: `/cost/${city.slug}/${s.slug}`,
            icon: s.icon,
        }));
}

// ── Other cities for same service (deterministic cross-linking) ──
function getOtherCitiesDeterministic(service, currentCity) {
    // Pick 5 cities: 2 from batch 3 peers + 2 from batch 2 + 1 from batch 1
    const batch3Others = CITIES.filter(c => c.slug !== currentCity.slug).slice(0, 2);
    const batch2Pick = BATCH2_CITIES.slice(0, 2);
    const batch1Pick = BATCH1_CITIES.slice(0, 1);
    return [...batch3Others, ...batch2Pick, ...batch1Pick].map(c => ({
        name: `${c.name}, ${c.state}`,
        url: `/cost/${c.slug}/${service.slug}`,
    }));
}

// ── HTML Service Page Template ──────────────────────────────
function generateHTML(service, city, costs) {
    const loc = `${city.name}, ${city.state}`;
    const title = `${service.name} Cost in ${loc} (2026 Prices) | Ecostify`;
    const desc = `${service.name} in ${loc} costs $${costs.budgetLow.toLocaleString()} to $${costs.premiumHigh.toLocaleString()} in 2026. See local labor rates, material costs, and tips to save. Data from BLS and BEA.`;
    const canonical = `https://www.ecostify.com/cost/${city.slug}/${service.slug}`;
    const categoryLabel = service.category === 'auto' ? 'Auto' : 'Home';
    const badge = `${categoryLabel} &middot; ${loc}`;
    const content = generateContentSections(service, city, costs);
    const relatedServices = getRelatedServices(service, city);
    const otherCities = getOtherCitiesDeterministic(service, city);
    const ctaLink = service.category === 'auto' ? '/#auto' : '/#home';
    const blogLink = service.relatedBlog ? `<p>For a deeper dive into national pricing trends, read our full <a href="${service.relatedBlog}">${service.name} cost guide</a>.</p>` : '';

    const relatedServicesHTML = relatedServices.map(s =>
        `                    <li><a href="${s.url}">${s.icon} ${s.name} Cost in ${city.name}</a></li>`
    ).join('\n');

    const otherCitiesHTML = otherCities.map(c =>
        `                    <li><a href="${c.url}">${service.name} Cost in ${c.name}</a></li>`
    ).join('\n');

    // Schema.org ItemList for service pages (same structure as existing batch 2 pages)
    const itemListJson = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
            { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
            { "@type": "ListItem", "position": 3, "name": `${loc}`, "item": `https://www.ecostify.com/cost/${city.slug}/` },
            { "@type": "ListItem", "position": 4, "name": service.name }
        ]
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:site_name" content="Ecostify">
    <meta property="og:image" content="https://www.ecostify.com/images/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://www.ecostify.com/images/og-image.png">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${service.name} Cost in ${loc} — 2026 Pricing Guide",
        "description": "${desc}",
        "datePublished": "2026-02-21",
        "dateModified": "2026-02-21",
        "author": { "@type": "Organization", "name": "Ecostify" },
        "publisher": { "@type": "Organization", "name": "Ecostify", "url": "https://www.ecostify.com" }
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How much does ${service.name.toLowerCase()} cost in ${loc}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${service.name} in ${loc} typically costs between $${costs.budgetLow.toLocaleString()} and $${costs.premiumHigh.toLocaleString()} in 2026, depending on the scope of work and materials. The mid-range estimate is $${costs.midLow.toLocaleString()} to $${costs.midHigh.toLocaleString()}."
                }
            },
            {
                "@type": "Question",
                "name": "What is the average labor rate for this service in ${city.name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Based on BLS data, the average hourly wage for this trade in the ${city.metro} metro area is $${costs.hourlyWage.toFixed(2)} per hour. After shop overhead and markup, expect to pay roughly $${costs.laborCostLow.toLocaleString()} to $${costs.laborCostHigh.toLocaleString()} total for labor."
                }
            }
        ]
    }
    </script>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/global-light.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FCVYRYEKNX"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FCVYRYEKNX');</script>
    <script type="application/ld+json">
    ${itemListJson}
    </script>
</head>
<body>
    <nav class="nav">
        <div class="container nav-inner">
            <a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>
            <button class="nav-toggle" aria-label="Menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div class="nav-links">
                <a href="/#auto">Auto</a>
                <a href="/#home">Home</a>
                <a href="/cost/">Cost Guides</a>
                <a href="/blog/">Blog</a>
                <a href="/directory">Directory</a>
                <a href="/#how">How It Works</a>
            </div>
        </div>
    </nav>
    <article class="blog-article">
        <div class="container">
            <a href="/cost/" class="results-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5m0 0l4-4m-4 4l4 4"/></svg>
                All cost guides
            </a>
            <div class="article-header">
                <div class="blog-card-badge">${badge}</div>
                <h1>${service.icon} ${service.name} Cost in ${loc}</h1>
                <p class="article-meta">Updated February 2026 &middot; Based on BLS &amp; BEA data for the ${city.metro} metro area</p>
            </div>
            <div class="article-body">

                ${content}
                ${blogLink}

                <h2>Other ${categoryLabel} Services in ${city.name}</h2>

                <ul>
${relatedServicesHTML}
                </ul>

                <h2>${service.name} Cost in Other Cities</h2>

                <ul>
${otherCitiesHTML}
                </ul>

                <div class="article-cta">
                    <h3>Get an Instant ${service.name} Estimate for ${city.name}</h3>
                    <p>Upload a photo or describe your project to get a personalized AI-powered cost estimate calibrated to ${loc} pricing.</p>
                    <a href="${ctaLink}" class="btn">Get Your Estimate &rarr;</a>
                </div>

            </div>
        </div>
    </article>
    <footer class="footer">
        <div class="container footer-inner">
            <div class="footer-top">
                <a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>
                <p class="footer-tagline">Know the real cost before you call.</p>
            </div>
            <div class="footer-bottom">
                <div class="footer-links">
                    <a href="/about">About</a>
                    <a href="/cost/">Cost Guides</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/disclaimer">Disclaimer</a>
                </div>
                <span class="footer-copy">&copy; 2026 Ecostify</span>
            </div>
        </div>
    </footer>
    <script>
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
            navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
        }
    </script>
</body>
</html>`;
}

// ── City Index Page ─────────────────────────────────────────
function generateCityIndexPage(city) {
    const loc = `${city.name}, ${city.state}`;
    const autoServices = SERVICES.filter(s => s.category === 'auto');
    const homeServices = SERVICES.filter(s => s.category === 'home');

    const renderServiceRow = (s) => {
        const costs = calculateCosts(s, city.slug);
        return `
                    <div class="cost-row">
                        <span><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}</a></span>
                        <span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span>
                    </div>`;
    };

    // Schema.org ItemList
    const itemListJson = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Auto & Home Service Costs in ${loc}`,
        "url": `https://www.ecostify.com/cost/${city.slug}/`,
        "numberOfItems": 16,
        "itemListElement": SERVICES.map((s, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": `${s.name} Cost in ${city.name}`,
            "url": `https://www.ecostify.com/cost/${city.slug}/${s.slug}`
        }))
    });

    const breadcrumbJson = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
            { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
            { "@type": "ListItem", "position": 3, "name": `${loc}` }
        ]
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto &amp; Home Service Costs in ${loc} (2026) | Ecostify</title>
    <meta name="description" content="Compare costs for 16 auto and home services in ${loc}. Local pricing based on BLS wages and BEA cost-of-living data for the ${city.metro} metro area.">
    <link rel="canonical" href="https://www.ecostify.com/cost/${city.slug}/">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.ecostify.com/cost/${city.slug}/">
    <meta property="og:title" content="Auto &amp; Home Service Costs in ${loc} (2026) | Ecostify">
    <meta property="og:description" content="16 services priced for ${city.metro}. BLS wage data + BEA cost-of-living.">
    <meta property="og:site_name" content="Ecostify">
    <meta property="og:image" content="https://www.ecostify.com/images/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://www.ecostify.com/images/og-image.png">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/global-light.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FCVYRYEKNX"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FCVYRYEKNX');</script>
    <script type="application/ld+json">
    ${itemListJson}
    </script>
    <script type="application/ld+json">
    ${breadcrumbJson}
    </script>
</head>
<body>
    <nav class="nav">
        <div class="container nav-inner">
            <a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>
            <button class="nav-toggle" aria-label="Menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div class="nav-links">
                <a href="/#auto">Auto</a>
                <a href="/#home">Home</a>
                <a href="/cost/">Cost Guides</a>
                <a href="/blog/">Blog</a>
                <a href="/directory">Directory</a>
                <a href="/#how">How It Works</a>
            </div>
        </div>
    </nav>
    <article class="blog-article">
        <div class="container">
            <a href="/cost/" class="results-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5m0 0l4-4m-4 4l4 4"/></svg>
                All cities
            </a>
            <div class="article-header">
                <h1>Auto &amp; Home Service Costs in ${loc}</h1>
                <p class="article-meta">${city.metro} metro area &middot; Pop. ${city.pop} &middot; RPP: ${RPP[city.slug]} &middot; Updated February 2026</p>
            </div>
            <div class="article-body">

                <p>Here is what you can expect to pay for common auto and home services in the ${city.metro} metro area in 2026. All estimates are based on local BLS wage data and BEA Regional Price Parities.</p>

                <h2>Auto Services in ${city.name}</h2>

                <div class="cost-table">${autoServices.map(renderServiceRow).join('')}
                </div>

                <h2>Home Services in ${city.name}</h2>

                <div class="cost-table">${homeServices.map(renderServiceRow).join('')}
                </div>

                <div class="article-cta">
                    <h3>Get a Personalized Estimate for ${city.name}</h3>
                    <p>These are typical ranges. Upload a photo or describe your specific project to get an AI-powered estimate calibrated to ${loc} pricing.</p>
                    <a href="/" class="btn">Get Your Estimate &rarr;</a>
                </div>

            </div>
        </div>
    </article>
    <footer class="footer">
        <div class="container footer-inner">
            <div class="footer-top">
                <a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>
                <p class="footer-tagline">Know the real cost before you call.</p>
            </div>
            <div class="footer-bottom">
                <div class="footer-links">
                    <a href="/about">About</a>
                    <a href="/cost/">Cost Guides</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/disclaimer">Disclaimer</a>
                </div>
                <span class="footer-copy">&copy; 2026 Ecostify</span>
            </div>
        </div>
    </footer>
    <script>
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
            navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
        }
    </script>
</body>
</html>`;
}

// ── Main Build ──────────────────────────────────────────────
function build() {
    const baseDir = path.join(__dirname, 'cost');
    let pageCount = 0;

    console.log('🏗️  Ecostify City Page Generator — Batch 3');
    console.log(`   ${CITIES.length} cities × ${SERVICES.length} services = ${CITIES.length * SERVICES.length} pages\n`);

    // Generate per-city and per-service pages
    CITIES.forEach(city => {
        const cityDir = path.join(baseDir, city.slug);
        if (!fs.existsSync(cityDir)) {
            fs.mkdirSync(cityDir, { recursive: true });
        }

        // City index page
        const cityIndexHTML = generateCityIndexPage(city);
        fs.writeFileSync(path.join(cityDir, 'index.html'), cityIndexHTML);
        console.log(`✅  /cost/${city.slug}/index.html`);
        pageCount++;

        // Individual service pages
        SERVICES.forEach(service => {
            const costs = calculateCosts(service, city.slug);
            const html = generateHTML(service, city, costs);
            fs.writeFileSync(path.join(cityDir, `${service.slug}.html`), html);
            pageCount++;
        });
        console.log(`   ✅  ${SERVICES.length} service pages for ${city.name}, ${city.state}`);
    });

    // Update the main /cost/index.html to add batch 3 city cards
    console.log('\n📝  Updating /cost/index.html with batch 3 cities...');
    const costIndexPath = path.join(baseDir, 'index.html');
    let costIndexHTML = fs.readFileSync(costIndexPath, 'utf8');

    // Generate new city cards
    const newCityCards = CITIES.map(city => {
        const cityServices = SERVICES.slice(0, 4).map(s => {
            const costs = calculateCosts(s, city.slug);
            return `<li><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}: $${costs.budgetLow.toLocaleString()}&ndash;$${costs.premiumHigh.toLocaleString()}</a></li>`;
        }).join('\n                        ');

        return `
                <div class="city-card">
                    <h3><a href="/cost/${city.slug}/">${city.name}, ${city.state}</a></h3>
                    <p class="city-meta">${city.metro} &middot; Pop. ${city.pop}</p>
                    <ul class="city-services">
                        ${cityServices}
                    </ul>
                    <a href="/cost/${city.slug}/" class="city-view-all">View all 16 services &rarr;</a>
                </div>`;
    }).join('\n');

    // Insert new city cards before the closing city-grid div
    costIndexHTML = costIndexHTML.replace(
        '                </div>\n            </div>\n        </div>\n    </article>',
        newCityCards + '\n                </div>\n            </div>\n        </div>\n    </article>'
    );

    // Update the title and description to reflect 25 cities
    costIndexHTML = costIndexHTML.replace(
        /across 20 major US cities/g,
        'across 25 major US cities'
    );
    costIndexHTML = costIndexHTML.replace(
        /across 20 major US metro areas/g,
        'across 25 major US metro areas'
    );
    costIndexHTML = costIndexHTML.replace(
        '20 major US metro areas',
        '25 major US metro areas'
    );

    // Update body text
    costIndexHTML = costIndexHTML.replace(
        'across 20 major US metro areas',
        'across 25 major US metro areas'
    );

    fs.writeFileSync(costIndexPath, costIndexHTML);
    console.log('✅  /cost/index.html updated with 5 new city cards');

    console.log(`\n🎉  Done! Generated ${pageCount} pages total.`);
    console.log(`   📁  ${baseDir}`);
}

build();
