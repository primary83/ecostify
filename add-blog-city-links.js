#!/usr/bin/env node
/* Add city cost guide links to blog posts to create internal link clusters.
   Each blog post gets a "Compare prices by city" section before the footer/closing tags. */
const fs = require('fs');
const path = require('path');

// Blog slug → corresponding city service slug mapping
const BLOG_TO_SERVICE = {
    'brake-pad-replacement-cost': 'brake-pad-replacement',
    'oil-change-cost': 'oil-change',
    'how-much-does-a-car-wrap-cost': 'car-wrap',
    'ceramic-coating-cost': 'ceramic-coating',
    'window-tinting-cost': 'window-tinting',
    'transmission-repair-cost': 'transmission-repair',
    'ev-charger-installation-cost': 'ev-charger-installation',
    'kitchen-remodel-cost-guide': 'kitchen-remodel',
    'bathroom-remodel-cost': 'bathroom-remodel',
    'roof-replacement-cost': 'roof-replacement',
    'hvac-replacement-cost': 'hvac-replacement',
    'fence-installation-cost': 'fence-installation',
    'interior-painting-cost': 'interior-painting',
    'flooring-installation-cost': 'flooring-installation',
    'garage-door-replacement-cost': 'garage-door-replacement',
    'gutter-installation-cost': 'ac-repair', // closest match — gutters don't have a direct match, link to general
};

const CITIES = [
    { slug: 'new-york', name: 'New York' },
    { slug: 'los-angeles', name: 'Los Angeles' },
    { slug: 'chicago', name: 'Chicago' },
    { slug: 'houston', name: 'Houston' },
    { slug: 'phoenix', name: 'Phoenix' },
    { slug: 'dallas', name: 'Dallas' },
    { slug: 'miami', name: 'Miami' },
    { slug: 'atlanta', name: 'Atlanta' },
    { slug: 'seattle', name: 'Seattle' },
    { slug: 'denver', name: 'Denver' },
];

const blogDir = path.join(__dirname, 'blog');
let updated = 0;

for (const [blogSlug, serviceSlug] of Object.entries(BLOG_TO_SERVICE)) {
    const filePath = path.join(blogDir, `${blogSlug}.html`);
    if (!fs.existsSync(filePath)) {
        console.log(`  SKIP: ${blogSlug}.html not found`);
        continue;
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has city links section
    if (html.includes('compare-cities') || html.includes('Compare Prices by City')) {
        console.log(`  SKIP: ${blogSlug}.html already has city links`);
        continue;
    }

    // Build the city links section
    const cityLinks = CITIES.map(c =>
        `<a href="/cost/${c.slug}/${serviceSlug}">${c.name}</a>`
    ).join(' &middot; ');

    const section = `
            <div class="compare-cities" style="margin-top:40px;padding:24px;background:var(--bg-raised);border:1px solid var(--border);border-radius:12px;">
                <h3 style="margin:0 0 12px;font-size:1.1rem;">Compare Prices by City</h3>
                <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.8;">${cityLinks}</p>
                <a href="/cost/" style="display:inline-block;margin-top:12px;font-size:0.85rem;color:var(--accent);">View all 20 cities &rarr;</a>
            </div>`;

    // Insert before the closing </div> of article-body
    // Look for the last </div> before </article> or footer
    const articleBodyEnd = html.lastIndexOf('</div>', html.indexOf('</article>'));
    if (articleBodyEnd !== -1) {
        html = html.slice(0, articleBodyEnd) + section + '\n        ' + html.slice(articleBodyEnd);
        fs.writeFileSync(filePath, html, 'utf8');
        updated++;
        console.log(`  ✓ ${blogSlug}.html → linked to ${CITIES.length} cities`);
    } else {
        console.log(`  WARN: Could not find insertion point in ${blogSlug}.html`);
    }
}

console.log(`\nDone: ${updated} blog posts updated with city links`);
