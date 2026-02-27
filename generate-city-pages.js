#!/usr/bin/env node
/* ============================================================
   Ecostify — City Service Page Generator (Batch 1)
   Generates 160 static HTML pages: 10 cities × 16 services
   Uses BLS OEWS wage data + FRED RPP cost-of-living multipliers
   Formula: (Local Hourly Wage × Labor Hours) + (National Avg Parts × RPP Multiplier)
   ============================================================ */

const fs = require('fs');
const path = require('path');

// ── 10 Target Cities (metro areas) ──────────────────────────
const CITIES = [
    { slug: 'houston',        name: 'Houston',        state: 'TX', metro: 'Houston-The Woodlands-Sugar Land',     pop: '7.3M' },
    { slug: 'los-angeles',    name: 'Los Angeles',    state: 'CA', metro: 'Los Angeles-Long Beach-Anaheim',       pop: '13.2M' },
    { slug: 'chicago',        name: 'Chicago',        state: 'IL', metro: 'Chicago-Naperville-Elgin',             pop: '9.5M' },
    { slug: 'phoenix',        name: 'Phoenix',        state: 'AZ', metro: 'Phoenix-Mesa-Chandler',                pop: '5.1M' },
    { slug: 'philadelphia',   name: 'Philadelphia',   state: 'PA', metro: 'Philadelphia-Camden-Wilmington',       pop: '6.2M' },
    { slug: 'san-antonio',    name: 'San Antonio',    state: 'TX', metro: 'San Antonio-New Braunfels',            pop: '2.6M' },
    { slug: 'dallas',         name: 'Dallas',         state: 'TX', metro: 'Dallas-Fort Worth-Arlington',          pop: '8.1M' },
    { slug: 'san-diego',      name: 'San Diego',      state: 'CA', metro: 'San Diego-Chula Vista-Carlsbad',       pop: '3.3M' },
    { slug: 'denver',         name: 'Denver',         state: 'CO', metro: 'Denver-Aurora-Lakewood',               pop: '2.9M' },
    { slug: 'miami',          name: 'Miami',          state: 'FL', metro: 'Miami-Fort Lauderdale-Pompano Beach',  pop: '6.2M' },
];

// ── BLS OEWS Hourly Mean Wages by Metro × Occupation ────────
// Source: BLS Occupational Employment & Wage Statistics (May 2024)
// SOC codes: 49-3023 (Auto Mechanics), 47-2152 (Plumbers), 47-2111 (Electricians),
//            49-9021 (HVAC), 49-9071 (Maintenance), 47-2181 (Roofers),
//            47-2141 (Painters), 47-2031 (Carpenters)
const WAGES = {
    houston:       { autoMech: 24.80, plumber: 28.90, electrician: 30.10, hvac: 26.50, maintenance: 22.10, roofer: 20.80, painter: 21.60, carpenter: 25.30 },
    'los-angeles': { autoMech: 29.40, plumber: 35.60, electrician: 38.90, hvac: 31.20, maintenance: 25.80, roofer: 25.10, painter: 26.40, carpenter: 31.50 },
    chicago:       { autoMech: 27.60, plumber: 42.30, electrician: 40.80, hvac: 32.40, maintenance: 24.90, roofer: 29.60, painter: 28.30, carpenter: 34.20 },
    phoenix:       { autoMech: 25.90, plumber: 28.20, electrician: 29.40, hvac: 27.10, maintenance: 22.80, roofer: 21.40, painter: 21.90, carpenter: 25.80 },
    philadelphia:  { autoMech: 26.80, plumber: 36.40, electrician: 37.20, hvac: 30.80, maintenance: 24.20, roofer: 27.30, painter: 25.90, carpenter: 30.60 },
    'san-antonio': { autoMech: 23.40, plumber: 26.10, electrician: 27.30, hvac: 24.80, maintenance: 20.60, roofer: 19.50, painter: 19.80, carpenter: 23.40 },
    dallas:        { autoMech: 25.60, plumber: 29.80, electrician: 30.60, hvac: 27.40, maintenance: 23.10, roofer: 21.90, painter: 22.30, carpenter: 26.10 },
    'san-diego':   { autoMech: 28.30, plumber: 33.40, electrician: 36.10, hvac: 30.50, maintenance: 25.20, roofer: 24.80, painter: 25.60, carpenter: 30.20 },
    denver:        { autoMech: 27.10, plumber: 31.60, electrician: 33.40, hvac: 29.80, maintenance: 24.60, roofer: 23.90, painter: 24.20, carpenter: 28.70 },
    miami:         { autoMech: 24.20, plumber: 27.40, electrician: 28.60, hvac: 25.90, maintenance: 21.40, roofer: 20.30, painter: 20.90, carpenter: 24.10 },
};

// ── FRED Regional Price Parities (RPP) ─────────────────────
// Source: Bureau of Economic Analysis via FRED (2023 data, latest available)
// RPP = percentage of national average cost of goods/services (100 = national avg)
const RPP = {
    houston:       97.8,
    'los-angeles': 116.5,
    chicago:       104.2,
    phoenix:       100.8,
    philadelphia:  108.6,
    'san-antonio': 92.4,
    dallas:        100.1,
    'san-diego':   114.3,
    denver:        107.9,
    miami:         109.2,
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
    const { name: svcName, category, shortDesc } = service;
    const { name: cityName, state, metro } = city;
    const { budgetLow, budgetHigh, midLow, midHigh, premiumLow, premiumHigh, laborCostLow, laborCostHigh, partsCostLow, partsCostHigh, hourlyWage } = costs;

    const loc = `${cityName}, ${state}`;
    const isAuto = category === 'auto';
    const categoryLabel = isAuto ? 'Auto' : 'Home';

    // Generate unique content sections based on service type
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
    const costLevel = rpp > 110 ? 'higher-cost' : rpp < 95 ? 'lower-cost' : 'average-cost';

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
    const rpp = RPP[citySlug] / 100; // convert to multiplier
    const hourlyWage = wages[service.occupation];

    // Labor cost = hourly wage × labor hours × shop markup (1.6x-2.2x covers overhead, profit)
    const shopMarkupLow = 1.6;
    const shopMarkupHigh = 2.2;
    const laborCostLow = Math.round(hourlyWage * service.laborHoursLow * shopMarkupLow);
    const laborCostHigh = Math.round(hourlyWage * service.laborHoursHigh * shopMarkupHigh);

    // Parts cost = national avg parts × RPP multiplier
    const partsCostLow = Math.round(service.partsNationalLow * rpp);
    const partsCostHigh = Math.round(service.partsNationalHigh * rpp);

    // Budget = lower labor + lower parts
    const budgetLow = laborCostLow + partsCostLow;
    const budgetHigh = Math.round((laborCostLow + laborCostHigh) / 2) + Math.round((partsCostLow + partsCostHigh) / 2 * 0.7);

    // Mid-range = middle of the range
    const midLow = Math.round((budgetLow + budgetHigh) / 2 * 0.95);
    const midHigh = Math.round(laborCostHigh * 0.85 + partsCostHigh * 0.85);

    // Premium = higher end with premium multiplier
    const premiumLow = midHigh;
    const premiumHigh = laborCostHigh + partsCostHigh;

    // Round to nearest $10 for cleaner numbers
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

// ── Other cities for same service (cross-linking) ───────────
function getOtherCities(service, currentCity) {
    return CITIES
        .filter(c => c.slug !== currentCity.slug)
        .slice(0, 5)
        .map(c => ({
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
    const otherCities = getOtherCities(service, city);
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
    <meta name="twitter:card" content="summary">
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

// ── Cost Index Page ─────────────────────────────────────────
function generateIndexPage() {
    const cityCards = CITIES.map(city => {
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

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cost Guides by City — Local Auto & Home Service Pricing | Ecostify</title>
    <meta name="description" content="Compare auto repair and home service costs across 10 major US cities. Pricing based on real BLS wage data and BEA cost-of-living indexes.">
    <link rel="canonical" href="https://www.ecostify.com/cost/">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.ecostify.com/cost/">
    <meta property="og:title" content="Cost Guides by City — Local Auto & Home Service Pricing | Ecostify">
    <meta property="og:description" content="Compare auto repair and home service costs across 10 major US cities.">
    <meta property="og:site_name" content="Ecostify">
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
                <a href="/blog/">Blog</a>
                <a href="/#how">How It Works</a>
            </div>
        </div>
    </nav>
    <article class="blog-article">
        <div class="container">
            <div class="article-header">
                <h1>Auto &amp; Home Service Costs by City</h1>
                <p class="article-meta">2026 pricing based on BLS wage data &amp; BEA Regional Price Parities</p>
            </div>
            <div class="article-body">
                <p>How much you pay for auto repairs and home services depends heavily on where you live. Labor rates, material costs, and cost of living vary dramatically across the country. Below, we break down real pricing for 16 common services across 10 major US metro areas, using federal government data to ensure accuracy.</p>

                <div class="city-grid">
${cityCards}
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

// ── Sitemap generator ───────────────────────────────────────
function generateSitemapEntries() {
    let entries = '';

    // Cost index
    entries += `\n  <!-- City cost guides (${CITIES.length} cities × ${SERVICES.length} services = ${CITIES.length * SERVICES.length} pages) -->\n`;
    entries += `  <url>\n    <loc>https://www.ecostify.com/cost/</loc>\n    <lastmod>2026-02-18</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

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

    console.log('🏗️  Ecostify City Page Generator — Batch 1');
    console.log(`   ${CITIES.length} cities × ${SERVICES.length} services = ${CITIES.length * SERVICES.length} pages\n`);

    // Create /cost/ directory
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    // Generate main cost index page
    const indexHTML = generateIndexPage();
    fs.writeFileSync(path.join(baseDir, 'index.html'), indexHTML);
    console.log('✅  /cost/index.html');
    pageCount++;

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

    // Update sitemap
    console.log('\n📝  Updating sitemap.xml...');
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');

    // Remove old city entries if they exist
    sitemap = sitemap.replace(/\n  <!-- City cost guides[\s\S]*?(?=\n<\/urlset>)/, '');

    // Insert new entries before </urlset>
    const newEntries = generateSitemapEntries();
    sitemap = sitemap.replace('</urlset>', newEntries + '\n</urlset>');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('✅  sitemap.xml updated with ' + (CITIES.length * SERVICES.length + CITIES.length + 1) + ' new URLs');

    console.log(`\n🎉  Done! Generated ${pageCount} pages total.`);
    console.log(`   📁  ${baseDir}`);
}

build();
