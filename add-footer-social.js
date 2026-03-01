/**
 * Add social media links to the non-homepage footer (.footer class)
 * across all blog and cost guide pages.
 */

const fs = require('fs');
const path = require('path');

const socialHtml = `                <div class="footer-social">
                    <a href="https://instagram.com/ecostify" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="https://tiktok.com/@ecostify" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.19 8.19 0 005.58 2.18v-3.45a4.81 4.81 0 01-3.77-1.47V6.69h3.77z"/></svg>
                    </a>
                    <a href="https://x.com/ecostify" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                </div>`;

let updated = 0;

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name.endsWith('.html') && entry.name !== 'index.html' || entry.name === 'index.html') {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip homepage and files that already have social links
    if (html.includes('class="homepage"')) return;
    if (html.includes('footer-social')) return;
    if (!html.includes('class="footer"')) return;

    // Insert social links after the footer-copy span
    html = html.replace(
        /(<span class="footer-copy">&copy; 2026 Ecostify<\/span>)/,
        '$1\n' + socialHtml
    );

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
}

// Process blog and cost directories, plus root pages
const rootDir = __dirname;

// Process blog/
processDir(path.join(rootDir, 'blog'));

// Process cost/
processDir(path.join(rootDir, 'cost'));

// Process root-level HTML pages (about, contact, privacy, etc.)
const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && f !== 'index.html');
rootFiles.forEach(f => processFile(path.join(rootDir, f)));

console.log(`Updated ${updated} files with social links in footer`);
