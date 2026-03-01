/**
 * Add category-based hero image placeholders to all blog articles.
 * Auto articles get blue-tone gradients, Home articles get green-tone gradients.
 * Each article gets a unique SVG icon based on its topic.
 */

const fs = require('fs');
const path = require('path');

// Map slugs to icons (SVG paths) for visual variety
const iconMap = {
  // Auto
  'oil-change': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 8c-4 8-12 14-12 24a12 12 0 0024 0c0-10-8-16-12-24z"/><circle cx="32" cy="34" r="4"/></svg>',
  'brake-pad-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="8"/><path d="M32 12v4m0 32v4M12 32h4m32 0h4"/></svg>',
  'car-ac-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 8v48M20 14l12 12 12-12M20 50l12-12 12 12M8 32h48"/></svg>',
  'car-battery-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="20" width="40" height="28" rx="3"/><path d="M24 20v-6h4v6m12-6v6h4v-6M20 34h8m16 0h-8m-4-4v8"/></svg>',
  'car-detailing': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 48l4-12h24l4 12"/><path d="M12 48h40v4H12z"/><circle cx="22" cy="48" r="4"/><circle cx="42" cy="48" r="4"/><path d="M20 36l-2-8a16 16 0 0128 0l-2 8"/></svg>',
  'car-paint-protection-film': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="14" width="36" height="36" rx="4"/><path d="M14 14l36 36M50 14L14 50"/><path d="M20 14v36m12-36v36m12-36v36"/></svg>',
  'car-paint-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M42 12l10 10-28 28H14v-10z"/><path d="M36 18l10 10"/></svg>',
  'car-stereo-installation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="16" width="40" height="32" rx="4"/><circle cx="32" cy="34" r="8"/><circle cx="32" cy="34" r="3"/><path d="M18 22h28"/></svg>',
  'ceramic-coating': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 48l4-12h24l4 12"/><path d="M12 48h40v4H12z"/><path d="M20 36l-2-8a16 16 0 0128 0l-2 8"/><path d="M22 24c4-2 16-2 20 0" stroke-dasharray="3 2"/></svg>',
  'check-engine-light-diagnosis': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 42V28a4 4 0 014-4h28a4 4 0 014 4v14"/><path d="M14 42h36"/><path d="M24 24v-6m16 6v-6"/><circle cx="32" cy="34" r="4"/><path d="M32 38v4"/></svg>',
  'exhaust-system-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 40h12l4-4h16l4 4h12"/><circle cx="20" cy="40" r="6"/><path d="M44 34c4-6 8-12 12-12m-12 12c2-8 6-16 8-18m-8 18c0-10 4-20 4-24"/></svg>',
  'how-much-does-a-car-wrap': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 48l4-12h24l4 12"/><path d="M12 48h40v4H12z"/><circle cx="22" cy="48" r="4"/><circle cx="42" cy="48" r="4"/><path d="M20 36l-2-8a16 16 0 0128 0l-2 8"/><path d="M24 28h16" stroke-dasharray="4 3"/></svg>',
  'spark-plug-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 8v12m0 8v4m0 8v16"/><rect x="26" y="20" width="12" height="8" rx="2"/><path d="M28 36l-4 8h16l-4-8"/></svg>',
  'suspension-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="44" r="8"/><circle cx="48" cy="44" r="8"/><path d="M24 44h16"/><path d="M16 36c4-8 4-16 8-20m24 20c-4-8-4-16-8-20"/></svg>',
  'timing-belt-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="24" r="8"/><circle cx="44" cy="40" r="8"/><path d="M20 32c0 8 16 0 24 8m0-16c0-8-16 0-24-8"/></svg>',
  'tire-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="3"/><path d="M32 12v6m0 28v6M12 32h6m28 0h6"/></svg>',
  'transmission-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="6"/><path d="M32 16v-8m0 48v-8M16 32H8m48 0h-8"/><circle cx="32" cy="16" r="3"/><circle cx="32" cy="48" r="3"/></svg>',
  'wheel-alignment': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="8"/><path d="M32 14v-6m0 48v-6M14 32H8m48 0h-6"/><path d="M22 22l-4-4m28 28l-4-4M42 22l4-4M18 46l4-4"/></svg>',
  'window-tinting': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="16" width="44" height="32" rx="4"/><path d="M10 32h44M32 16v32"/><path d="M18 20h8v8h-8z" fill="currentColor" opacity="0.3"/><path d="M38 36h8v8h-8z" fill="currentColor" opacity="0.3"/></svg>',
  'windshield-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 44l6-24a4 4 0 014-4h24a4 4 0 014 4l6 24"/><path d="M10 44h44"/><path d="M28 26l-6 10h12l-6 10"/></svg>',
  'alternator-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="6"/><path d="M26 24l6 8 6-8m-12 16l6-8 6 8"/></svg>',
  'ev-charger-installation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="16" y="12" width="24" height="40" rx="4"/><path d="M40 28h8a4 4 0 014 4v12a4 4 0 01-4 4H40"/><path d="M28 24l-4 10h8l-4 10"/></svg>',
  // Home
  'bathroom-remodel': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 36h48M12 36v12a4 4 0 004 4h32a4 4 0 004-4V36"/><path d="M16 36V16a8 8 0 018-8v0a8 8 0 018 8v2"/></svg>',
  'kitchen-remodel': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="12" width="40" height="40" rx="4"/><path d="M12 28h40m-20-16v16"/><circle cx="24" cy="40" r="4"/><circle cx="40" cy="40" r="4"/></svg>',
  'roof-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32l24-20 24 20"/><path d="M16 28v20a4 4 0 004 4h24a4 4 0 004-4V28"/><rect x="26" y="38" width="12" height="14"/></svg>',
  'hvac-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="14" width="36" height="36" rx="4"/><path d="M32 20v24M20 32h24"/><circle cx="32" cy="32" r="8"/></svg>',
  'flooring-installation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 48l8-32h32l8 32"/><path d="M16 48h32"/><path d="M20 24h8v8h-8zm16 0h8v8h-8zM28 36h8v8h-8z"/></svg>',
  'fence-installation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 28h48M8 40h48"/><path d="M16 16l4-6 4 6v36h-8zM32 16l4-6 4 6v36h-8zM48 16l4-6 4 6v36h-8z"/></svg>',
  'window-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="12" width="40" height="40" rx="2"/><path d="M32 12v40M12 32h40"/></svg>',
  'interior-painting': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M44 8H20a4 4 0 00-4 4v8a4 4 0 004 4h24a4 4 0 004-4v-8a4 4 0 00-4-4z"/><path d="M30 24v12a4 4 0 01-4 4h0a4 4 0 01-4-4V24"/><rect x="24" y="40" width="8" height="16" rx="2"/></svg>',
  'exterior-painting': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32l24-20 24 20"/><path d="M16 28v20a4 4 0 004 4h24a4 4 0 004-4V28"/><path d="M44 8H28a4 4 0 00-4 4v4h24v-4a4 4 0 00-4-4z"/></svg>',
  'water-heater-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="18" y="14" width="28" height="36" rx="4"/><circle cx="32" cy="32" r="6"/><path d="M32 8v6m-8 36v6m16-6v6"/><path d="M28 30c2-4 6-4 8 0"/></svg>',
  'electrical-panel-upgrade': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="10" width="36" height="44" rx="3"/><path d="M28 22l-4 10h8l-4 10"/><path d="M14 18h36m-36 28h36"/></svg>',
  'siding-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32l24-20 24 20"/><path d="M16 28v20h32V28"/><path d="M16 32h32M16 38h32M16 44h32"/></svg>',
  'insulation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32l24-20 24 20"/><path d="M16 28v20h32V28"/><path d="M20 32h24" stroke-dasharray="4 3"/><path d="M20 38h24" stroke-dasharray="4 3"/><path d="M20 44h24" stroke-dasharray="4 3"/></svg>',
  'garage-door-replacement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="16" width="44" height="36" rx="2"/><path d="M10 24h44M10 32h44M10 40h44"/><path d="M28 44h8v8h-8z"/></svg>',
  'gutter-installation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 24l24-12 24 12"/><path d="M8 24h48v4H8z"/><path d="M48 28v20a4 4 0 01-4 4v0"/><path d="M20 32l-4 8m8-6l-4 8m8-6l-4 8"/></svg>',
  'deck-building': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32h48M8 32l4 20m40-20l-4 20m-24-20v20m12-20v20"/><path d="M12 32V20m40 12V20"/><path d="M8 20h48"/></svg>',
  'concrete-driveway': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 8h24l8 48H12z"/><path d="M16 24h32M18 40h28"/></svg>',
  'tree-removal': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 56v-20"/><path d="M20 36l12-12 12 12"/><path d="M16 44l16-16 16 16"/><path d="M24 28l8-8 8 8"/></svg>',
  'landscaping': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 56v-24"/><path d="M24 28c-8-4-12-16 0-20s16 4 8 16"/><path d="M40 28c8-4 12-16 0-20s-16 4-8 16"/><path d="M8 56h48"/></svg>',
  'drywall-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="10" width="44" height="44" rx="2"/><path d="M24 24l16 16M40 24L24 40"/><rect x="20" y="20" width="24" height="24" rx="1" stroke-dasharray="4 3"/></svg>',
  'septic-system': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="28" width="40" height="20" rx="4"/><path d="M24 28v-12h16v12"/><path d="M20 48v8m24-8v8"/><path d="M24 38h16"/></svg>',
  'basement-waterproofing': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 28h48v24H8z"/><path d="M8 28l24-16 24 16"/><path d="M20 36l4 6-4 6m8-12l4 6-4 6m8-12l4 6-4 6"/></svg>',
  'basement-finishing': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 28h48v24H8z"/><path d="M8 28l24-16 24 16"/><rect x="24" y="36" width="16" height="16"/><path d="M32 36v16"/></svg>',
  'appliance-repair': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="10" width="36" height="44" rx="3"/><path d="M14 22h36"/><circle cx="32" cy="36" r="8"/><circle cx="32" cy="36" r="3"/><circle cx="22" cy="16" r="2"/><circle cx="32" cy="16" r="2"/></svg>',
};

// Default icon for unmapped articles
const defaultAutoIcon = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 48l4-12h24l4 12"/><path d="M12 48h40v4H12z"/><circle cx="22" cy="48" r="4"/><circle cx="42" cy="48" r="4"/><path d="M20 36l-2-8a16 16 0 0128 0l-2 8"/></svg>';
const defaultHomeIcon = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32l24-20 24 20"/><path d="M16 28v20a4 4 0 004 4h24a4 4 0 004-4V28"/><rect x="26" y="38" width="12" height="14"/></svg>';

// Gradient pairs for visual variety
const autoGradients = [
  'linear-gradient(135deg, #0F52BA 0%, #1E3A6E 100%)',
  'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  'linear-gradient(135deg, #1976D2 0%, #283593 100%)',
  'linear-gradient(135deg, #0D47A1 0%, #1A237E 100%)',
  'linear-gradient(135deg, #2196F3 0%, #0F52BA 100%)',
];

const homeGradients = [
  'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
  'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
  'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)',
  'linear-gradient(135deg, #00C853 0%, #00796B 100%)',
  'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
];

let updated = 0;

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip index page
  if (filePath.endsWith('index.html')) return;
  // Skip if already has hero
  if (html.includes('blog-hero-img')) return;
  // Must have article-header
  if (!html.includes('article-header')) return;

  // Determine category
  const isHome = html.includes('badge-home');
  const category = isHome ? 'home' : 'auto';

  // Get slug from filename
  const slug = path.basename(filePath, '.html').replace(/-cost$/, '');

  // Pick icon
  let icon = iconMap[slug];
  if (!icon) icon = category === 'auto' ? defaultAutoIcon : defaultHomeIcon;

  // Pick gradient (deterministic based on slug)
  const gradients = category === 'auto' ? autoGradients : homeGradients;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i)) % gradients.length;
  const gradient = gradients[hash];

  // Build the hero HTML
  const heroHtml = `            <div class="blog-hero-img" style="background: ${gradient};">
                <div class="blog-hero-icon">${icon}</div>
            </div>`;

  // Insert before <div class="article-header">
  // Handle both multiline and single-line formats
  if (html.includes('<div class="article-header">')) {
    html = html.replace(
      '<div class="article-header">',
      heroHtml + '\n            <div class="article-header">'
    );
  } else {
    // Single-line format: <div class="article-header"><div class=...
    html = html.replace(
      /(<div class="article-header">)/,
      heroHtml + '\n        $1'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  updated++;
}

// Process all blog files
const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir);
for (const file of files) {
  if (file.endsWith('.html')) {
    processFile(path.join(blogDir, file));
  }
}

console.log(`Blog hero images added to ${updated} articles`);
