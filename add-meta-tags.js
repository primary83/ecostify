#!/usr/bin/env node
/* Add robots meta directive, theme-color, and manifest link to all HTML files */
const fs = require('fs');
const path = require('path');

const ROBOTS_META = '    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">';
const THEME_COLOR = '    <meta name="theme-color" content="#1B2A3D">';
const MANIFEST_LINK = '    <link rel="manifest" href="/manifest.json">';

const SKIP_FILES = ['404.html', 'googlec4a4992cd41a409a.html'];

function getAllHtmlFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'api' || item === 'images') continue;
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
let robotsAdded = 0;
let themeAdded = 0;
let manifestAdded = 0;
let skipped = 0;

for (const file of files) {
    const basename = path.basename(file);
    if (SKIP_FILES.includes(basename)) {
        skipped++;
        continue;
    }

    let html = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Add robots meta after viewport meta (if not already present)
    if (!html.includes('name="robots"')) {
        const viewportMatch = html.match(/<meta\s+name="viewport"[^>]*>/);
        if (viewportMatch) {
            html = html.replace(viewportMatch[0], viewportMatch[0] + '\n' + ROBOTS_META);
            robotsAdded++;
            changed = true;
        }
    }

    // Add theme-color after robots meta (or after viewport if robots was just added)
    if (!html.includes('name="theme-color"') && !html.includes('theme-color')) {
        const robotsMatch = html.match(/<meta\s+name="robots"[^>]*>/);
        if (robotsMatch) {
            html = html.replace(robotsMatch[0], robotsMatch[0] + '\n' + THEME_COLOR);
            themeAdded++;
            changed = true;
        }
    }

    // Add manifest link after favicon link (if not already present)
    if (!html.includes('manifest') && !html.includes('manifest.json')) {
        const faviconMatch = html.match(/<link\s+rel="icon"[^>]*>/);
        if (faviconMatch) {
            html = html.replace(faviconMatch[0], faviconMatch[0] + '\n' + MANIFEST_LINK);
            manifestAdded++;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, html, 'utf8');
    }
}

console.log(`\nMeta tags added across ${files.length} files:`);
console.log(`  robots directive: ${robotsAdded}`);
console.log(`  theme-color: ${themeAdded}`);
console.log(`  manifest link: ${manifestAdded}`);
console.log(`  skipped: ${skipped}`);
