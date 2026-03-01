/**
 * Blog Enhancements:
 * 1. Add author byline ("By Ecostify Team · Updated [date]") after article-meta
 * 2. Auto-generate table of contents from H2 headings at top of article-body
 * 3. Add "Related Articles" section at the bottom (3 same-category articles)
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');

// ── Build category map ──
const articles = [];
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

files.forEach(file => {
    const html = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const badgeMatch = html.match(/blog-card-badge[^"]*">(Auto|Home)<\/div>/);
    const category = badgeMatch ? badgeMatch[1] : 'Auto';
    const h1Match = html.match(/<h1>(.*?)<\/h1>/s);
    const title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').trim() : file;
    const slug = file.replace('.html', '');
    articles.push({ file, slug, category, title });
});

let updated = 0;

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const currentSlug = file.replace('.html', '');
    const currentArticle = articles.find(a => a.file === file);
    const category = currentArticle ? currentArticle.category : 'Auto';

    // ── 1. Add author byline after article-meta ──
    if (!html.includes('article-byline')) {
        // Extract the date from article-meta
        const metaMatch = html.match(/Updated\s+([\w]+\s+\d{4})/);
        const updateDate = metaMatch ? metaMatch[1] : 'February 2026';

        const bylineHtml = `<div class="article-byline">By <strong>Ecostify Team</strong> &middot; Updated ${updateDate}</div>`;

        // Handle both inline and multi-line article-header formats
        // Insert after the closing </p> of article-meta
        html = html.replace(
            /(<p class="article-meta">.*?<\/p>)/s,
            '$1\n                ' + bylineHtml
        );
        changed = true;
    }

    // ── 2. Auto-generate TOC from H2s ──
    if (!html.includes('article-toc')) {
        // Extract all H2 headings from the article body
        const h2Regex = /<h2>(.*?)<\/h2>/gs;
        const headings = [];
        let match;
        while ((match = h2Regex.exec(html)) !== null) {
            const text = match[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').trim();
            const id = text.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            headings.push({ text, id });
        }

        if (headings.length >= 3) {
            // Add IDs to H2s in the HTML
            let h2Index = 0;
            html = html.replace(/<h2>(.*?)<\/h2>/gs, (match, inner) => {
                const heading = headings[h2Index++];
                if (heading) {
                    return `<h2 id="${heading.id}">${inner}</h2>`;
                }
                return match;
            });

            // Build TOC HTML
            const tocItems = headings.map(h =>
                `                        <li><a href="#${h.id}">${h.text}</a></li>`
            ).join('\n');

            const tocHtml = `
                <nav class="article-toc">
                    <p class="article-toc-title">In This Article</p>
                    <ol>
${tocItems}
                    </ol>
                </nav>
`;

            // Insert TOC at the start of article-body, after the opening tag
            html = html.replace(
                /(<div class="article-body">)/,
                '$1\n' + tocHtml
            );
            changed = true;
        }
    }

    // ── 3. Add Related Articles section ──
    if (!html.includes('related-articles')) {
        // Get 3 same-category articles (excluding current)
        const sameCategory = articles.filter(a => a.category === category && a.slug !== currentSlug);
        // Shuffle and pick 3 (deterministic based on slug for consistency)
        const seed = currentSlug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const shuffled = sameCategory.sort((a, b) => {
            const hashA = (a.slug.charCodeAt(0) * 31 + seed) % 1000;
            const hashB = (b.slug.charCodeAt(0) * 31 + seed) % 1000;
            return hashA - hashB;
        });
        const related = shuffled.slice(0, 3);

        if (related.length >= 3) {
            const relatedHtml = `
                <section class="related-articles">
                    <h3>Related Articles</h3>
                    <div class="related-articles-grid">
${related.map(a => `                        <a href="/blog/${a.slug}" class="related-article-card">
                            <span class="related-article-badge">${a.category}</span>
                            <span class="related-article-title">${a.title.replace(/&/g, '&amp;')}</span>
                        </a>`).join('\n')}
                    </div>
                </section>
`;

            // Insert before the article-cta div, or before compare-cities, or before closing article-body
            if (html.includes('class="article-cta"')) {
                html = html.replace(
                    /(\s*<div class="article-cta">)/,
                    '\n' + relatedHtml + '$1'
                );
            } else if (html.includes('class="compare-cities"')) {
                html = html.replace(
                    /(\s*<div class="compare-cities")/,
                    '\n' + relatedHtml + '$1'
                );
            }
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, html, 'utf8');
        updated++;
    }
});

console.log(`Blog enhancements: ${updated} articles updated`);
