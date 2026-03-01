/**
 * Enhance cost guide pages:
 * 1. Add prominent "Last Updated: February 2026" badge after the article header
 * 2. Add inline "Get a Free Estimate" CTA button after the first cost table
 */

const fs = require('fs');
const path = require('path');

const costDir = path.join(__dirname, 'cost');
let updated = 0;

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Skip the cost index page
    if (filePath.endsWith('cost/index.html') || filePath.endsWith('cost\\index.html')) return;

    // ── 1. Add "Last Updated" badge after article-header ──
    if (!html.includes('last-updated-badge')) {
        const updatedBadge = `\n            <div class="last-updated-badge">Last Updated: February 2026</div>`;

        // Insert after article-header closing div (before article-body)
        html = html.replace(
            /(<div class="article-body">)/,
            updatedBadge + '\n            $1'
        );
        changed = true;
    }

    // ── 2. Add inline CTA after the first cost-table ──
    // First, remove any incorrectly placed inline-cta from inside a cost-table
    html = html.replace(/\n<div class="inline-cta">\n    <a href="\/" class="btn btn-accent">Get a Free Estimate &rarr;<\/a>\n    <span class="inline-cta-sub">AI-powered &middot; No account needed &middot; Always free<\/span>\n<\/div>/g, '');

    if (!html.includes('inline-cta')) {
        const ctaHtml = `\n<div class="inline-cta">\n    <a href="/" class="btn btn-accent">Get a Free Estimate &rarr;</a>\n    <span class="inline-cta-sub">AI-powered &middot; No account needed &middot; Always free</span>\n</div>`;

        // Find the first cost-table and its proper closing </div> by tracking nesting
        const tableStart = html.indexOf('<div class="cost-table">');
        if (tableStart !== -1) {
            let depth = 0;
            let i = tableStart;
            let tableEnd = -1;
            while (i < html.length) {
                if (html.slice(i, i + 4) === '<div') {
                    depth++;
                    i += 4;
                } else if (html.slice(i, i + 6) === '</div>') {
                    depth--;
                    if (depth === 0) {
                        tableEnd = i + 6;
                        break;
                    }
                    i += 6;
                } else {
                    i++;
                }
            }
            if (tableEnd !== -1) {
                html = html.slice(0, tableEnd) + ctaHtml + html.slice(tableEnd);
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, html, 'utf8');
        updated++;
    }
}

processDir(costDir);
console.log(`Cost guide pages: ${updated} updated`);
