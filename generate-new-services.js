#!/usr/bin/env node
/* ============================================================
   Ecostify — New Services Generator
   Generates 1,600 static HTML pages: 16 new services × 100 cities
   Updates city hub pages, main hub, and sitemap
   Uses BLS OEWS wage data + BEA RPP cost-of-living multipliers
   ============================================================ */

const fs = require('fs');
const path = require('path');

// ── Load data from API libs ──────────────────────────────────
const cityMapping = require('./api/lib/city-mapping');
const cityParities = require('./api/lib/city-price-parities');
const cityLabor = require('./api/lib/city-labor-rates');

// ── 100 Original Cities (Batches 1-9) ────────────────────────
const CITIES = [
    { slug: 'houston', name: 'Houston', state: 'TX' },
    { slug: 'los-angeles', name: 'Los Angeles', state: 'CA' },
    { slug: 'chicago', name: 'Chicago', state: 'IL' },
    { slug: 'phoenix', name: 'Phoenix', state: 'AZ' },
    { slug: 'philadelphia', name: 'Philadelphia', state: 'PA' },
    { slug: 'san-antonio', name: 'San Antonio', state: 'TX' },
    { slug: 'dallas', name: 'Dallas', state: 'TX' },
    { slug: 'san-diego', name: 'San Diego', state: 'CA' },
    { slug: 'denver', name: 'Denver', state: 'CO' },
    { slug: 'miami', name: 'Miami', state: 'FL' },
    { slug: 'new-york', name: 'New York', state: 'NY' },
    { slug: 'atlanta', name: 'Atlanta', state: 'GA' },
    { slug: 'seattle', name: 'Seattle', state: 'WA' },
    { slug: 'tampa', name: 'Tampa', state: 'FL' },
    { slug: 'minneapolis', name: 'Minneapolis', state: 'MN' },
    { slug: 'charlotte', name: 'Charlotte', state: 'NC' },
    { slug: 'las-vegas', name: 'Las Vegas', state: 'NV' },
    { slug: 'austin', name: 'Austin', state: 'TX' },
    { slug: 'nashville', name: 'Nashville', state: 'TN' },
    { slug: 'portland', name: 'Portland', state: 'OR' },
    { slug: 'san-jose', name: 'San Jose', state: 'CA' },
    { slug: 'jacksonville', name: 'Jacksonville', state: 'FL' },
    { slug: 'indianapolis', name: 'Indianapolis', state: 'IN' },
    { slug: 'columbus', name: 'Columbus', state: 'OH' },
    { slug: 'san-francisco', name: 'San Francisco', state: 'CA' },
    { slug: 'detroit', name: 'Detroit', state: 'MI' },
    { slug: 'baltimore', name: 'Baltimore', state: 'MD' },
    { slug: 'memphis', name: 'Memphis', state: 'TN' },
    { slug: 'louisville', name: 'Louisville', state: 'KY' },
    { slug: 'milwaukee', name: 'Milwaukee', state: 'WI' },
    { slug: 'oklahoma-city', name: 'Oklahoma City', state: 'OK' },
    { slug: 'tucson', name: 'Tucson', state: 'AZ' },
    { slug: 'raleigh', name: 'Raleigh', state: 'NC' },
    { slug: 'kansas-city', name: 'Kansas City', state: 'MO' },
    { slug: 'sacramento', name: 'Sacramento', state: 'CA' },
    { slug: 'mesa', name: 'Mesa', state: 'AZ' },
    { slug: 'omaha', name: 'Omaha', state: 'NE' },
    { slug: 'colorado-springs', name: 'Colorado Springs', state: 'CO' },
    { slug: 'virginia-beach', name: 'Virginia Beach', state: 'VA' },
    { slug: 'marietta', name: 'Marietta', state: 'GA' },
    { slug: 'orlando', name: 'Orlando', state: 'FL' },
    { slug: 'fort-worth', name: 'Fort Worth', state: 'TX' },
    { slug: 'arlington', name: 'Arlington', state: 'TX' },
    { slug: 'new-orleans', name: 'New Orleans', state: 'LA' },
    { slug: 'bakersfield', name: 'Bakersfield', state: 'CA' },
    { slug: 'honolulu', name: 'Honolulu', state: 'HI' },
    { slug: 'albuquerque', name: 'Albuquerque', state: 'NM' },
    { slug: 'pittsburgh', name: 'Pittsburgh', state: 'PA' },
    { slug: 'cincinnati', name: 'Cincinnati', state: 'OH' },
    { slug: 'st-louis', name: 'St. Louis', state: 'MO' },
    { slug: 'richmond', name: 'Richmond', state: 'VA' },
    { slug: 'salt-lake-city', name: 'Salt Lake City', state: 'UT' },
    { slug: 'birmingham', name: 'Birmingham', state: 'AL' },
    { slug: 'wichita', name: 'Wichita', state: 'KS' },
    { slug: 'madison', name: 'Madison', state: 'WI' },
    { slug: 'baton-rouge', name: 'Baton Rouge', state: 'LA' },
    { slug: 'grand-rapids', name: 'Grand Rapids', state: 'MI' },
    { slug: 'columbia', name: 'Columbia', state: 'SC' },
    { slug: 'hartford', name: 'Hartford', state: 'CT' },
    { slug: 'buffalo', name: 'Buffalo', state: 'NY' },
    { slug: 'huntsville', name: 'Huntsville', state: 'AL' },
    { slug: 'akron', name: 'Akron', state: 'OH' },
    { slug: 'rochester', name: 'Rochester', state: 'NY' },
    { slug: 'providence', name: 'Providence', state: 'RI' },
    { slug: 'worcester', name: 'Worcester', state: 'MA' },
    { slug: 'knoxville', name: 'Knoxville', state: 'TN' },
    { slug: 'boise', name: 'Boise', state: 'ID' },
    { slug: 'greensboro', name: 'Greensboro', state: 'NC' },
    { slug: 'tulsa', name: 'Tulsa', state: 'OK' },
    { slug: 'dayton', name: 'Dayton', state: 'OH' },
    { slug: 'el-paso', name: 'El Paso', state: 'TX' },
    { slug: 'ogden', name: 'Ogden', state: 'UT' },
    { slug: 'fresno', name: 'Fresno', state: 'CA' },
    { slug: 'stockton', name: 'Stockton', state: 'CA' },
    { slug: 'provo', name: 'Provo', state: 'UT' },
    { slug: 'anchorage', name: 'Anchorage', state: 'AK' },
    { slug: 'des-moines', name: 'Des Moines', state: 'IA' },
    { slug: 'little-rock', name: 'Little Rock', state: 'AR' },
    { slug: 'spokane', name: 'Spokane', state: 'WA' },
    { slug: 'lexington', name: 'Lexington', state: 'KY' },
    { slug: 'sarasota', name: 'Sarasota', state: 'FL' },
    { slug: 'cape-coral', name: 'Cape Coral', state: 'FL' },
    { slug: 'lakeland', name: 'Lakeland', state: 'FL' },
    { slug: 'daytona-beach', name: 'Daytona Beach', state: 'FL' },
    { slug: 'palm-bay', name: 'Palm Bay', state: 'FL' },
    { slug: 'chattanooga', name: 'Chattanooga', state: 'TN' },
    { slug: 'savannah', name: 'Savannah', state: 'GA' },
    { slug: 'charleston', name: 'Charleston', state: 'SC' },
    { slug: 'greenville', name: 'Greenville', state: 'SC' },
    { slug: 'asheville', name: 'Asheville', state: 'NC' },
    { slug: 'reno', name: 'Reno', state: 'NV' },
    { slug: 'tallahassee', name: 'Tallahassee', state: 'FL' },
    { slug: 'pensacola', name: 'Pensacola', state: 'FL' },
    { slug: 'fayetteville-ar', name: 'Fayetteville', state: 'AR' },
    { slug: 'augusta', name: 'Augusta', state: 'GA' },
    { slug: 'harrisburg', name: 'Harrisburg', state: 'PA' },
    { slug: 'syracuse', name: 'Syracuse', state: 'NY' },
    { slug: 'wilmington-nc', name: 'Wilmington', state: 'NC' },
    { slug: 'jackson', name: 'Jackson', state: 'MS' },
    { slug: 'springfield-mo', name: 'Springfield', state: 'MO' },
];

// Enrich city data with metro names from mapping
CITIES.forEach(c => {
    const m = cityMapping[c.slug];
    if (m) c.metro = m.bls_metro_name.replace(/,\s*[A-Z]{2}(-[A-Z]{2})*$/, '');
    else c.metro = c.name;
});

// Helper to get RPP and wage for a city
function getRPP(slug) {
    const d = cityParities[slug];
    return d ? d.all : 100;
}
function getWage(slug, occupation) {
    const d = cityLabor[slug];
    if (d && d[occupation]) return d[occupation];
    return cityLabor._national[occupation];
}

// ── 16 EXISTING services (for cross-links) ───────────────────
const EXISTING_SERVICES = [
    { slug: 'brake-pad-replacement', name: 'Brake Pad Replacement', category: 'auto', icon: '\u{1F527}' },
    { slug: 'oil-change', name: 'Oil Change', category: 'auto', icon: '\u{1F6E2}\uFE0F' },
    { slug: 'car-wrap', name: 'Full Car Wrap', category: 'auto', icon: '\u{1F3A8}' },
    { slug: 'ceramic-coating', name: 'Ceramic Coating', category: 'auto', icon: '\u2728' },
    { slug: 'transmission-repair', name: 'Transmission Repair', category: 'auto', icon: '\u2699\uFE0F' },
    { slug: 'window-tinting', name: 'Window Tinting', category: 'auto', icon: '\u{1FA9F}' },
    { slug: 'ev-charger-installation', name: 'EV Charger Installation', category: 'auto', icon: '\u26A1' },
    { slug: 'ac-repair', name: 'AC Repair & Recharge', category: 'auto', icon: '\u2744\uFE0F' },
    { slug: 'kitchen-remodel', name: 'Kitchen Remodel', category: 'home', icon: '\u{1F373}' },
    { slug: 'bathroom-remodel', name: 'Bathroom Remodel', category: 'home', icon: '\u{1F6BF}' },
    { slug: 'roof-replacement', name: 'Roof Replacement', category: 'home', icon: '\u{1F3E0}' },
    { slug: 'hvac-replacement', name: 'HVAC Replacement', category: 'home', icon: '\u{1F321}\uFE0F' },
    { slug: 'interior-painting', name: 'Interior Painting', category: 'home', icon: '\u{1F58C}\uFE0F' },
    { slug: 'fence-installation', name: 'Fence Installation', category: 'home', icon: '\u{1F3D7}\uFE0F' },
    { slug: 'flooring-installation', name: 'Flooring Installation', category: 'home', icon: '\u{1FAB5}' },
    { slug: 'garage-door-replacement', name: 'Garage Door Replacement', category: 'home', icon: '\u{1F6AA}' },
];

// ── 16 NEW services ──────────────────────────────────────────
const NEW_SERVICES = [
    // Auto — 8 new
    { slug: 'alternator-replacement', name: 'Alternator Replacement', category: 'auto', occupation: 'autoMech', laborHoursLow: 4, laborHoursHigh: 7, partsNationalLow: 193, partsNationalHigh: 495, shortDesc: 'alternator replacement and electrical system repair', icon: '\u{1F50C}' },
    { slug: 'suspension-repair', name: 'Suspension & Strut Repair', category: 'auto', occupation: 'autoMech', laborHoursLow: 5.5, laborHoursHigh: 11, partsNationalLow: 225, partsNationalHigh: 600, shortDesc: 'suspension and strut replacement', icon: '\u{1F6DE}' },
    { slug: 'ac-recharge', name: 'Auto AC Repair & Recharge', category: 'auto', occupation: 'autoMech', laborHoursLow: 2, laborHoursHigh: 8, partsNationalLow: 68, partsNationalHigh: 360, shortDesc: 'automotive AC diagnosis, repair, and refrigerant recharge', icon: '\u2744\uFE0F' },
    { slug: 'timing-belt-replacement', name: 'Timing Belt Replacement', category: 'auto', occupation: 'autoMech', laborHoursLow: 7.5, laborHoursHigh: 16, partsNationalLow: 200, partsNationalHigh: 600, shortDesc: 'timing belt and tensioner replacement', icon: '\u23F1\uFE0F' },
    { slug: 'exhaust-repair', name: 'Exhaust & Muffler Repair', category: 'auto', occupation: 'autoMech', laborHoursLow: 2, laborHoursHigh: 6.5, partsNationalLow: 120, partsNationalHigh: 540, shortDesc: 'exhaust system and muffler repair or replacement', icon: '\u{1F4A8}' },
    { slug: 'wheel-alignment', name: 'Wheel Alignment', category: 'auto', occupation: 'autoMech', laborHoursLow: 1.5, laborHoursHigh: 3.5, partsNationalLow: 15, partsNationalHigh: 50, shortDesc: 'two-wheel or four-wheel alignment', icon: '\u{1F3AF}' },
    { slug: 'auto-detailing', name: 'Auto Detailing', category: 'auto', occupation: 'autoMech', laborHoursLow: 3, laborHoursHigh: 7.5, partsNationalLow: 23, partsNationalHigh: 75, shortDesc: 'professional auto detailing and paint correction', icon: '\u2728' },
    { slug: 'windshield-replacement', name: 'Windshield Replacement', category: 'auto', occupation: 'autoMech', laborHoursLow: 1.75, laborHoursHigh: 4.5, partsNationalLow: 130, partsNationalHigh: 455, shortDesc: 'windshield replacement and ADAS recalibration', icon: '\u{1FA9F}' },
    // Home — 8 new
    { slug: 'water-heater-replacement', name: 'Water Heater Replacement', category: 'home', occupation: 'plumber', laborHoursLow: 6, laborHoursHigh: 16, partsNationalLow: 520, partsNationalHigh: 1950, shortDesc: 'water heater replacement and installation', icon: '\u{1F525}' },
    { slug: 'garage-door-replacement', name: 'Garage Door Replacement', category: 'home', occupation: 'carpenter', laborHoursLow: 5.5, laborHoursHigh: 20, partsNationalLow: 560, partsNationalHigh: 2800, shortDesc: 'garage door replacement and opener installation', icon: '\u{1F6AA}' },
    { slug: 'drywall-repair', name: 'Drywall Repair', category: 'home', occupation: 'painter', laborHoursLow: 3.5, laborHoursHigh: 15, partsNationalLow: 70, partsNationalHigh: 420, shortDesc: 'drywall patching, repair, and finishing', icon: '\u{1F9F1}' },
    { slug: 'tree-removal', name: 'Tree Removal', category: 'home', occupation: 'maintenance', laborHoursLow: 8, laborHoursHigh: 36, partsNationalLow: 120, partsNationalHigh: 750, shortDesc: 'tree removal and stump grinding', icon: '\u{1F333}' },
    { slug: 'pest-control', name: 'Pest Control', category: 'home', occupation: 'maintenance', laborHoursLow: 1.75, laborHoursHigh: 6, partsNationalLow: 40, partsNationalHigh: 200, shortDesc: 'residential pest control treatment', icon: '\u{1F41C}' },
    { slug: 'concrete-driveway-repair', name: 'Concrete & Driveway Repair', category: 'home', occupation: 'maintenance', laborHoursLow: 8, laborHoursHigh: 34, partsNationalLow: 225, partsNationalHigh: 1350, shortDesc: 'concrete and driveway repair or replacement', icon: '\u{1F3D7}\uFE0F' },
    { slug: 'gutter-installation', name: 'Gutter Installation', category: 'home', occupation: 'carpenter', laborHoursLow: 7, laborHoursHigh: 25, partsNationalLow: 300, partsNationalHigh: 1500, shortDesc: 'gutter and downspout installation', icon: '\u{1F327}\uFE0F' },
    { slug: 'window-replacement', name: 'Window Replacement', category: 'home', occupation: 'carpenter', laborHoursLow: 3, laborHoursHigh: 10, partsNationalLow: 180, partsNationalHigh: 900, shortDesc: 'residential window replacement', icon: '\u{1FA9F}' },
];

// Combined service list (for cross-links)
const ALL_SERVICES = [...EXISTING_SERVICES, ...NEW_SERVICES];
// Deduplicate by slug (garage-door-replacement appears in both)
const ALL_SERVICES_UNIQUE = [];
const seenSlugs = new Set();
ALL_SERVICES.forEach(s => { if (!seenSlugs.has(s.slug)) { seenSlugs.add(s.slug); ALL_SERVICES_UNIQUE.push(s); } });

// ── Nearby cities map ────────────────────────────────────────
const NEARBY_MAP = {
    houston: ['san-antonio', 'austin', 'dallas'], 'los-angeles': ['san-diego', 'phoenix', 'san-francisco'],
    chicago: ['milwaukee', 'indianapolis', 'detroit'], phoenix: ['tucson', 'mesa', 'las-vegas'],
    philadelphia: ['new-york', 'baltimore', 'pittsburgh'], 'san-antonio': ['houston', 'austin', 'dallas'],
    dallas: ['fort-worth', 'houston', 'austin'], 'san-diego': ['los-angeles', 'phoenix', 'las-vegas'],
    denver: ['colorado-springs', 'salt-lake-city', 'kansas-city'], miami: ['tampa', 'orlando', 'jacksonville'],
    'new-york': ['philadelphia', 'hartford', 'providence'], atlanta: ['charlotte', 'nashville', 'jacksonville'],
    seattle: ['portland', 'spokane', 'sacramento'], tampa: ['orlando', 'miami', 'jacksonville'],
    minneapolis: ['milwaukee', 'des-moines', 'madison'], charlotte: ['raleigh', 'greensboro', 'atlanta'],
    'las-vegas': ['phoenix', 'los-angeles', 'reno'], austin: ['san-antonio', 'houston', 'dallas'],
    nashville: ['memphis', 'louisville', 'chattanooga'], portland: ['seattle', 'sacramento', 'spokane'],
    'san-jose': ['san-francisco', 'sacramento', 'stockton'], jacksonville: ['orlando', 'tampa', 'savannah'],
    indianapolis: ['columbus', 'louisville', 'chicago'], columbus: ['indianapolis', 'cincinnati', 'pittsburgh'],
    'san-francisco': ['san-jose', 'sacramento', 'los-angeles'], detroit: ['chicago', 'columbus', 'milwaukee'],
    baltimore: ['philadelphia', 'richmond', 'harrisburg'], memphis: ['nashville', 'birmingham', 'st-louis'],
    louisville: ['indianapolis', 'nashville', 'cincinnati'], milwaukee: ['chicago', 'minneapolis', 'madison'],
    'oklahoma-city': ['dallas', 'tulsa', 'kansas-city'], tucson: ['phoenix', 'el-paso', 'albuquerque'],
    raleigh: ['charlotte', 'richmond', 'greensboro'], 'kansas-city': ['st-louis', 'omaha', 'oklahoma-city'],
    sacramento: ['san-francisco', 'san-jose', 'fresno'], mesa: ['phoenix', 'tucson', 'las-vegas'],
    omaha: ['kansas-city', 'des-moines', 'minneapolis'], 'colorado-springs': ['denver', 'albuquerque', 'kansas-city'],
    'virginia-beach': ['richmond', 'raleigh', 'baltimore'], marietta: ['atlanta', 'charlotte', 'nashville'],
    orlando: ['tampa', 'miami', 'jacksonville'], 'fort-worth': ['dallas', 'austin', 'san-antonio'],
    arlington: ['dallas', 'fort-worth', 'austin'], 'new-orleans': ['baton-rouge', 'memphis', 'houston'],
    bakersfield: ['fresno', 'los-angeles', 'sacramento'], honolulu: ['los-angeles', 'san-francisco', 'san-diego'],
    albuquerque: ['el-paso', 'tucson', 'phoenix'], pittsburgh: ['columbus', 'philadelphia', 'buffalo'],
    cincinnati: ['indianapolis', 'columbus', 'louisville'], 'st-louis': ['kansas-city', 'memphis', 'nashville'],
    richmond: ['virginia-beach', 'baltimore', 'raleigh'], 'salt-lake-city': ['provo', 'ogden', 'denver'],
    birmingham: ['nashville', 'memphis', 'atlanta'], wichita: ['oklahoma-city', 'kansas-city', 'tulsa'],
    madison: ['milwaukee', 'chicago', 'minneapolis'], 'baton-rouge': ['new-orleans', 'houston', 'jackson'],
    'grand-rapids': ['detroit', 'chicago', 'milwaukee'], columbia: ['charlotte', 'charleston', 'greenville'],
    hartford: ['new-york', 'providence', 'worcester'], buffalo: ['rochester', 'syracuse', 'pittsburgh'],
    huntsville: ['nashville', 'birmingham', 'chattanooga'], akron: ['columbus', 'pittsburgh', 'dayton'],
    rochester: ['buffalo', 'syracuse', 'hartford'], providence: ['hartford', 'worcester', 'new-york'],
    worcester: ['hartford', 'providence', 'new-york'], knoxville: ['nashville', 'chattanooga', 'asheville'],
    boise: ['salt-lake-city', 'spokane', 'portland'], greensboro: ['charlotte', 'raleigh', 'richmond'],
    tulsa: ['oklahoma-city', 'dallas', 'kansas-city'], dayton: ['columbus', 'cincinnati', 'indianapolis'],
    'el-paso': ['tucson', 'albuquerque', 'san-antonio'], ogden: ['salt-lake-city', 'provo', 'denver'],
    fresno: ['bakersfield', 'sacramento', 'stockton'], stockton: ['sacramento', 'fresno', 'san-jose'],
    provo: ['salt-lake-city', 'ogden', 'denver'], anchorage: ['seattle', 'portland', 'spokane'],
    'des-moines': ['omaha', 'kansas-city', 'minneapolis'], 'little-rock': ['memphis', 'oklahoma-city', 'st-louis'],
    spokane: ['seattle', 'boise', 'portland'], lexington: ['louisville', 'cincinnati', 'nashville'],
    sarasota: ['tampa', 'cape-coral', 'orlando'], 'cape-coral': ['sarasota', 'miami', 'tampa'],
    lakeland: ['tampa', 'orlando', 'sarasota'], 'daytona-beach': ['orlando', 'jacksonville', 'tampa'],
    'palm-bay': ['orlando', 'miami', 'daytona-beach'], chattanooga: ['nashville', 'knoxville', 'atlanta'],
    savannah: ['jacksonville', 'charleston', 'augusta'], charleston: ['savannah', 'columbia', 'charlotte'],
    greenville: ['charlotte', 'columbia', 'asheville'], asheville: ['charlotte', 'knoxville', 'greenville'],
    reno: ['sacramento', 'san-francisco', 'las-vegas'], tallahassee: ['jacksonville', 'pensacola', 'orlando'],
    pensacola: ['tallahassee', 'new-orleans', 'jacksonville'], 'fayetteville-ar': ['tulsa', 'oklahoma-city', 'little-rock'],
    augusta: ['savannah', 'columbia', 'charleston'], harrisburg: ['philadelphia', 'pittsburgh', 'baltimore'],
    syracuse: ['buffalo', 'rochester', 'hartford'], 'wilmington-nc': ['raleigh', 'charleston', 'jacksonville'],
    jackson: ['memphis', 'birmingham', 'baton-rouge'], 'springfield-mo': ['kansas-city', 'st-louis', 'tulsa'],
};

// ── Service-specific "Why Costs Vary" content ────────────────
const WHY_COSTS_VARY = {
    'alternator-replacement': (city, metro) => [
        `<p><strong>Vehicle make and model.</strong> Alternator costs vary widely between economy and luxury vehicles. Replacing the alternator on a BMW or Audi in ${city} can cost two to three times more than the same job on a Honda Civic or Toyota Corolla due to higher part prices and more complex installation.</p>`,
        `<p><strong>OEM vs aftermarket parts.</strong> OEM alternators cost 40 to 80 percent more than aftermarket alternatives but ensure exact electrical specifications for your vehicle. High-quality aftermarket brands like Denso and Bosch often deliver comparable reliability at a lower price point.</p>`,
        `<p><strong>Belt and pulley system.</strong> Some vehicles require additional serpentine belt or pulley work during alternator replacement. If your belt is worn or the tensioner is failing, bundling this work saves on labor compared to a separate visit.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'suspension-repair': (city, metro) => [
        `<p><strong>Strut type and quality.</strong> Basic replacement struts cost significantly less than performance or adjustable units. In ${city}, most drivers do well with mid-range struts from brands like Monroe or KYB, which balance ride quality and cost.</p>`,
        `<p><strong>Vehicle weight class.</strong> Trucks and SUVs require heavier-duty suspension components that cost more than parts for sedans and compacts. The labor is also more involved due to the added weight and complexity of larger vehicles.</p>`,
        `<p><strong>Scope of repair.</strong> Replacing a single strut costs far less than doing all four corners. Most shops in ${city} recommend replacing struts in pairs (both fronts or both rears) for balanced handling. A four-wheel alignment is often needed afterward and may or may not be included in the quote.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'ac-recharge': (city, metro) => [
        `<p><strong>Refrigerant type.</strong> Older vehicles use R-134a refrigerant, which is relatively affordable. Newer vehicles (2017 and later) use R-1234yf, which costs three to five times more per pound. This single factor can double the total cost of a recharge in ${city}.</p>`,
        `<p><strong>Leak detection and repair.</strong> A simple recharge with no leaks is the cheapest scenario. If the technician finds a leak in the condenser, evaporator, or hose connections, repair costs can rise by $200 to $600 depending on the component.</p>`,
        `<p><strong>Compressor condition.</strong> If the AC compressor is failing or seized, replacement adds $500 to $1,000 or more on top of the recharge cost. In ${city}, shops typically test the compressor before quoting a recharge to avoid surprises.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'timing-belt-replacement': (city, metro) => [
        `<p><strong>Engine type.</strong> Interference engines, where the valves and pistons share the same space, make timing belt replacement critical. If the belt fails on an interference engine, it can destroy the engine. Non-interference engines are more forgiving but still need timely replacement.</p>`,
        `<p><strong>Water pump bundling.</strong> Most shops in ${city} recommend replacing the water pump at the same time as the timing belt, since accessing it requires the same disassembly. Bundling saves $200 to $400 in labor compared to doing it separately later.</p>`,
        `<p><strong>Engine accessibility.</strong> On some vehicles, the timing belt is buried deep in the engine bay and requires removing the motor mount, power steering pump, or other components. This increases labor hours significantly compared to engines with easier access.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'exhaust-repair': (city, metro) => [
        `<p><strong>Scope of repair.</strong> A simple muffler replacement costs far less than replacing the entire exhaust system from the catalytic converter back. If the catalytic converter needs replacement, costs can jump by $500 to $2,000 depending on the vehicle.</p>`,
        `<p><strong>Material grade.</strong> Aluminized steel exhaust components are cheaper but typically last 3 to 5 years. Stainless steel lasts much longer but costs 30 to 60 percent more. In ${city}, the choice depends on how long you plan to keep the vehicle.</p>`,
        `<p><strong>Custom work needed.</strong> Older, modified, or performance vehicles may need custom welding and fabrication rather than bolt-on replacement parts. Custom exhaust work in ${city} typically adds $100 to $300 in labor.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'wheel-alignment': (city, metro) => [
        `<p><strong>Two-wheel vs four-wheel.</strong> A front-end (two-wheel) alignment costs less than a full four-wheel alignment. AWD and 4WD vehicles in ${city} generally need four-wheel alignment for proper handling and even tire wear.</p>`,
        `<p><strong>Adjustment complexity.</strong> Simple toe adjustments are quick and inexpensive. If the technician needs to correct camber or caster angles, additional hardware (shims, cam bolts) and labor time drive up the cost.</p>`,
        `<p><strong>Suspension condition.</strong> Worn ball joints, tie rods, or control arm bushings can prevent a proper alignment. If components need replacement before the alignment, the total cost increases. Reputable shops in ${city} will inspect the suspension first and let you know.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'auto-detailing': (city, metro) => [
        `<p><strong>Service level.</strong> A basic exterior wash and interior vacuum costs far less than a full detail with clay bar treatment, paint correction, and interior deep cleaning. In ${city}, most shops offer tiered packages from basic to premium.</p>`,
        `<p><strong>Vehicle size.</strong> Sedans and coupes cost less to detail than trucks, SUVs, and minivans due to the difference in surface area. Expect to pay 20 to 40 percent more for larger vehicles in ${city}.</p>`,
        `<p><strong>Paint condition.</strong> If your vehicle has swirl marks, scratches, or oxidation, paint correction (machine polishing) adds significantly to the total. Adding a ceramic coating or sealant on top of the correction provides lasting protection but increases the price further.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'windshield-replacement': (city, metro) => [
        `<p><strong>ADAS calibration.</strong> Vehicles with Advanced Driver Assistance Systems (lane departure, auto-braking) have cameras mounted near the windshield that require recalibration after replacement. This adds $100 to $400 to the total cost in ${city}.</p>`,
        `<p><strong>OEM vs aftermarket glass.</strong> OEM windshields ensure an exact fit and match the original acoustic and UV properties. Aftermarket glass saves 30 to 50 percent but may differ slightly in quality. Most ${city} shops offer both options.</p>`,
        `<p><strong>Mobile vs in-shop service.</strong> Mobile windshield replacement is convenient and available throughout the ${metro} area, but may cost slightly more than driving to a shop. Some providers waive the mobile fee for insurance claims.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Shops in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'water-heater-replacement': (city, metro) => [
        `<p><strong>Tank vs tankless.</strong> Traditional tank water heaters in ${city} cost $800 to $1,800 installed, while tankless units run $1,500 to $3,000 or more. Tankless units offer energy savings and endless hot water but require higher upfront investment.</p>`,
        `<p><strong>Fuel type.</strong> Gas, electric, and hybrid heat pump water heaters have different equipment costs, installation requirements, and operating expenses. Switching fuel types (for example, gas to electric) in ${city} may require additional electrical or plumbing work.</p>`,
        `<p><strong>Unit capacity.</strong> A 40-gallon tank suits one to two people, while families of four or more typically need a 50- or 75-gallon unit. Larger tanks cost more for both the unit and installation labor.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'garage-door-replacement': (city, metro) => [
        `<p><strong>Single vs double door.</strong> A single-car garage door in ${city} costs significantly less than a double-car (two-car) door. If you are replacing both doors on a two-car garage, most contractors offer a discount on the second door.</p>`,
        `<p><strong>Insulation level.</strong> Non-insulated doors are the cheapest option but offer no thermal barrier. Insulated doors (polystyrene or polyurethane core) cost more but improve energy efficiency and reduce noise, which matters in the ${metro} climate.</p>`,
        `<p><strong>Opener type.</strong> Belt-drive openers are quieter but cost more than chain-drive models. Smart openers with Wi-Fi connectivity and battery backup add further to the price. Many ${city} homeowners bundle a new opener with the door replacement to save on labor.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'drywall-repair': (city, metro) => [
        `<p><strong>Repair size.</strong> Small patches (under 6 inches) cost far less than large-section or full-wall repairs. Most ${city} contractors have a minimum service charge, so multiple small repairs on the same visit offer the best value.</p>`,
        `<p><strong>Water damage extent.</strong> If the drywall damage is caused by a leak, the source must be fixed first. Moisture-damaged drywall may require mold remediation, which adds significantly to the total project cost.</p>`,
        `<p><strong>Texture matching.</strong> Matching existing wall textures like knockdown, orange peel, or skip trowel requires skill and experience. Smooth walls are easier to patch. If your ${city} home has a distinctive texture, expect to pay more for seamless blending.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'tree-removal': (city, metro) => [
        `<p><strong>Tree height and diameter.</strong> Small trees (under 30 feet) cost a fraction of what large trees (50 to 80 feet or more) cost to remove. Tall trees require specialized equipment like cranes or bucket trucks, which significantly increases the price in ${city}.</p>`,
        `<p><strong>Proximity to structures.</strong> Trees near homes, power lines, fences, or other structures require careful, piece-by-piece removal rather than simple felling. This adds labor hours and liability, which drives up the cost.</p>`,
        `<p><strong>Stump grinding.</strong> Most tree removal quotes in ${city} do not include stump grinding. Adding stump grinding and root removal typically costs an extra $100 to $400 depending on the stump size.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'pest-control': (city, metro) => [
        `<p><strong>Pest type.</strong> General insect control (ants, roaches, spiders) costs less than specialized treatments. Termite treatment in ${city} can cost $500 to $2,000 or more depending on the method. Bed bug and rodent removal also commands premium pricing.</p>`,
        `<p><strong>Infestation severity.</strong> A minor, localized pest problem requires a single treatment. Severe infestations often need multiple visits over several weeks, which increases the total cost significantly.</p>`,
        `<p><strong>Treatment plan.</strong> One-time treatments cost more per visit than ongoing quarterly or monthly service contracts. Many ${city} pest control companies offer annual plans that include regular preventive treatments at a lower per-visit rate.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Providers in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'concrete-driveway-repair': (city, metro) => [
        `<p><strong>Repair vs replacement.</strong> Patching cracks and filling small sections costs a fraction of tearing out and replacing an entire driveway. If more than 30 percent of the surface is damaged, most ${city} contractors recommend full replacement for a better long-term result.</p>`,
        `<p><strong>Square footage.</strong> Larger driveways and patios cost more in total but often have lower per-square-foot rates. Getting your driveway and walkway done together can yield significant savings compared to separate projects.</p>`,
        `<p><strong>Decorative finish.</strong> Standard broom-finish concrete is the most affordable option. Stamped, stained, or exposed aggregate finishes add 30 to 100 percent to material and labor costs but dramatically improve curb appeal.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'gutter-installation': (city, metro) => [
        `<p><strong>Material choice.</strong> Aluminum gutters are the most popular and affordable option in ${city}. Copper gutters offer a premium aesthetic but cost three to five times more. Galvanized steel falls in between and holds up well in harsh weather.</p>`,
        `<p><strong>Home stories.</strong> Single-story homes are the easiest and cheapest to install gutters on. Two-story and three-story homes require longer ladders, scaffolding, or lift equipment, which adds to labor costs and safety measures.</p>`,
        `<p><strong>Gutter guards.</strong> Adding leaf guards, mesh screens, or micro-mesh covers increases material costs by 30 to 60 percent but dramatically reduces maintenance. In areas of ${city} with heavy tree cover, gutter guards can pay for themselves over time.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
    'window-replacement': (city, metro) => [
        `<p><strong>Number of windows.</strong> Per-window costs in ${city} decrease with larger orders. Replacing a single window costs more per unit than a whole-house project of 10 to 20 windows, where contractors can offer volume discounts.</p>`,
        `<p><strong>Window size and type.</strong> Standard double-hung windows are the most affordable to replace. Large picture windows, bay windows, and custom shapes cost significantly more due to specialized glass and framing requirements.</p>`,
        `<p><strong>Frame material.</strong> Vinyl frames are the most affordable and lowest-maintenance option. Wood frames offer a classic look but cost more and require periodic upkeep. Fiberglass and composite frames fall in between, combining durability with good aesthetics.</p>`,
        `<p><strong>Neighborhood and demand.</strong> Contractors in higher-income areas of ${city} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>`,
    ],
};

// ── Cost Calculation Engine ──────────────────────────────────
function calculateCosts(service, citySlug) {
    const hourlyWage = getWage(citySlug, service.occupation);
    const rpp = getRPP(citySlug) / 100;
    const shopMarkupLow = 1.6, shopMarkupHigh = 2.2;
    const laborCostLow = Math.round(hourlyWage * service.laborHoursLow * shopMarkupLow);
    const laborCostHigh = Math.round(hourlyWage * service.laborHoursHigh * shopMarkupHigh);
    const partsCostLow = Math.round(service.partsNationalLow * rpp);
    const partsCostHigh = Math.round(service.partsNationalHigh * rpp);
    const budgetLow = laborCostLow + partsCostLow;
    const budgetHigh = Math.round((laborCostLow + laborCostHigh) / 2) + Math.round((partsCostLow + partsCostHigh) / 2 * 0.7);
    const midLow = Math.round((budgetLow + budgetHigh) / 2 * 0.95);
    const midHigh = Math.round(laborCostHigh * 0.85 + partsCostHigh * 0.85);
    const premiumLow = midHigh;
    const premiumHigh = laborCostHigh + partsCostHigh;
    const round10 = (n) => Math.round(n / 10) * 10;
    return {
        hourlyWage, rpp: getRPP(citySlug),
        laborCostLow: round10(laborCostLow), laborCostHigh: round10(laborCostHigh),
        partsCostLow: round10(partsCostLow), partsCostHigh: round10(partsCostHigh),
        budgetLow: round10(budgetLow), budgetHigh: round10(budgetHigh),
        midLow: round10(midLow), midHigh: round10(midHigh),
        premiumLow: round10(premiumLow), premiumHigh: round10(premiumHigh),
    };
}

// ── Shared HTML fragments ────────────────────────────────────
const FOOTER_SOCIAL = `
                <div class="footer-social">
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

const STICKY_CTA = `    <div class="site-sticky-cta" id="site-sticky-cta">
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

const DISCLAIMER = `
                <div class="cost-disclaimer">
                    <span class="cost-disclaimer-icon">\u2139\uFE0F</span>
                    <p><strong>Disclaimer:</strong> Prices shown are estimates based on regional averages and publicly available data. Actual costs may vary depending on project scope, materials, labor rates, contractor availability, and other factors. These figures are for informational purposes only and do not constitute a quote, bid, or guarantee of pricing. Always contact local service providers for accurate, up-to-date pricing for your specific project.</p>
                </div>`;

// ── Content generation ───────────────────────────────────────
function generateContentSections(service, city, costs) {
    const { name: svcName, category, shortDesc } = service;
    const { name: cityName, state, metro } = city;
    const loc = `${cityName}, ${state}`;
    const rpp = costs.rpp;
    const rppLabel = rpp > 103 ? 'above the national average' : rpp < 97 ? 'below the national average' : 'close to the national average';
    let s = '';
    s += `<p>If you live in the ${metro} metro area and need ${shortDesc}, understanding local pricing before you call a shop can save you hundreds of dollars. Labor rates, material costs, and demand all vary by region, and ${cityName} has its own pricing dynamics shaped by the local economy and cost of living.</p>\n\n`;
    s += `<p>Based on current labor rates and material costs in ${loc}, here is what you can expect to pay for ${shortDesc} in 2026.</p>\n\n`;
    s += `<div class="cost-table">\n`;
    s += `    <div class="cost-row"><span>Budget estimate</span><span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.budgetHigh.toLocaleString()}</span></div>\n`;
    s += `    <div class="cost-row"><span>Mid-range estimate</span><span>$${costs.midLow.toLocaleString()} &ndash; $${costs.midHigh.toLocaleString()}</span></div>\n`;
    s += `    <div class="cost-row"><span>Premium estimate</span><span>$${costs.premiumLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span></div>\n`;
    s += `    <div class="cost-row"><span>Labor portion</span><span>$${costs.laborCostLow.toLocaleString()} &ndash; $${costs.laborCostHigh.toLocaleString()}</span></div>\n`;
    s += `    <div class="cost-row"><span>Parts &amp; materials</span><span>$${costs.partsCostLow.toLocaleString()} &ndash; $${costs.partsCostHigh.toLocaleString()}</span></div>\n`;
    s += `</div>\n`;
    s += `<div class="inline-cta">\n    <a href="/" class="btn btn-accent">Get a Free Estimate &rarr;</a>\n    <span class="inline-cta-sub">AI-powered &middot; No account needed &middot; Always free</span>\n</div>\n\n`;
    s += `<h2>How We Calculate ${svcName} Costs in ${cityName}</h2>\n\n`;
    s += `<p>These estimates combine two data sources from the federal government. Local hourly wages come from the Bureau of Labor Statistics Occupational Employment and Wage Statistics program, which surveys employers across the ${metro} metro area every year. The cost-of-living adjustment uses Regional Price Parities from the Bureau of Economic Analysis, which measure how much goods and services cost in ${cityName} compared to the national average.</p>\n\n`;
    s += `<p>The ${cityName} metro area has a Regional Price Parity of <strong>${rpp}</strong>, meaning the overall cost of goods and services is ${rppLabel}. The local hourly wage for this trade is <strong>$${costs.hourlyWage.toFixed(2)}</strong> per hour, which directly impacts how much shops charge for labor.</p>\n\n`;
    s += `<h2>Why ${svcName} Costs Vary in ${cityName}</h2>\n\n`;
    s += `<p>Even within the ${metro} metro area, you will find a wide range of prices. Several factors drive this variation.</p>\n\n`;

    // Service-specific factors
    const factors = WHY_COSTS_VARY[service.slug];
    if (factors) {
        factors(cityName, metro).forEach(f => { s += f + '\n\n'; });
    }

    s += `<h2>How to Save on ${svcName} in ${cityName}</h2>\n\n`;
    s += `<p>Getting the best price in ${loc} comes down to preparation and smart shopping.</p>\n\n`;
    s += `<p><strong>Get at least three quotes.</strong> Prices in the ${metro} area vary significantly between providers. Spending an hour collecting quotes can easily save you $${Math.round(costs.midLow * 0.15)} or more.</p>\n\n`;
    s += `<p><strong>Check seasonal timing.</strong> ${category === 'auto' ? `Many auto shops offer promotions during slower months. In ${cityName}, demand tends to dip in early spring and late fall.` : `Home service demand in ${cityName} peaks in spring and summer. Scheduling work in late fall or winter can get you better pricing and faster scheduling.`}</p>\n\n`;
    s += `<p><strong>Read recent reviews.</strong> Google Reviews, Yelp, and NextDoor are valuable resources for finding reliable ${category === 'auto' ? 'mechanics and shops' : 'contractors'} in ${cityName}. Look for providers with consistent 4.5+ star ratings and detailed reviews mentioning fair pricing.</p>\n\n`;
    s += `<p><strong>Ask about warranties.</strong> Reputable providers in ${cityName} stand behind their work. A written warranty on both parts and labor protects you from paying twice for the same problem.</p>\n\n`;
    s += `<h2>Get a Personalized ${svcName} Estimate</h2>\n\n`;
    s += `<p>These ranges reflect typical pricing in the ${metro} metro area, but your actual cost depends on your specific situation. Use our free AI-powered estimator to get a detailed, personalized quote based on your exact needs and location in ${cityName}.</p>\n\n`;
    return s;
}

// ── Compare cities table ─────────────────────────────────────
function generateCompareTable(service, city, costs) {
    const nearby = NEARBY_MAP[city.slug] || [];
    const comparisons = [];
    for (const slug of nearby) {
        if (cityLabor[slug]) {
            const nc = calculateCosts(service, slug);
            const ncCity = CITIES.find(c => c.slug === slug);
            if (ncCity) comparisons.push({ name: ncCity.name, slug, midRange: `$${nc.midLow.toLocaleString()} \u2013 $${nc.midHigh.toLocaleString()}` });
        }
        if (comparisons.length >= 3) break;
    }
    if (comparisons.length < 2) return '';
    let h = `\n                <div class="compare-cities-table">\n`;
    h += `                    <h2>Compare ${service.icon} ${service.name} Prices Nearby</h2>\n`;
    h += `                    <p>See how ${city.name} pricing compares to nearby cities for the same service.</p>\n`;
    h += `                    <table>\n                        <thead><tr><th>City</th><th>Mid-Range Cost</th></tr></thead>\n                        <tbody>\n`;
    h += `                            <tr class="current-city"><td>${city.name} <span class="you-badge">You</span></td><td>$${costs.midLow.toLocaleString()} \u2013 $${costs.midHigh.toLocaleString()}</td></tr>\n`;
    for (const c of comparisons) {
        h += `                            <tr><td><a href="/cost/${c.slug}/${service.slug}">${c.name}</a></td><td>${c.midRange}</td></tr>\n`;
    }
    h += `                        </tbody>\n                    </table>\n                </div>\n`;
    return h;
}

// ── Cross-links ──────────────────────────────────────────────
function generateCrossLinks(service, city) {
    const otherServices = ALL_SERVICES_UNIQUE.filter(s => s.slug !== service.slug).map(s =>
        `<a href="/cost/${city.slug}/${s.slug}">${s.name}</a>`
    ).join(' ');
    const topCities = ['houston', 'los-angeles', 'chicago', 'phoenix', 'philadelphia', 'dallas', 'new-york', 'san-antonio'];
    const otherCities = topCities.filter(c => c !== city.slug).slice(0, 8).map(slug => {
        const c = CITIES.find(x => x.slug === slug);
        return `<a href="/cost/${slug}/${service.slug}">${c.name}, ${c.state}</a>`;
    }).join(' ');
    return `
                <div class="cross-links">
                    <h3>More services in ${city.name}</h3>
                    <div class="cross-links-list">${otherServices}</div>
                </div>
                <div class="cross-links" style="margin-top:12px;">
                    <h3>${service.name} in other cities</h3>
                    <div class="cross-links-list">${otherCities}</div>
                </div>`;
}

// ── Related services & other cities ──────────────────────────
function getRelatedServices(service, city) {
    return ALL_SERVICES_UNIQUE.filter(s => s.slug !== service.slug && s.category === service.category).slice(0, 4)
        .map(s => `                    <li><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name} Cost in ${city.name}</a></li>`).join('\n');
}
function getOtherCities(service, city) {
    const idx = CITIES.findIndex(c => c.slug === city.slug);
    const pool = CITIES.slice(0, 20);
    return [pool[idx % pool.length], pool[(idx+3) % pool.length], pool[(idx+7) % pool.length], pool[(idx+11) % pool.length], pool[(idx+15) % pool.length]]
        .filter(c => c.slug !== city.slug)
        .map(c => `                    <li><a href="/cost/${c.slug}/${service.slug}">${service.name} Cost in ${c.name}, ${c.state}</a></li>`).join('\n');
}

// ── Service Page Template ────────────────────────────────────
function generateHTML(service, city, costs) {
    const loc = `${city.name}, ${city.state}`;
    const title = `${service.name} Cost in ${loc} (2026 Prices) | Ecostify`;
    const desc = `${service.name} in ${loc} costs $${costs.budgetLow.toLocaleString()} to $${costs.premiumHigh.toLocaleString()} in 2026. See local labor rates, material costs, and tips to save. Data from BLS and BEA.`;
    const canonical = `https://www.ecostify.com/cost/${city.slug}/${service.slug}`;
    const badge = `${service.category === 'auto' ? 'Auto' : 'Home'} &middot; ${loc}`;
    const content = generateContentSections(service, city, costs);
    const ctaLink = service.category === 'auto' ? '/#auto' : '/#home';
    const breadcrumbJson = JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.ecostify.com/"},{"@type":"ListItem","position":2,"name":"Cost Guides","item":"https://www.ecostify.com/cost/"},{"@type":"ListItem","position":3,"name":loc,"item":`https://www.ecostify.com/cost/${city.slug}/`},{"@type":"ListItem","position":4,"name":service.name}]});

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="theme-color" content="#1B2A3D">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:site_name" content="Ecostify">
    <meta property="og:image" content="https://www.ecostify.com/images/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://www.ecostify.com/images/og-image.png">
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Article","headline":"${service.name} Cost in ${loc} \u2014 2026 Pricing Guide","description":"${desc}","datePublished":"2026-03-03","dateModified":"2026-03-03","author":{"@type":"Person","name":"Ecostify Editorial","url":"https://www.ecostify.com/about"},"publisher":{"@type":"Organization","name":"Ecostify","url":"https://www.ecostify.com"}}
    </script>
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How much does ${service.name.toLowerCase()} cost in ${loc}?","acceptedAnswer":{"@type":"Answer","text":"${service.name} in ${loc} typically costs between $${costs.budgetLow.toLocaleString()} and $${costs.premiumHigh.toLocaleString()} in 2026, depending on the scope of work and materials. The mid-range estimate is $${costs.midLow.toLocaleString()} to $${costs.midHigh.toLocaleString()}."}},{"@type":"Question","name":"What is the average labor rate for this service in ${city.name}?","acceptedAnswer":{"@type":"Answer","text":"Based on BLS data, the average hourly wage for this trade in the ${city.metro} metro area is $${costs.hourlyWage.toFixed(2)} per hour. After shop overhead and markup, expect to pay roughly $${costs.laborCostLow.toLocaleString()} to $${costs.laborCostHigh.toLocaleString()} total for labor."}}]}
    </script>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/global-light.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FCVYRYEKNX"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FCVYRYEKNX');</script>
    <script type="application/ld+json">
    ${breadcrumbJson}
    </script>
</head>
<body>
    <nav class="nav">
        <div class="container nav-inner">
            <a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>
            <button class="nav-toggle" aria-label="Menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div class="nav-links">
                <a href="/#auto">Auto</a>
                <a href="/#home">Home</a>
                <a href="/cost/">Cost Guides</a>
                <a href="/blog/">Blog</a>
                <a href="/directory">Directory</a>
                <a href="/#how">How It Works</a>
            </div>
        </div>
    </nav>
    <article class="blog-article">
        <div class="container">
            <a href="/cost/" class="results-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5m0 0l4-4m-4 4l4 4"/></svg>
                All cost guides
            </a>
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/cost/">Cost Guides</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/cost/${city.slug}/">${loc}</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <span class="breadcrumb-current">${service.name}</span>
            </nav>
            <div class="article-header">
                <div class="blog-card-badge">${badge}</div>
                <h1>${service.icon} ${service.name} Cost in ${loc}</h1>
                <p class="article-meta">Updated March 2026 &middot; Based on BLS &amp; BEA data for the ${city.metro} metro area</p>
            </div>
            <div class="last-updated-badge">Last Updated: March 2026</div>
            <div class="article-body">

                ${content}

                <h2>Other ${service.category === 'auto' ? 'Auto' : 'Home'} Services in ${city.name}</h2>

                <ul>
${getRelatedServices(service, city)}
                </ul>

                <h2>${service.name} Cost in Other Cities</h2>

                <ul>
${getOtherCities(service, city)}
                </ul>
${generateCompareTable(service, city, costs)}
${generateCrossLinks(service, city)}

                <div class="article-cta">
                    <h3>Get an Instant ${service.name} Estimate for ${city.name}</h3>
                    <p>Upload a photo or describe your project to get a personalized AI-powered cost estimate calibrated to ${loc} pricing.</p>
                    <a href="${ctaLink}" class="btn">Get Your Estimate &rarr;</a>
                </div>
${DISCLAIMER}
            </div>
        </div>
    </article>
    <footer class="footer">
        <div class="container footer-inner">
            <div class="footer-top">
                <a href="/" class="logo"><span class="logo-e">e</span><span class="logo-cost">cost</span><span class="logo-ify">ify</span></a>
                <p class="footer-tagline">Know the real cost before you call.</p>
            </div>
            <div class="footer-bottom">
                <div class="footer-links">
                    <a href="/about">About</a>
                    <a href="/cost/">Cost Guides</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/disclaimer">Disclaimer</a>
                </div>
                <span class="footer-copy">&copy; 2026 Ecostify</span>${FOOTER_SOCIAL}
            </div>
        </div>
    </footer>
    <script>
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
            navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
        }
    </script>
${STICKY_CTA}
</body>
</html>`;
}

// ── Update City Hub Pages ────────────────────────────────────
function updateCityHub(city) {
    const hubPath = path.join(__dirname, 'cost', city.slug, 'index.html');
    if (!fs.existsSync(hubPath)) return false;
    let html = fs.readFileSync(hubPath, 'utf8');

    // Determine which new services are NOT already in the hub
    const newAutoServices = NEW_SERVICES.filter(s => s.category === 'auto' && !html.includes(`/cost/${city.slug}/${s.slug}`));
    const newHomeServices = NEW_SERVICES.filter(s => s.category === 'home' && !html.includes(`/cost/${city.slug}/${s.slug}`));

    // Generate new auto service rows
    if (newAutoServices.length > 0) {
        const autoRows = newAutoServices.map(s => {
            const costs = calculateCosts(s, city.slug);
            return `\n                    <div class="cost-row">\n                        <span><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}</a></span>\n                        <span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span>\n                    </div>`;
        }).join('');
        // Insert before the closing </div> of the auto cost-table (before inline-cta)
        // Use function replacement to avoid $ back-reference issues in price strings
        html = html.replace(
            /(<\/div>\s*<div class="inline-cta">)/,
            (match, p1) => autoRows + '\n                ' + p1
        );
    }

    // Generate new home service rows
    if (newHomeServices.length > 0) {
        const homeRows = newHomeServices.map(s => {
            const costs = calculateCosts(s, city.slug);
            return `\n                    <div class="cost-row">\n                        <span><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}</a></span>\n                        <span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span>\n                    </div>`;
        }).join('');
        // Insert before the closing </div> of the home cost-table (before article-cta)
        html = html.replace(
            /(<\/div>\s*<div class="article-cta">)/,
            (match, p1) => homeRows + '\n                ' + p1
        );
    }

    // Update service count in meta description and structured data
    const totalServices = 16 + newAutoServices.length + newHomeServices.length;
    html = html.replace(/Compare costs for 16 auto/g, `Compare costs for ${totalServices} auto`);
    html = html.replace(/"16 services priced/g, `"${totalServices} services priced`);
    html = html.replace(/"numberOfItems":16/g, `"numberOfItems":${totalServices}`);

    // Add new services to ItemList schema
    const newSchemaItems = [...newAutoServices, ...newHomeServices].map((s, i) => {
        return `{"@type":"ListItem","position":${17 + i},"name":"${s.name} Cost in ${city.name}","url":"https://www.ecostify.com/cost/${city.slug}/${s.slug}"}`;
    });
    if (newSchemaItems.length > 0) {
        html = html.replace(
            /("itemListElement":\[.*?)(\]\})/s,
            (match, p1, p2) => p1 + ',' + newSchemaItems.join(',') + p2
        );
    }

    // Update "View all 16 services" link text
    html = html.replace(/View all 16 services/g, `View all ${totalServices} services`);

    // Update date to March 2026
    html = html.replace(/Updated February 2026/g, 'Updated March 2026');
    html = html.replace(/Last Updated: February 2026/g, 'Last Updated: March 2026');

    fs.writeFileSync(hubPath, html);
    return true;
}

// ── Update Main Cost Guide Hub (/cost/index.html) ────────────
function updateMainHub() {
    const hubPath = path.join(__dirname, 'cost', 'index.html');
    if (!fs.existsSync(hubPath)) { console.log('  /cost/index.html not found, skipping'); return; }
    let html = fs.readFileSync(hubPath, 'utf8');

    // Add new auto services to the "Browse by Service" > Auto Services grid group
    const newAutoLinks = NEW_SERVICES.filter(s => s.category === 'auto' && !html.includes(s.slug)).map(s =>
        `                            <a href="/cost/houston/${s.slug}" class="service-link service-link-auto">${s.name}</a>`
    );
    if (newAutoLinks.length > 0) {
        // Find the Auto Services group and append before its closing </div>
        html = html.replace(
            /(Auto Services<\/h4>[\s\S]*?)(Window Tinting<\/a>\s*<\/div>)/,
            (match, p1, p2) => p1 + p2.replace('</div>', '\n' + newAutoLinks.join('\n') + '\n                        </div>')
        );
    }

    // Add new home services to the Home Services grid group
    const newHomeLinks = NEW_SERVICES.filter(s => s.category === 'home' && !html.includes(s.slug)).map(s =>
        `                            <a href="/cost/houston/${s.slug}" class="service-link service-link-home">${s.name}</a>`
    );
    if (newHomeLinks.length > 0) {
        html = html.replace(
            /(Home Services<\/h4>[\s\S]*?)(Roof Replacement<\/a>\s*<\/div>)/,
            (match, p1, p2) => p1 + p2.replace('</div>', '\n' + newHomeLinks.join('\n') + '\n                        </div>')
        );
    }

    // Update "View all X services" in city cards
    html = html.replace(/View all 16 services/g, 'View all 32 services');

    // Update the intro paragraph count
    html = html.replace(/16 common services/g, '32 common services');

    fs.writeFileSync(hubPath, html);
}

// ── Update Sitemap ───────────────────────────────────────────
function updateSitemap() {
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) { console.log('  sitemap.xml not found, skipping'); return; }
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    let newEntries = '';
    CITIES.forEach(city => {
        NEW_SERVICES.forEach(s => {
            // Skip if URL already exists in sitemap
            const url = `https://www.ecostify.com/cost/${city.slug}/${s.slug}`;
            if (!sitemap.includes(url)) {
                newEntries += `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-03-03</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
            }
        });
    });
    if (newEntries) {
        sitemap = sitemap.replace('</urlset>', newEntries + '</urlset>');
        fs.writeFileSync(sitemapPath, sitemap);
    }
    return newEntries.split('<url>').length - 1;
}

// ── Main Build ───────────────────────────────────────────────
function build() {
    const baseDir = path.join(__dirname, 'cost');
    let pageCount = 0;
    let skippedExisting = 0;

    console.log('Ecostify New Services Generator');
    console.log(`${CITIES.length} cities x ${NEW_SERVICES.length} services = ${CITIES.length * NEW_SERVICES.length} service pages\n`);

    // Step 1: Generate service pages
    console.log('Step 1: Generating service pages...');
    CITIES.forEach(city => {
        const cityDir = path.join(baseDir, city.slug);
        if (!fs.existsSync(cityDir)) fs.mkdirSync(cityDir, { recursive: true });

        NEW_SERVICES.forEach(service => {
            const costs = calculateCosts(service, city.slug);
            fs.writeFileSync(path.join(cityDir, `${service.slug}.html`), generateHTML(service, city, costs));
            pageCount++;
        });
        process.stdout.write(`  ${city.name}, ${city.state} \u2014 ${NEW_SERVICES.length} pages\n`);
    });
    console.log(`\n  Generated ${pageCount} service pages`);

    // Step 2: Update city hub pages
    console.log('\nStep 2: Updating city hub pages...');
    let hubsUpdated = 0;
    CITIES.forEach(city => {
        if (updateCityHub(city)) hubsUpdated++;
    });
    console.log(`  Updated ${hubsUpdated} city hub pages`);

    // Step 3: Update main cost guide hub
    console.log('\nStep 3: Updating /cost/index.html...');
    updateMainHub();
    console.log('  Done');

    // Step 4: Update sitemap
    console.log('\nStep 4: Updating sitemap.xml...');
    const newUrls = updateSitemap();
    console.log(`  Added ${newUrls} new URLs to sitemap.xml`);

    console.log(`\nDone! Generated ${pageCount} pages, updated ${hubsUpdated} city hubs.`);
}

build();
