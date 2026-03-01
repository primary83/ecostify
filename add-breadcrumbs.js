/**
 * Add visible breadcrumb navigation + BreadcrumbList JSON-LD to:
 * 1. All blog articles (Home > Blog > [Article Title])
 * 2. All cost guide city index pages (Home > Cost Guides > [City])
 * 3. All cost guide service pages (Home > Cost Guides > [City] > [Service])
 *
 * Skips files that already have visible breadcrumbs.
 */

const fs = require('fs');
const path = require('path');

let totalUpdated = 0;

// Fix common acronyms/words in service names
function fixServiceName(name) {
    return name
        .replace(/\bAc\b/g, 'AC')
        .replace(/\bEv\b/g, 'EV')
        .replace(/\bHvac\b/g, 'HVAC');
}

// ─── BLOG ARTICLES ───
function updateBlogArticles() {
    const blogDir = path.join(__dirname, 'blog');
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    let updated = 0;

    files.forEach(file => {
        const filePath = path.join(blogDir, file);
        let html = fs.readFileSync(filePath, 'utf8');

        // Skip if already has breadcrumbs
        if (html.includes('class="breadcrumbs"')) return;

        // Extract the article title from <h1>
        const h1Match = html.match(/<h1>(.*?)<\/h1>/s);
        if (!h1Match) return;
        const title = h1Match[1].replace(/<[^>]+>/g, '').trim();

        // Build the slug from filename
        const slug = file.replace('.html', '');

        // Build breadcrumb HTML
        const breadcrumbHtml = `            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/blog/">Blog</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <span class="breadcrumb-current">${title}</span>
            </nav>`;

        // Build BreadcrumbList JSON-LD
        const schemaJson = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.ecostify.com/blog/" },
                { "@type": "ListItem", "position": 3, "name": title }
            ]
        });

        // Insert breadcrumb HTML after the back link (results-back)
        // Pattern: after </a> that closes results-back, before article-header
        html = html.replace(
            /(<a href="\/blog\/" class="results-back">[\s\S]*?<\/a>)/,
            '$1\n' + breadcrumbHtml
        );

        // Insert JSON-LD schema before </head>
        if (!html.includes('BreadcrumbList')) {
            html = html.replace(
                '</head>',
                `    <script type="application/ld+json">\n    ${schemaJson}\n    </script>\n</head>`
            );
        }

        fs.writeFileSync(filePath, html, 'utf8');
        updated++;
    });

    console.log(`Blog articles: ${updated} updated`);
    totalUpdated += updated;
}

// ─── COST GUIDE PAGES ───
function updateCostGuidePages() {
    const costDir = path.join(__dirname, 'cost');
    if (!fs.existsSync(costDir)) return;

    let updated = 0;
    const cityDirs = fs.readdirSync(costDir).filter(d => {
        const stat = fs.statSync(path.join(costDir, d));
        return stat.isDirectory();
    });

    cityDirs.forEach(citySlug => {
        const cityDir = path.join(costDir, citySlug);
        const files = fs.readdirSync(cityDir).filter(f => f.endsWith('.html'));

        files.forEach(file => {
            const filePath = path.join(cityDir, file);
            let html = fs.readFileSync(filePath, 'utf8');

            const isIndex = file === 'index.html';
            let changed = false;

            // Extract city display name (e.g., "Atlanta, GA")
            let cityName = '';
            const cityMatch = html.match(/in\s+([\w\s]+,\s*\w{2})/);
            if (cityMatch) {
                cityName = cityMatch[1];
            } else {
                const titleMatch = html.match(/<title>(.*?)<\/title>/);
                if (titleMatch) {
                    const cityFromTitle = titleMatch[1].match(/in\s+([\w\s]+,\s*\w{2})/);
                    if (cityFromTitle) cityName = cityFromTitle[1];
                }
            }
            if (!cityName) {
                cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            }

            // ── Fix service name in existing breadcrumbs (Ac → AC, Ev → EV, Hvac → HVAC) ──
            if (!isIndex && html.includes('class="breadcrumbs"')) {
                const fixed = html.replace(
                    /(<span class="breadcrumb-current">)(.*?)(<\/span>)/,
                    (match, pre, name, post) => pre + fixServiceName(name) + post
                );
                if (fixed !== html) {
                    html = fixed;
                    changed = true;
                }
            }

            // ── Add visible breadcrumbs if missing ──
            if (!html.includes('class="breadcrumbs"')) {
                let breadcrumbHtml;
                if (isIndex) {
                    breadcrumbHtml = `            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/cost/">Cost Guides</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <span class="breadcrumb-current">${cityName}</span>
            </nav>`;
                } else {
                    const serviceSlug = file.replace('.html', '');
                    const serviceName = fixServiceName(serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

                    breadcrumbHtml = `            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/cost/">Cost Guides</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/cost/${citySlug}/">${cityName}</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <span class="breadcrumb-current">${serviceName}</span>
            </nav>`;
                }

                const anyBackLink = html.match(/(<a href="[^"]*" class="results-back">[\s\S]*?<\/a>)/);
                if (anyBackLink) {
                    html = html.replace(anyBackLink[0], anyBackLink[0] + '\n' + breadcrumbHtml);
                    changed = true;
                }
            }

            // ── Add BreadcrumbList JSON-LD if missing ──
            if (!html.includes('BreadcrumbList')) {
                let items;
                if (isIndex) {
                    items = [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
                        { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
                        { "@type": "ListItem", "position": 3, "name": cityName }
                    ];
                } else {
                    const serviceSlug = file.replace('.html', '');
                    const serviceName = fixServiceName(serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
                    items = [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
                        { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
                        { "@type": "ListItem", "position": 3, "name": cityName, "item": `https://www.ecostify.com/cost/${citySlug}/` },
                        { "@type": "ListItem", "position": 4, "name": serviceName }
                    ];
                }

                const schemaJson = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": items
                });

                html = html.replace(
                    '</head>',
                    `    <script type="application/ld+json">\n    ${schemaJson}\n    </script>\n</head>`
                );
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(filePath, html, 'utf8');
                updated++;
            }
        });
    });

    console.log(`Cost guide pages: ${updated} updated`);
    totalUpdated += updated;
}

// ─── RUN ───
console.log('Adding breadcrumbs...\n');
updateBlogArticles();
updateCostGuidePages();
console.log(`\nDone! Total: ${totalUpdated} pages updated`);
