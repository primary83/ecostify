// Generate comprehensive sitemap.xml from all HTML files
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE = 'https://www.ecostify.com';
const TODAY = '2026-02-21';

// Collect all HTML files
const urls = [];

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api' || entry.name === 'images') continue;
            walkDir(fullPath);
        } else if (entry.name.endsWith('.html')) {
            // Skip non-page files
            if (entry.name === '404.html' || entry.name.startsWith('google')) continue;

            let rel = path.relative(ROOT, fullPath).replace(/\\/g, '/');

            // Convert to URL path (cleanUrls strips .html)
            if (rel === 'index.html') {
                rel = '';
            } else if (rel.endsWith('/index.html')) {
                rel = rel.replace('/index.html', '/');
            } else {
                rel = rel.replace('.html', '');
            }

            urls.push(rel);
        }
    }
}

walkDir(ROOT);

// Sort URLs for clean output
urls.sort();

// Assign priorities
function getPriority(url) {
    if (url === '') return '1.0';           // homepage
    if (url === 'estimate') return '0.9';
    if (url === 'directory') return '0.9';
    if (url === 'blog/') return '0.8';
    if (url === 'cost/') return '0.8';
    if (url.startsWith('blog/')) return '0.7';
    if (url.match(/^cost\/[^/]+\/$/)) return '0.7'; // city index
    if (url.startsWith('cost/')) return '0.6';
    if (['about', 'contact'].includes(url)) return '0.5';
    return '0.4'; // privacy, terms, disclaimer
}

function getChangefreq(url) {
    if (url === '' || url === 'estimate' || url === 'directory') return 'weekly';
    if (url === 'blog/' || url === 'cost/') return 'weekly';
    if (url.startsWith('blog/') || url.startsWith('cost/')) return 'monthly';
    return 'monthly';
}

// Build XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const url of urls) {
    const loc = url === '' ? BASE + '/' : BASE + '/' + url;
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${getChangefreq(url)}</changefreq>\n`;
    xml += `    <priority>${getPriority(url)}</priority>\n`;
    xml += `  </url>\n`;
}

xml += '</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`Sitemap generated with ${urls.length} URLs`);
