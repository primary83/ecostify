// Batch-update all HTML pages to add "Directory" link to navigation
// Runs: node add-directory-nav.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SKIP_FILES = ['directory.html', 'index.html', 'about.html']; // Already updated

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

function processFile(filePath) {
    const relativePath = path.relative(ROOT, filePath);

    // Skip files we already updated manually
    if (SKIP_FILES.includes(path.basename(filePath)) && path.dirname(filePath) === ROOT) {
        skippedCount++;
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Skip if already has directory link
        if (content.includes('href="/directory"')) {
            skippedCount++;
            return;
        }

        // Pattern 1: Blog link followed by How It Works (most subpages)
        // <a href="/blog/">Blog</a>\n                <a href="/#how">How It Works</a>
        if (content.includes('<a href="/blog/">Blog</a>') && content.includes('<a href="/#how">How It Works</a>')) {
            content = content.replace(
                '<a href="/blog/">Blog</a>\n                <a href="/#how">How It Works</a>',
                '<a href="/blog/">Blog</a>\n                <a href="/directory">Directory</a>\n                <a href="/#how">How It Works</a>'
            );
            fs.writeFileSync(filePath, content, 'utf8');
            updatedCount++;
            console.log('Updated:', relativePath);
            return;
        }

        // Pattern 2: Blog link at end of nav-links (blog articles without How It Works)
        // Some blog/cost pages might have Blog as the last link before </div>
        if (content.includes('<a href="/blog/">Blog</a>')) {
            // Try with various whitespace patterns
            const patterns = [
                // Pattern with 16 spaces indent
                { find: '<a href="/blog/">Blog</a>\n            </div>', replace: '<a href="/blog/">Blog</a>\n                <a href="/directory">Directory</a>\n            </div>' },
                // Pattern with tab indent
                { find: '<a href="/blog/">Blog</a>\n\t\t\t</div>', replace: '<a href="/blog/">Blog</a>\n\t\t\t\t<a href="/directory">Directory</a>\n\t\t\t</div>' },
            ];

            for (const p of patterns) {
                if (content.includes(p.find)) {
                    content = content.replace(p.find, p.replace);
                    fs.writeFileSync(filePath, content, 'utf8');
                    updatedCount++;
                    console.log('Updated (pattern 2):', relativePath);
                    return;
                }
            }

            // Generic fallback: insert after the Blog link line
            const blogLinkRegex = /(<a href="\/blog\/">Blog<\/a>)\s*\n(\s*)/;
            const match = content.match(blogLinkRegex);
            if (match) {
                const indent = match[2];
                content = content.replace(
                    blogLinkRegex,
                    `$1\n${indent}<a href="/directory">Directory</a>\n${indent}`
                );
                fs.writeFileSync(filePath, content, 'utf8');
                updatedCount++;
                console.log('Updated (regex):', relativePath);
                return;
            }
        }

        skippedCount++;
        console.log('No matching pattern:', relativePath);

    } catch (err) {
        errorCount++;
        console.error('Error processing', relativePath, err.message);
    }
}

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip hidden dirs, node_modules, .vercel
            if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api' || entry.name === 'images') continue;
            walkDir(fullPath);
        } else if (entry.name.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

console.log('Adding Directory nav link to all HTML pages...\n');
walkDir(ROOT);
console.log(`\nDone! Updated: ${updatedCount} | Skipped: ${skippedCount} | Errors: ${errorCount}`);
