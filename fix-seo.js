#!/usr/bin/env node
/* Fix SEO issues across all pages:
   1. Add og:image + twitter:image to pages missing them
   2. Fix blog nav to include Cost Guides link
*/
const fs = require('fs');
const path = require('path');

const OG_IMAGE = 'https://www.ecostify.com/images/og-image.png';

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
let ogAdded = 0;
let twitterFixed = 0;
let navFixed = 0;

for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Add og:image if missing
    if (!html.includes('og:image') && html.includes('</head>')) {
        // Insert og:image before </head> (after other og tags)
        const ogImageTags = `    <meta property="og:image" content="${OG_IMAGE}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n`;

        // Try to insert after last og: tag
        const ogMatch = html.lastIndexOf('<meta property="og:');
        if (ogMatch !== -1) {
            const lineEnd = html.indexOf('\n', ogMatch);
            if (lineEnd !== -1) {
                html = html.slice(0, lineEnd + 1) + ogImageTags + html.slice(lineEnd + 1);
                changed = true;
                ogAdded++;
            }
        }
    }

    // 2. Add twitter:image if missing but has twitter:card
    if (!html.includes('twitter:image') && html.includes('twitter:card') && html.includes('</head>')) {
        const twitterImageTag = `    <meta name="twitter:image" content="${OG_IMAGE}">\n`;
        const twitterMatch = html.lastIndexOf('<meta name="twitter:');
        if (twitterMatch !== -1) {
            const lineEnd = html.indexOf('\n', twitterMatch);
            if (lineEnd !== -1) {
                html = html.slice(0, lineEnd + 1) + twitterImageTag + html.slice(lineEnd + 1);
                changed = true;
                twitterFixed++;
            }
        }
    }

    // 3. Upgrade twitter:card from "summary" to "summary_large_image"
    if (html.includes('content="summary"') && html.includes('twitter:card')) {
        html = html.replace(
            '<meta name="twitter:card" content="summary">',
            '<meta name="twitter:card" content="summary_large_image">'
        );
        changed = true;
        twitterFixed++;
    }

    // 4. Fix blog nav — add Cost Guides link if missing
    const relPath = path.relative(rootDir, file);
    if (relPath.startsWith('blog') && !html.includes('/cost/') && html.includes('nav-links')) {
        // Add Cost Guides link before Blog link in nav
        html = html.replace(
            '<a href="/blog/">Blog</a>',
            '<a href="/cost/">Cost Guides</a>\n                <a href="/blog/">Blog</a>'
        );
        changed = true;
        navFixed++;
        console.log(`  NAV fixed: ${relPath}`);
    }

    if (changed) {
        fs.writeFileSync(file, html, 'utf8');
    }
}

console.log(`\nDone:`);
console.log(`  og:image added to ${ogAdded} files`);
console.log(`  twitter:image/card fixed on ${twitterFixed} files`);
console.log(`  Blog nav fixed on ${navFixed} files`);
