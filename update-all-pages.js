#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const STYLES_LINK = '<link rel="stylesheet" href="/styles.css">';
const LIGHT_CSS_LINK = '<link rel="stylesheet" href="/global-light.css">';

const OLD_FONT = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
const NEW_FONT = '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

function getAllHtmlFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'api') continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(fullPath));
        } else if (item.endsWith('.html')) {
            results.push(fullPath);
        }
    }
    return results;
}

const rootDir = __dirname;
const files = getAllHtmlFiles(rootDir);
let updated = 0, skipped = 0, errors = 0;

for (const file of files) {
    const relPath = path.relative(rootDir, file);

    // Skip index.html (homepage already has its own light theme via homepage.css)
    if (relPath === 'index.html') {
        skipped++;
        console.log(`SKIP ${relPath} (homepage)`);
        continue;
    }

    try {
        let html = fs.readFileSync(file, 'utf8');
        let changed = false;

        // 1. Add global-light.css link AFTER styles.css link
        if (!html.includes('global-light.css')) {
            if (html.includes(STYLES_LINK)) {
                html = html.replace(STYLES_LINK, STYLES_LINK + '\n    ' + LIGHT_CSS_LINK);
                changed = true;
            }
        }

        // 2. Replace Inter font import with DM Sans + Outfit
        if (html.includes('family=Inter')) {
            html = html.replace(OLD_FONT, NEW_FONT);
            changed = true;
        }

        // 3. Update logo HTML: "ecostify" → tri-color spans (e + cost + ify)
        const OLD_LOGO = '<a href="/" class="logo"><span class="logo-eco">eco</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>';
        const NEW_LOGO = '<a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>';
        if (html.includes(OLD_LOGO)) {
            html = html.split(OLD_LOGO).join(NEW_LOGO);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, html, 'utf8');
            updated++;
            console.log(`OK   ${relPath}`);
        } else {
            skipped++;
            console.log(`SKIP ${relPath} (already updated)`);
        }
    } catch (err) {
        errors++;
        console.error(`ERR  ${relPath}: ${err.message}`);
    }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors} errors, ${files.length} total files`);
