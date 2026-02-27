#!/usr/bin/env node
/* Fix blog + cost guide Article schemas: upgrade author from Organization to Person (E-E-A-T) */
const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(fullPath));
        } else if (item.endsWith('.html') && item !== 'index.html') {
            results.push(fullPath);
        }
    }
    return results;
}

const rootDir = __dirname;
const blogDir = path.join(rootDir, 'blog');
const costDir = path.join(rootDir, 'cost');

let files = [];
if (fs.existsSync(blogDir)) files = files.concat(getAllHtmlFiles(blogDir));
if (fs.existsSync(costDir)) files = files.concat(getAllHtmlFiles(costDir));

console.log(`Found ${files.length} article files to check...`);

// Match various spacing patterns of the Organization author
const patterns = [
    /"author"\s*:\s*\{\s*"@type"\s*:\s*"Organization"\s*,\s*"name"\s*:\s*"Ecostify"\s*\}/g,
];

const newAuthor = '"author": { "@type": "Person", "name": "Ecostify Editorial", "url": "https://www.ecostify.com/about" }';

let updated = 0;
let skipped = 0;

for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const pattern of patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(html)) {
            pattern.lastIndex = 0;
            html = html.replace(pattern, newAuthor);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, html, 'utf8');
        updated++;
    } else {
        skipped++;
    }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
