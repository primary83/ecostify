/**
 * Add a dismissible sticky CTA bar to all blog and cost guide pages.
 * Shows after 25% scroll depth. Dismissible via X button.
 */

const fs = require('fs');
const path = require('path');

const stickyHtml = `    <div class="site-sticky-cta" id="site-sticky-cta">
        <span class="site-sticky-cta-text">Get your free estimate in seconds</span>
        <a href="/" class="site-sticky-cta-btn">Get Free Estimate &rarr;</a>
        <button class="site-sticky-cta-close" id="site-sticky-close" aria-label="Dismiss">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
    </div>
    <script>
    (function() {
        var cta = document.getElementById('site-sticky-cta');
        var closeBtn = document.getElementById('site-sticky-close');
        if (!cta) return;
        var shown = false;
        window.addEventListener('scroll', function() {
            if (cta.classList.contains('dismissed')) return;
            var scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (scrollPct > 0.25 && !shown) {
                cta.classList.add('visible');
                shown = true;
            }
        });
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                cta.classList.remove('visible');
                cta.classList.add('dismissed');
            });
        }
    })();
    </script>`;

let updated = 0;

function processFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('class="homepage"')) return;
    if (html.includes('site-sticky-cta')) return;
    if (!html.includes('</body>')) return;

    html = html.replace('</body>', stickyHtml + '\n</body>');
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
}

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) processDir(fullPath);
        else if (entry.name.endsWith('.html')) processFile(fullPath);
    }
}

processDir(path.join(__dirname, 'blog'));
processDir(path.join(__dirname, 'cost'));

console.log(`Sticky CTA added to ${updated} pages`);
