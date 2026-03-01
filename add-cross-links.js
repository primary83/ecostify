/**
 * Add internal cross-links to cost guide service pages:
 * 1. "See more services in [City]" — links to sibling services in the same city
 * 2. "Compare [Service] costs in other cities" — links to same service in other cities
 *
 * Replaces existing "Other Auto/Home Services" and "Cost in Other Cities" sections
 * with better-formatted cross-link blocks.
 */

const fs = require('fs');
const path = require('path');

const costDir = path.join(__dirname, 'cost');

// Service slug -> nice display name
const serviceNames = {
    'ac-repair': 'AC Repair & Recharge',
    'brake-pad-replacement': 'Brake Pad Replacement',
    'car-wrap': 'Full Car Wrap',
    'ceramic-coating': 'Ceramic Coating',
    'ev-charger-installation': 'EV Charger Installation',
    'oil-change': 'Oil Change',
    'transmission-repair': 'Transmission Repair',
    'window-tinting': 'Window Tinting',
    'bathroom-remodel': 'Bathroom Remodel',
    'fence-installation': 'Fence Installation',
    'flooring-installation': 'Flooring Installation',
    'garage-door-replacement': 'Garage Door Replacement',
    'hvac-replacement': 'HVAC Replacement',
    'interior-painting': 'Interior Painting',
    'kitchen-remodel': 'Kitchen Remodel',
    'roof-replacement': 'Roof Replacement'
};

// Build city slug -> display name map
const cityNames = {};
const cityDirs = fs.readdirSync(costDir).filter(d => {
    try { return fs.statSync(path.join(costDir, d)).isDirectory(); } catch { return false; }
});

cityDirs.forEach(slug => {
    const indexPath = path.join(costDir, slug, 'index.html');
    if (!fs.existsSync(indexPath)) return;
    const html = fs.readFileSync(indexPath, 'utf8');
    const m = html.match(/in\s+([\w\s]+,\s*\w{2})/);
    if (m) cityNames[slug] = m[1];
    else cityNames[slug] = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
});

// Top 10 cities by population for cross-links
const topCities = [
    'houston', 'los-angeles', 'chicago', 'phoenix', 'philadelphia',
    'dallas', 'new-york', 'san-antonio', 'miami', 'atlanta'
];

let updated = 0;

cityDirs.forEach(citySlug => {
    const cityDir = path.join(costDir, citySlug);
    const files = fs.readdirSync(cityDir).filter(f => f.endsWith('.html') && f !== 'index.html');

    files.forEach(file => {
        const filePath = path.join(cityDir, file);
        let html = fs.readFileSync(filePath, 'utf8');

        // Skip if already has our new cross-links
        if (html.includes('class="cross-links"')) return;

        const serviceSlug = file.replace('.html', '');
        const serviceName = serviceNames[serviceSlug] || serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const cityName = cityNames[citySlug] || citySlug;

        // Build "More services in [City]" links
        const siblingServices = Object.keys(serviceNames).filter(s => s !== serviceSlug);
        const siblingLinks = siblingServices.map(s =>
            `<a href="/cost/${citySlug}/${s}">${serviceNames[s]}</a>`
        ).join(' ');

        // Build "Compare in other cities" links (top 10, excluding current)
        const otherCities = topCities.filter(c => c !== citySlug).slice(0, 8);
        const cityLinks = otherCities.map(c =>
            `<a href="/cost/${c}/${serviceSlug}">${cityNames[c] || c}</a>`
        ).join(' ');

        const crossLinksHtml = `
                <div class="cross-links">
                    <h3>More services in ${cityName.split(',')[0]}</h3>
                    <div class="cross-links-list">${siblingLinks}</div>
                </div>
                <div class="cross-links" style="margin-top:12px;">
                    <h3>${serviceName} in other cities</h3>
                    <div class="cross-links-list">${cityLinks}</div>
                </div>`;

        // Insert before the article-cta div
        if (html.includes('class="article-cta"')) {
            html = html.replace(
                /(\s*<div class="article-cta">)/,
                crossLinksHtml + '\n$1'
            );
        } else if (html.includes('class="cost-disclaimer"')) {
            html = html.replace(
                /(\s*<div class="cost-disclaimer">)/,
                crossLinksHtml + '\n$1'
            );
        }

        fs.writeFileSync(filePath, html, 'utf8');
        updated++;
    });
});

console.log(`Cross-links added to ${updated} cost guide pages`);
