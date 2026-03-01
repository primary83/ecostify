/**
 * Add "Compare with Nearby Cities" pricing table to cost guide service pages.
 * Reads mid-range pricing from nearby city files and builds a comparison table.
 */

const fs = require('fs');
const path = require('path');

// Regional proximity groups — each city maps to 3-4 nearby cities
const nearbyMap = {
  'akron': ['columbus', 'cleveland' /* no cleveland */, 'pittsburgh', 'dayton'],
  'albuquerque': ['el-paso', 'tucson', 'phoenix', 'colorado-springs'],
  'anchorage': ['seattle', 'portland', 'boise'],
  'arlington': ['dallas', 'fort-worth', 'san-antonio'],
  'asheville': ['charlotte', 'knoxville', 'greenville'],
  'atlanta': ['marietta', 'augusta', 'birmingham', 'charlotte'],
  'augusta': ['atlanta', 'savannah', 'columbia', 'charleston'],
  'austin': ['san-antonio', 'houston', 'dallas'],
  'bakersfield': ['fresno', 'los-angeles', 'stockton'],
  'baltimore': ['philadelphia', 'richmond', 'harrisburg'],
  'baton-rouge': ['new-orleans', 'jackson', 'houston'],
  'birmingham': ['huntsville', 'atlanta', 'memphis', 'nashville'],
  'boise': ['salt-lake-city', 'spokane', 'portland'],
  'buffalo': ['rochester', 'syracuse', 'pittsburgh'],
  'cape-coral': ['sarasota', 'tampa', 'miami', 'lakeland'],
  'charleston': ['savannah', 'columbia', 'charlotte'],
  'charlotte': ['greensboro', 'raleigh', 'asheville', 'greenville'],
  'chattanooga': ['nashville', 'knoxville', 'atlanta', 'birmingham'],
  'chicago': ['milwaukee', 'indianapolis', 'grand-rapids'],
  'cincinnati': ['dayton', 'columbus', 'louisville', 'indianapolis'],
  'colorado-springs': ['denver', 'albuquerque', 'wichita'],
  'columbia': ['charleston', 'charlotte', 'augusta'],
  'columbus': ['cincinnati', 'dayton', 'indianapolis', 'pittsburgh'],
  'dallas': ['fort-worth', 'arlington', 'austin', 'houston'],
  'dayton': ['cincinnati', 'columbus', 'indianapolis'],
  'daytona-beach': ['orlando', 'jacksonville', 'tampa'],
  'denver': ['colorado-springs', 'salt-lake-city', 'omaha'],
  'des-moines': ['omaha', 'kansas-city', 'minneapolis'],
  'detroit': ['grand-rapids', 'chicago', 'columbus'],
  'el-paso': ['tucson', 'albuquerque', 'san-antonio'],
  'fayetteville-ar': ['tulsa', 'little-rock', 'springfield-mo'],
  'fort-worth': ['dallas', 'arlington', 'austin'],
  'fresno': ['bakersfield', 'stockton', 'sacramento'],
  'grand-rapids': ['detroit', 'chicago', 'milwaukee'],
  'greensboro': ['raleigh', 'charlotte', 'richmond'],
  'greenville': ['charlotte', 'asheville', 'columbia'],
  'harrisburg': ['philadelphia', 'baltimore', 'pittsburgh'],
  'hartford': ['providence', 'worcester', 'new-york'],
  'honolulu': ['los-angeles', 'san-francisco', 'portland'],
  'houston': ['san-antonio', 'austin', 'dallas', 'baton-rouge'],
  'huntsville': ['birmingham', 'nashville', 'chattanooga'],
  'indianapolis': ['cincinnati', 'columbus', 'chicago', 'louisville'],
  'jackson': ['memphis', 'baton-rouge', 'birmingham'],
  'jacksonville': ['savannah', 'orlando', 'daytona-beach', 'tampa'],
  'kansas-city': ['st-louis', 'omaha', 'des-moines', 'wichita'],
  'knoxville': ['chattanooga', 'nashville', 'asheville'],
  'lakeland': ['tampa', 'orlando', 'sarasota'],
  'las-vegas': ['phoenix', 'los-angeles', 'salt-lake-city'],
  'lexington': ['louisville', 'cincinnati', 'knoxville'],
  'little-rock': ['memphis', 'fayetteville-ar', 'tulsa'],
  'los-angeles': ['san-diego', 'bakersfield', 'las-vegas'],
  'louisville': ['lexington', 'cincinnati', 'indianapolis', 'nashville'],
  'madison': ['milwaukee', 'chicago', 'minneapolis'],
  'marietta': ['atlanta', 'augusta', 'chattanooga'],
  'memphis': ['nashville', 'little-rock', 'jackson', 'birmingham'],
  'mesa': ['phoenix', 'tucson', 'las-vegas'],
  'miami': ['cape-coral', 'palm-bay', 'orlando', 'tampa'],
  'milwaukee': ['chicago', 'madison', 'grand-rapids'],
  'minneapolis': ['madison', 'des-moines', 'milwaukee'],
  'nashville': ['memphis', 'knoxville', 'chattanooga', 'louisville'],
  'new-orleans': ['baton-rouge', 'houston', 'jackson'],
  'new-york': ['hartford', 'philadelphia', 'providence'],
  'ogden': ['salt-lake-city', 'provo', 'boise'],
  'oklahoma-city': ['tulsa', 'dallas', 'wichita'],
  'omaha': ['des-moines', 'kansas-city', 'denver'],
  'orlando': ['tampa', 'jacksonville', 'miami', 'daytona-beach'],
  'palm-bay': ['orlando', 'daytona-beach', 'miami'],
  'pensacola': ['tallahassee', 'jacksonville', 'new-orleans'],
  'philadelphia': ['new-york', 'baltimore', 'harrisburg'],
  'phoenix': ['mesa', 'tucson', 'las-vegas'],
  'pittsburgh': ['columbus', 'buffalo', 'harrisburg'],
  'portland': ['seattle', 'boise', 'sacramento'],
  'providence': ['hartford', 'worcester', 'new-york'],
  'provo': ['salt-lake-city', 'ogden', 'las-vegas'],
  'raleigh': ['charlotte', 'greensboro', 'richmond'],
  'reno': ['sacramento', 'las-vegas', 'san-francisco'],
  'richmond': ['virginia-beach', 'baltimore', 'raleigh'],
  'rochester': ['buffalo', 'syracuse', 'harrisburg'],
  'sacramento': ['stockton', 'san-francisco', 'fresno', 'reno'],
  'salt-lake-city': ['provo', 'ogden', 'denver', 'boise'],
  'san-antonio': ['austin', 'houston', 'dallas'],
  'san-diego': ['los-angeles', 'phoenix', 'las-vegas'],
  'san-francisco': ['san-jose', 'sacramento', 'stockton'],
  'san-jose': ['san-francisco', 'sacramento', 'fresno'],
  'sarasota': ['tampa', 'cape-coral', 'lakeland'],
  'savannah': ['charleston', 'jacksonville', 'augusta'],
  'seattle': ['portland', 'spokane', 'boise'],
  'spokane': ['seattle', 'portland', 'boise'],
  'springfield-mo': ['kansas-city', 'tulsa', 'fayetteville-ar', 'st-louis'],
  'st-louis': ['kansas-city', 'springfield-mo', 'indianapolis'],
  'stockton': ['sacramento', 'fresno', 'san-jose', 'bakersfield'],
  'syracuse': ['rochester', 'buffalo', 'hartford'],
  'tallahassee': ['jacksonville', 'pensacola', 'savannah'],
  'tampa': ['orlando', 'sarasota', 'lakeland', 'jacksonville'],
  'tucson': ['phoenix', 'mesa', 'el-paso'],
  'tulsa': ['oklahoma-city', 'fayetteville-ar', 'springfield-mo'],
  'virginia-beach': ['richmond', 'raleigh', 'wilmington-nc'],
  'wichita': ['kansas-city', 'oklahoma-city', 'tulsa'],
  'wilmington-nc': ['raleigh', 'virginia-beach', 'charleston'],
  'worcester': ['hartford', 'providence', 'new-york'],
};

// Title-case city names for display
function cityDisplayName(slug) {
  return slug.split('-').map(function(w) {
    if (w === 'ar' || w === 'nc' || w === 'mo') return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

// Extract mid-range pricing from a cost page
function getMidRange(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const match = html.match(/Mid-range estimate<\/span><span>\$([0-9,]+)\s*&ndash;\s*\$([0-9,]+)/i);
    if (match) {
      return '$' + match[1] + ' – $' + match[2];
    }
  } catch (e) {}
  return null;
}

// Get service display name from h1
function getServiceName(html) {
  const m = html.match(/<h1[^>]*>([^<]+)/);
  if (m) return m[1].replace(/ Cost in .+$/, '').replace(/ in .+$/, '').trim();
  return 'This Service';
}

let updated = 0;
const costDir = path.join(__dirname, 'cost');

// Process each city directory
const cities = fs.readdirSync(costDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const city of cities) {
  const nearby = nearbyMap[city];
  if (!nearby) continue;

  const cityDir = path.join(costDir, city);
  const serviceFiles = fs.readdirSync(cityDir).filter(f => f.endsWith('.html') && f !== 'index.html');

  for (const serviceFile of serviceFiles) {
    const filePath = path.join(cityDir, serviceFile);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has compare table
    if (html.includes('compare-cities-table')) continue;

    // Get this city's mid-range
    const myMidRange = getMidRange(filePath);
    if (!myMidRange) continue;

    // Collect nearby city prices for this service
    const comparisons = [];
    for (const nearbyCity of nearby) {
      const nearbyFile = path.join(costDir, nearbyCity, serviceFile);
      const price = getMidRange(nearbyFile);
      if (price) {
        comparisons.push({
          city: nearbyCity,
          name: cityDisplayName(nearbyCity),
          price: price,
          url: '/cost/' + nearbyCity + '/' + serviceFile.replace('.html', '')
        });
      }
      if (comparisons.length >= 3) break;
    }

    // Need at least 2 cities to compare
    if (comparisons.length < 2) continue;

    const serviceName = getServiceName(html);
    const cityName = cityDisplayName(city);

    // Build comparison table HTML
    let tableHtml = '\n                <div class="compare-cities-table">\n';
    tableHtml += '                    <h2>Compare ' + serviceName + ' Prices Nearby</h2>\n';
    tableHtml += '                    <p>See how ' + cityName + ' pricing compares to nearby cities for the same service.</p>\n';
    tableHtml += '                    <table>\n';
    tableHtml += '                        <thead><tr><th>City</th><th>Mid-Range Cost</th></tr></thead>\n';
    tableHtml += '                        <tbody>\n';
    tableHtml += '                            <tr class="current-city"><td>' + cityName + ' <span class="you-badge">You</span></td><td>' + myMidRange + '</td></tr>\n';
    for (const comp of comparisons) {
      tableHtml += '                            <tr><td><a href="' + comp.url + '">' + comp.name + '</a></td><td>' + comp.price + '</td></tr>\n';
    }
    tableHtml += '                        </tbody>\n';
    tableHtml += '                    </table>\n';
    tableHtml += '                </div>\n';

    // Insert before the cross-links section or article-cta
    if (html.includes('<div class="cross-links">')) {
      html = html.replace('<div class="cross-links">', tableHtml + '\n                <div class="cross-links">');
    } else if (html.includes('<div class="article-cta">')) {
      html = html.replace('<div class="article-cta">', tableHtml + '\n                <div class="article-cta">');
    } else {
      continue;
    }

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
  }
}

console.log(`Compare cities table added to ${updated} cost guide pages`);
