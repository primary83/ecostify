/**
 * Add inline email capture form to all blog articles.
 * Inserts after the 2nd <h2> section (before the 3rd <h2>).
 * Skips blog/index.html and files that already have the form.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');

const EMAIL_FORM_HTML = `
                <div class="blog-email-capture">
                    <h3>Get local price alerts — enter your email</h3>
                    <p>We'll send pricing updates and money-saving tips for services in your area. No spam, unsubscribe anytime.</p>
                    <form class="blog-email-form" action="https://formspree.io/f/xjggywyr" method="POST">
                        <input type="email" name="email" placeholder="you@email.com" required aria-label="Email address">
                        <input type="hidden" name="_source" value="blog-inline">
                        <button type="submit">Subscribe</button>
                    </form>
                    <div class="blog-email-success" hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <span>You're in! Check your inbox.</span>
                    </div>
                </div>
`;

const EMAIL_SCRIPT = `
    <script>
    document.querySelectorAll('.blog-email-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = form.querySelector('input[type="email"]').value;
            fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, _source: 'blog-inline' })
            }).then(function(res) {
                if (res.ok) {
                    form.hidden = true;
                    form.nextElementSibling.hidden = false;
                    if (typeof gtag === 'function') gtag('event', 'email_captured', { source: 'blog_inline' });
                }
            }).catch(function() {});
        });
    });
    </script>`;

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has the email capture
    if (html.includes('blog-email-capture')) {
        skipped++;
        return;
    }

    // Find the 3rd <h2> (insert before it, which is after the 2nd section)
    const h2Regex = /<h2>/gi;
    let match;
    let count = 0;
    let insertPos = -1;

    while ((match = h2Regex.exec(html)) !== null) {
        count++;
        if (count === 3) {
            insertPos = match.index;
            break;
        }
    }

    if (insertPos === -1) {
        // If fewer than 3 h2s, insert before the last h2
        h2Regex.lastIndex = 0;
        count = 0;
        while ((match = h2Regex.exec(html)) !== null) {
            count++;
            insertPos = match.index;
        }
    }

    if (insertPos === -1) {
        console.log(`  SKIP (no h2): ${file}`);
        skipped++;
        return;
    }

    // Insert the email form before the target h2
    html = html.slice(0, insertPos) + EMAIL_FORM_HTML + '\n' + html.slice(insertPos);

    // Add the script before </body> if not already present
    if (!html.includes('blog-email-form')) {
        // This shouldn't happen since we just added it, but safety check
    }
    html = html.replace('</body>', EMAIL_SCRIPT + '\n</body>');

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log(`  OK: ${file}`);
});

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
