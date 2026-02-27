#!/usr/bin/env node
/* Add BreadcrumbList schema to city service pages and ItemList schema to city hub pages */
const fs = require('fs');
const path = require('path');

const CITIES = [
    { slug: 'houston', name: 'Houston', state: 'TX' },
    { slug: 'los-angeles', name: 'Los Angeles', state: 'CA' },
    { slug: 'chicago', name: 'Chicago', state: 'IL' },
    { slug: 'phoenix', name: 'Phoenix', state: 'AZ' },
    { slug: 'philadelphia', name: 'Philadelphia', state: 'PA' },
    { slug: 'san-antonio', name: 'San Antonio', state: 'TX' },
    { slug: 'dallas', name: 'Dallas', state: 'TX' },
    { slug: 'san-diego', name: 'San Diego', state: 'CA' },
    { slug: 'denver', name: 'Denver', state: 'CO' },
    { slug: 'miami', name: 'Miami', state: 'FL' },
    { slug: 'new-york', name: 'New York', state: 'NY' },
    { slug: 'atlanta', name: 'Atlanta', state: 'GA' },
    { slug: 'seattle', name: 'Seattle', state: 'WA' },
    { slug: 'tampa', name: 'Tampa', state: 'FL' },
    { slug: 'minneapolis', name: 'Minneapolis', state: 'MN' },
    { slug: 'charlotte', name: 'Charlotte', state: 'NC' },
    { slug: 'las-vegas', name: 'Las Vegas', state: 'NV' },
    { slug: 'austin', name: 'Austin', state: 'TX' },
    { slug: 'nashville', name: 'Nashville', state: 'TN' },
    { slug: 'portland', name: 'Portland', state: 'OR' },
];

const SERVICES = [
    { slug: 'brake-pad-replacement', name: 'Brake Pad Replacement' },
    { slug: 'oil-change', name: 'Oil Change' },
    { slug: 'car-wrap', name: 'Full Car Wrap' },
    { slug: 'ceramic-coating', name: 'Ceramic Coating' },
    { slug: 'window-tinting', name: 'Window Tinting' },
    { slug: 'transmission-repair', name: 'Transmission Repair' },
    { slug: 'ev-charger-installation', name: 'EV Charger Installation' },
    { slug: 'ac-repair', name: 'AC Repair' },
    { slug: 'kitchen-remodel', name: 'Kitchen Remodel' },
    { slug: 'bathroom-remodel', name: 'Bathroom Remodel' },
    { slug: 'roof-replacement', name: 'Roof Replacement' },
    { slug: 'hvac-replacement', name: 'HVAC Replacement' },
    { slug: 'fence-installation', name: 'Fence Installation' },
    { slug: 'interior-painting', name: 'Interior Painting' },
    { slug: 'flooring-installation', name: 'Flooring Installation' },
    { slug: 'garage-door-replacement', name: 'Garage Door Replacement' },
];

const costDir = path.join(__dirname, 'cost');
let hubsUpdated = 0;
let servicesUpdated = 0;

for (const city of CITIES) {
    const cityDir = path.join(costDir, city.slug);
    if (!fs.existsSync(cityDir)) continue;

    // 1. Add ItemList schema to city hub page
    const hubPath = path.join(cityDir, 'index.html');
    if (fs.existsSync(hubPath)) {
        let html = fs.readFileSync(hubPath, 'utf8');
        if (!html.includes('ItemList') && !html.includes('BreadcrumbList')) {
            const itemListSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": `Auto & Home Service Costs in ${city.name}, ${city.state}`,
                "url": `https://www.ecostify.com/cost/${city.slug}/`,
                "numberOfItems": 16,
                "itemListElement": SERVICES.map((svc, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": `${svc.name} Cost in ${city.name}`,
                    "url": `https://www.ecostify.com/cost/${city.slug}/${svc.slug}`
                }))
            };

            const breadcrumbSchema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
                    { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
                    { "@type": "ListItem", "position": 3, "name": `${city.name}, ${city.state}` }
                ]
            };

            const schemaBlock = `    <script type="application/ld+json">\n    ${JSON.stringify(itemListSchema)}\n    </script>\n    <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbSchema)}\n    </script>\n`;

            html = html.replace('</head>', schemaBlock + '</head>');
            fs.writeFileSync(hubPath, html, 'utf8');
            hubsUpdated++;
        }
    }

    // 2. Add BreadcrumbList schema to service pages
    for (const svc of SERVICES) {
        const svcPath = path.join(cityDir, `${svc.slug}.html`);
        if (!fs.existsSync(svcPath)) continue;

        let html = fs.readFileSync(svcPath, 'utf8');
        if (html.includes('BreadcrumbList')) continue;

        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
                { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
                { "@type": "ListItem", "position": 3, "name": `${city.name}, ${city.state}`, "item": `https://www.ecostify.com/cost/${city.slug}/` },
                { "@type": "ListItem", "position": 4, "name": `${svc.name}` }
            ]
        };

        const schemaBlock = `    <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbSchema)}\n    </script>\n`;

        html = html.replace('</head>', schemaBlock + '</head>');
        fs.writeFileSync(svcPath, html, 'utf8');
        servicesUpdated++;
    }
}

console.log(`Done:`);
console.log(`  City hub pages updated with ItemList + BreadcrumbList: ${hubsUpdated}`);
console.log(`  Service pages updated with BreadcrumbList: ${servicesUpdated}`);
