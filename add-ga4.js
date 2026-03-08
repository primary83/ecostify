#!/usr/bin/env node
/* Add GA4 tracking snippet to all HTML files that don't already have it */
const fs = require('fs');
const path = require('path');

const GA4_ID = 'G-FCVYRYEKNX';
const GA4_SNIPPET = `
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');</script>`;

function getAllHtmlFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
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
let added = 0;
let skipped = 0;

for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');

    // Skip if already has GA4
    if (html.includes(GA4_ID) || html.includes('googletagmanager.com/gtag')) {
        skipped++;
        continue;
    }

    // Insert right before </head>
    if (html.includes('</head>')) {
        html = html.replace('</head>', GA4_SNIPPET + '\n</head>');
        fs.writeFileSync(file, html, 'utf8');
        added++;
        console.log(`✓ ${path.relative(rootDir, file)}`);
    }
}

console.log(`\nDone: ${added} files updated, ${skipped} already had GA4, ${files.length} total HTML files`);
