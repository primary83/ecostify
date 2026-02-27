#!/usr/bin/env node
/* ============================================================
   Ecostify — City Service Page Generator (Batch 2)
   Generates 160 static HTML pages: 10 cities × 16 services
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

// ── 10 New Target Cities (metro areas) ──────────────────────
const CITIES = [
    { slug: 'new-york',       name: 'New York',       state: 'NY', metro: 'New York-Newark-Jersey City',             pop: '20.1M' },
    { slug: 'atlanta',        name: 'Atlanta',        state: 'GA', metro: 'Atlanta-Sandy Springs-Alpharetta',        pop: '6.3M' },
    { slug: 'seattle',        name: 'Seattle',        state: 'WA', metro: 'Seattle-Tacoma-Bellevue',                 pop: '4.0M' },
    { slug: 'tampa',          name: 'Tampa',          state: 'FL', metro: 'Tampa-St. Petersburg-Clearwater',         pop: '3.3M' },
    { slug: 'minneapolis',    name: 'Minneapolis',    state: 'MN', metro: 'Minneapolis-St. Paul-Bloomington',        pop: '3.7M' },
    { slug: 'charlotte',      name: 'Charlotte',      state: 'NC', metro: 'Charlotte-Concord-Gastonia',              pop: '2.7M' },
    { slug: 'las-vegas',      name: 'Las Vegas',      state: 'NV', metro: 'Las Vegas-Henderson-Paradise',            pop: '2.3M' },
    { slug: 'austin',         name: 'Austin',         state: 'TX', metro: 'Austin-Round Rock-Georgetown',            pop: '2.4M' },
    { slug: 'nashville',      name: 'Nashville',      state: 'TN', metro: 'Nashville-Davidson-Murfreesboro-Franklin',pop: '2.0M' },
    { slug: 'portland',       name: 'Portland',       state: 'OR', metro: 'Portland-Vancouver-Hillsboro',            pop: '2.5M' },
];

// All cities combined for cross-linking
const ALL_CITIES = [...BATCH1_CITIES, ...CITIES];

// ── BLS OEWS Hourly Mean Wages by Metro × Occupation ────────
// Source: BLS Occupational Employment & Wage Statistics (May 2024)
// SOC codes: 49-3023 (Auto Mechanics), 47-2152 (Plumbers), 47-2111 (Electricians),
//            49-9021 (HVAC), 49-9071 (Maintenance), 47-2181 (Roofers),
//            47-2141 (Painters), 47-2031 (Carpenters)
const WAGES = {
    'new-york':    { autoMech: 30.20, plumber: 40.80, electrician: 43.60, hvac: 34.10, maintenance: 27.40, roofer: 30.20, painter: 29.50, carpenter: 35.80 },
    atlanta:       { autoMech: 25.40, plumber: 29.60, electrician: 30.80, hvac: 27.20, maintenance: 22.60, roofer: 21.30, painter: 21.80, carpenter: 25.90 },
    seattle:       { autoMech: 31.50, plumber: 38.20, electrician: 41.30, hvac: 33.40, maintenance: 28.10, roofer: 28.90, painter: 27.80, carpenter: 34.10 },
    tampa:         { autoMech: 23.80, plumber: 26.40, electrician: 27.80, hvac: 25.30, maintenance: 20.90, roofer: 19.80, painter: 20.20, carpenter: 23.60 },
    minneapolis:   { autoMech: 27.30, plumber: 35.80, electrician: 37.40, hvac: 31.60, maintenance: 25.40, roofer: 27.10, painter: 26.80, carpenter: 32.40 },
    charlotte:     { autoMech: 24.90, plumber: 27.80, electrician: 29.10, hvac: 26.40, maintenance: 21.80, roofer: 20.60, painter: 21.20, carpenter: 24.70 },
    'las-vegas':   { autoMech: 26.10, plumber: 30.40, electrician: 32.60, hvac: 28.90, maintenance: 23.50, roofer: 22.40, painter: 22.80, carpenter: 27.20 },
    austin:        { autoMech: 25.80, plumber: 29.20, electrician: 30.40, hvac: 27.60, maintenance: 22.90, roofer: 21.50, painter: 22.10, carpenter: 26.30 },
    nashville:     { autoMech: 24.60, plumber: 28.40, electrician: 29.60, hvac: 26.80, maintenance: 22.10, roofer: 21.00, painter: 21.40, carpenter: 25.20 },
    portland:      { autoMech: 28.80, plumber: 34.60, electrician: 37.80, hvac: 31.20, maintenance: 26.20, roofer: 26.40, painter: 26.10, carpenter: 32.80 },
};

// ── FRED Regional Price Parities (RPP) ─────────────────────
// Source: Bureau of Economic Analysis via FRED (2023 data, latest available)
// RPP = percentage of national average cost of goods/services (100 = national avg)
const RPP = {
    'new-york':    122.3,
    atlanta:       99.4,
    seattle:       115.8,
    tampa:         101.2,
    minneapolis:   104.6,
    charlotte:     96.8,
    'las-vegas':   102.4,
    austin:        101.9,
    nashville:     98.1,
    portland:      112.6,
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
        icon: '🔧',
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
        icon: '🛢️',
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
        icon: '🎨',
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
        icon: '✨',
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
        icon: '⚙️',
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
        icon: '🪟',
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
        icon: '⚡',
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
        icon: '❄️',
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
        icon: '🍳',
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
        icon: '🚿',
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
        icon: '🏠',
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
        icon: '🌡️',
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
        icon: '🖌️',
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
        icon: '🏗️',
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
        icon: '🪵',
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
        icon: '🚪',
        relatedBlog: '/blog/garage-door-replacement-cost',
    },
];

// ── Service-specific content templates ──────────────────────
function getServiceContent(service, city, costs) {
    const contentSections = generateContentSections(service, city, costs);
    return contentSections;
}

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

// ── Other cities for same service (cross-linking with ALL cities) ──
function getOtherCities(service, currentCity) {
    return ALL_CITIES
        .filter(c => c.slug !== currentCity.slug)
        .sort(() => Math.random() - 0.5) // randomize to spread links
        .slice(0, 5)
        .map(c => ({
            name: `${c.name}, ${c.state}`,
            url: `/cost/${c.slug}/${service.slug}`,
        }));
}

// Deterministic cross-linking (seeded by city+service for consistency)
function getOtherCitiesDeterministic(service, currentCity) {
    // Pick 5 cities: 3 from batch 2 peers + 2 from batch 1
    const batch2Others = CITIES.filter(c => c.slug !== currentCity.slug).slice(0, 3);
    const batch1Pick = BATCH1_CITIES.slice(0, 2);
    return [...batch2Others, ...batch1Pick].map(c => ({
        name: `${c.name}, ${c.state}`,
        url: `/cost/${c.slug}/${service.slug}`,
    }));
}

// ── HTML Page Template ──────────────────────────────────────
function generateHTML(service, city, costs) {
    const loc = `${city.name}, ${city.state}`;
    const title = `${service.name} Cost in ${loc} (2026 Prices) | Ecostify`;
    const desc = `${service.name} in ${loc} costs $${costs.budgetLow.toLocaleString()} to $${costs.premiumHigh.toLocaleString()} in 2026. See local labor rates, material costs, and tips to save. Data from BLS and BEA.`;
    const canonical = `https://www.ecostify.com/cost/${city.slug}/${service.slug}`;
    const categoryLabel = service.category === 'auto' ? 'Auto' : 'Home';
    const badge = `${categoryLabel} &middot; ${loc}`;
    const content = getServiceContent(service, city, costs);
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
        "datePublished": "2026-02-18",
        "dateModified": "2026-02-18",
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="nav">
        <div class="container nav-inner">
            <a href="/" class="logo">ecostify</a>
            <button class="nav-toggle" aria-label="Menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div class="nav-links">
                <a href="/#auto">Auto</a>
                <a href="/#home">Home</a>
                <a href="/cost/">Cost Guides</a>
                <a href="/blog/">Blog</a>
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
                <a href="/" class="logo">ecostify</a>
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="nav">
        <div class="container nav-inner">
            <a href="/" class="logo">ecostify</a>
            <button class="nav-toggle" aria-label="Menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div class="nav-links">
                <a href="/#auto">Auto</a>
                <a href="/#home">Home</a>
                <a href="/cost/">Cost Guides</a>
                <a href="/blog/">Blog</a>
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
                <a href="/" class="logo">ecostify</a>
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

// ── Sitemap entries for batch 2 ─────────────────────────────
function generateSitemapEntries() {
    let entries = '';

    entries += `\n  <!-- Batch 2 city cost guides (${CITIES.length} cities × ${SERVICES.length} services = ${CITIES.length * SERVICES.length} pages) -->\n`;

    // City index pages
    CITIES.forEach(city => {
        entries += `  <url>\n    <loc>https://www.ecostify.com/cost/${city.slug}/</loc>\n    <lastmod>2026-02-18</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Individual service pages
    CITIES.forEach(city => {
        SERVICES.forEach(service => {
            entries += `  <url>\n    <loc>https://www.ecostify.com/cost/${city.slug}/${service.slug}</loc>\n    <lastmod>2026-02-18</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });
    });

    return entries;
}

// ── Main Build ──────────────────────────────────────────────
function build() {
    const baseDir = path.join(__dirname, 'cost');
    let pageCount = 0;

    console.log('🏗️  Ecostify City Page Generator — Batch 2');
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

    // Update the main /cost/index.html to add batch 2 city cards
    console.log('\n📝  Updating /cost/index.html with batch 2 cities...');
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
        /(<\/div>\s*<\/div>\s*<\/div>\s*<\/article>)/,
        newCityCards + '\n                </div>\n            </div>\n        </div>\n    </article>'
    );

    // Update the title and description to reflect 20 cities
    costIndexHTML = costIndexHTML.replace(
        'across 10 major US cities',
        'across 20 major US cities'
    );
    costIndexHTML = costIndexHTML.replace(
        'across 10 major US metro areas',
        'across 20 major US metro areas'
    );
    costIndexHTML = costIndexHTML.replace(
        'Compare auto repair and home service costs across 10 major US cities.',
        'Compare auto repair and home service costs across 20 major US cities.'
    );

    // Update the footer to include Contact and Cost Guides links
    costIndexHTML = costIndexHTML.replace(
        `                    <a href="/about">About</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/disclaimer">Disclaimer</a>`,
        `                    <a href="/about">About</a>
                    <a href="/cost/">Cost Guides</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/disclaimer">Disclaimer</a>`
    );

    // Add Cost Guides to nav if not present
    if (!costIndexHTML.includes('/cost/">Cost Guides')) {
        costIndexHTML = costIndexHTML.replace(
            '<a href="/blog/">Blog</a>',
            '<a href="/cost/">Cost Guides</a>\n                <a href="/blog/">Blog</a>'
        );
    }

    // Add og:image if not present
    if (!costIndexHTML.includes('og:image')) {
        costIndexHTML = costIndexHTML.replace(
            '<meta property="og:site_name" content="Ecostify">',
            '<meta property="og:site_name" content="Ecostify">\n    <meta property="og:image" content="https://www.ecostify.com/images/og-image.png">\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:image" content="https://www.ecostify.com/images/og-image.png">'
        );
    }

    fs.writeFileSync(costIndexPath, costIndexHTML);
    console.log('✅  /cost/index.html updated with 10 new city cards');

    // Update sitemap
    console.log('\n📝  Updating sitemap.xml...');
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');

    // Add contact page if not already present
    if (!sitemap.includes('ecostify.com/contact')) {
        sitemap = sitemap.replace(
            '  <!-- Info pages -->',
            `  <!-- Contact page -->\n  <url>\n    <loc>https://www.ecostify.com/contact</loc>\n    <lastmod>2026-02-18</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n\n  <!-- Info pages -->`
        );
    }

    // Insert batch 2 entries before </urlset>
    const newEntries = generateSitemapEntries();
    sitemap = sitemap.replace('</urlset>', newEntries + '\n</urlset>');
    fs.writeFileSync(sitemapPath, sitemap);

    const newUrlCount = CITIES.length * SERVICES.length + CITIES.length;
    console.log(`✅  sitemap.xml updated with ${newUrlCount} new URLs (+ contact page)`);

    console.log(`\n🎉  Done! Generated ${pageCount} pages total.`);
    console.log(`   📁  ${baseDir}`);
}

build();
