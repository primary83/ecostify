// Ecostify Pricing Engine — Data-Backed Estimate Calculator
// Combines: Service Catalog + BLS OEWS Wages + BEA RPP Price Parities
// Formula: (Local Labor Rate x Hours) + (Materials x RPP Multiplier) + Shop Fees
// Fallback: If data missing, returns null (caller uses AI-only estimate)

const { SERVICE_CATALOG, KEYWORD_INDEX } = require('./service-catalog.js');
const LABOR_RATES = require('./city-labor-rates.js');
const PRICE_PARITIES = require('./city-price-parities.js');
const CITY_MAPPING = require('./city-mapping.js');

// ══════════════════════════════════════════════════════════════
//  matchCity — Normalize user's city name to our slug format
// ══════════════════════════════════════════════════════════════

// Build a reverse lookup: display name → slug, common variations
const CITY_ALIASES = {};
for (const [slug, info] of Object.entries(CITY_MAPPING)) {
  // "Orlando, FL" → orlando
  CITY_ALIASES[info.display.toLowerCase()] = slug;
  // "Orlando" → orlando
  const cityOnly = info.display.split(',')[0].trim().toLowerCase();
  CITY_ALIASES[cityOnly] = slug;
  // slug itself
  CITY_ALIASES[slug] = slug;
  // slug without hyphens
  CITY_ALIASES[slug.replace(/-/g, ' ')] = slug;
}

// Common aliases
CITY_ALIASES['nyc'] = 'new-york';
CITY_ALIASES['new york city'] = 'new-york';
CITY_ALIASES['la'] = 'los-angeles';
CITY_ALIASES['sf'] = 'san-francisco';
CITY_ALIASES['san fran'] = 'san-francisco';
CITY_ALIASES['philly'] = 'philadelphia';
CITY_ALIASES['vegas'] = 'las-vegas';
CITY_ALIASES['kc'] = 'kansas-city';
CITY_ALIASES['okc'] = 'oklahoma-city';
CITY_ALIASES['indy'] = 'indianapolis';
CITY_ALIASES['jax'] = 'jacksonville';
CITY_ALIASES['nola'] = 'new-orleans';
CITY_ALIASES['dtw'] = 'detroit';
CITY_ALIASES['pgh'] = 'pittsburgh';
CITY_ALIASES['stl'] = 'st-louis';
CITY_ALIASES['saint louis'] = 'st-louis';
CITY_ALIASES['st louis'] = 'st-louis';
CITY_ALIASES['co springs'] = 'colorado-springs';
CITY_ALIASES['slc'] = 'salt-lake-city';
CITY_ALIASES['grand rapids'] = 'grand-rapids';
CITY_ALIASES['baton rouge'] = 'baton-rouge';
CITY_ALIASES['salt lake'] = 'salt-lake-city';
CITY_ALIASES['el paso'] = 'el-paso';
CITY_ALIASES['des moines'] = 'des-moines';
CITY_ALIASES['little rock'] = 'little-rock';
CITY_ALIASES['cape coral'] = 'cape-coral';
CITY_ALIASES['palm bay'] = 'palm-bay';
CITY_ALIASES['daytona'] = 'daytona-beach';
CITY_ALIASES['fayetteville ar'] = 'fayetteville-ar';
CITY_ALIASES['fayetteville arkansas'] = 'fayetteville-ar';
CITY_ALIASES['wilmington nc'] = 'wilmington-nc';
CITY_ALIASES['wilmington north carolina'] = 'wilmington-nc';
CITY_ALIASES['springfield mo'] = 'springfield-mo';
CITY_ALIASES['springfield missouri'] = 'springfield-mo';
CITY_ALIASES['grand rapids'] = 'grand-rapids';

// State name → abbreviation mapping (Nominatim returns full names)
const STATE_ABBREVS = {
  'alabama':'al','alaska':'ak','arizona':'az','arkansas':'ar','california':'ca',
  'colorado':'co','connecticut':'ct','delaware':'de','florida':'fl','georgia':'ga',
  'hawaii':'hi','idaho':'id','illinois':'il','indiana':'in','iowa':'ia',
  'kansas':'ks','kentucky':'ky','louisiana':'la','maine':'me','maryland':'md',
  'massachusetts':'ma','michigan':'mi','minnesota':'mn','mississippi':'ms','missouri':'mo',
  'montana':'mt','nebraska':'ne','nevada':'nv','new hampshire':'nh','new jersey':'nj',
  'new mexico':'nm','new york':'ny','north carolina':'nc','north dakota':'nd','ohio':'oh',
  'oklahoma':'ok','oregon':'or','pennsylvania':'pa','rhode island':'ri','south carolina':'sc',
  'south dakota':'sd','tennessee':'tn','texas':'tx','utah':'ut','vermont':'vt',
  'virginia':'va','washington':'wa','west virginia':'wv','wisconsin':'wi','wyoming':'wy'
};

// Suburb → metro city fallback (common suburbs map to their metro hub)
const SUBURB_FALLBACKS = {
  // Orlando metro
  'windermere':'orlando','kissimmee':'orlando','sanford':'orlando','winter park':'orlando',
  'lake mary':'orlando','ocoee':'orlando','altamonte springs':'orlando','winter garden':'orlando',
  // Houston metro
  'sugar land':'houston','the woodlands':'houston','katy':'houston','pearland':'houston',
  'league city':'houston','pasadena':'houston','baytown':'houston','missouri city':'houston',
  // Dallas-Fort Worth metro
  'plano':'dallas','irving':'dallas','frisco':'dallas','mckinney':'dallas',
  'denton':'dallas','garland':'dallas','richardson':'dallas','mesquite':'dallas',
  'grand prairie':'dallas','carrollton':'dallas','lewisville':'dallas',
  // Los Angeles metro
  'long beach':'los-angeles','anaheim':'los-angeles','santa ana':'los-angeles',
  'irvine':'los-angeles','glendale':'los-angeles','pasadena':'los-angeles',
  'torrance':'los-angeles','pomona':'los-angeles','burbank':'los-angeles',
  // Chicago metro
  'naperville':'chicago','joliet':'chicago','elgin':'chicago','aurora':'chicago',
  'evanston':'chicago','schaumburg':'chicago','cicero':'chicago','oak park':'chicago',
  // Phoenix metro
  'scottsdale':'phoenix','tempe':'phoenix','chandler':'phoenix','glendale':'phoenix',
  'gilbert':'phoenix','peoria':'phoenix','surprise':'phoenix',
  // San Francisco / San Jose metro
  'oakland':'san-francisco','berkeley':'san-francisco','fremont':'san-jose',
  'sunnyvale':'san-jose','santa clara':'san-jose','mountain view':'san-jose',
  'palo alto':'san-jose','cupertino':'san-jose','milpitas':'san-jose',
  // Miami metro
  'fort lauderdale':'miami','hollywood':'miami','pompano beach':'miami',
  'coral springs':'miami','hialeah':'miami','pembroke pines':'miami',
  'miramar':'miami','davie':'miami','boca raton':'miami',
  // New York metro
  'brooklyn':'new-york','queens':'new-york','bronx':'new-york','staten island':'new-york',
  'yonkers':'new-york','newark':'new-york','jersey city':'new-york',
  'new rochelle':'new-york','white plains':'new-york',
  // Atlanta metro
  'roswell':'atlanta','alpharetta':'atlanta','sandy springs':'atlanta',
  'johns creek':'atlanta','kennesaw':'atlanta','smyrna':'atlanta','decatur':'atlanta',
  // Seattle metro
  'bellevue':'seattle','tacoma':'seattle','redmond':'seattle','renton':'seattle',
  'kent':'seattle','everett':'seattle','kirkland':'seattle','bothell':'seattle',
  // Denver metro
  'aurora':'denver','lakewood':'denver','thornton':'denver','westminster':'denver',
  'arvada':'denver','centennial':'denver','broomfield':'denver',
  // Tampa metro
  'st petersburg':'tampa','clearwater':'tampa','brandon':'tampa','largo':'tampa',
  // Minneapolis metro
  'st paul':'minneapolis','bloomington':'minneapolis','brooklyn park':'minneapolis',
  'plymouth':'minneapolis','eden prairie':'minneapolis',
  // Portland metro
  'beaverton':'portland','hillsboro':'portland','gresham':'portland','lake oswego':'portland',
  // San Diego metro
  'chula vista':'san-diego','carlsbad':'san-diego','escondido':'san-diego',
  'oceanside':'san-diego','el cajon':'san-diego',
  // Philadelphia metro
  'camden':'philadelphia','wilmington':'philadelphia','cherry hill':'philadelphia',
  // Nashville metro
  'murfreesboro':'nashville','franklin':'nashville','brentwood':'nashville',
  // Other notable suburbs
  'henderson':'las-vegas','paradise':'las-vegas','north las vegas':'las-vegas',
  'round rock':'austin','georgetown':'austin','cedar park':'austin',
  'new braunfels':'san-antonio','converse':'san-antonio',
  'overland park':'kansas-city','olathe':'kansas-city','independence':'kansas-city',
  'norman':'oklahoma-city','edmond':'oklahoma-city','moore':'oklahoma-city',
  'roseville':'sacramento','folsom':'sacramento','elk grove':'sacramento',
  'warren':'detroit','dearborn':'detroit','livonia':'detroit','troy':'detroit',
  'towson':'baltimore','columbia':'baltimore','ellicott city':'baltimore',
  'cary':'raleigh','durham':'raleigh','apex':'raleigh',
  'concord':'charlotte','gastonia':'charlotte','huntersville':'charlotte',
  // ── Batch 5 suburbs ──
  'henrico':'richmond','chesterfield':'richmond','glen allen':'richmond','midlothian':'richmond','short pump':'richmond',
  'west valley city':'salt-lake-city','sandy':'salt-lake-city','murray':'salt-lake-city','west jordan':'salt-lake-city','south jordan':'salt-lake-city','draper':'salt-lake-city',
  'hoover':'birmingham','vestavia hills':'birmingham','homewood':'birmingham','mountain brook':'birmingham','trussville':'birmingham',
  'derby':'wichita','andover':'wichita','maize':'wichita',
  'sun prairie':'madison','middleton':'madison','fitchburg':'madison','verona':'madison',
  'denham springs':'baton-rouge','prairieville':'baton-rouge','gonzales':'baton-rouge',
  'kentwood':'grand-rapids','walker':'grand-rapids','grandville':'grand-rapids',
  'irmo':'columbia','west columbia':'columbia','cayce':'columbia',
  'west hartford':'hartford','east hartford':'hartford','new britain':'hartford','manchester':'hartford',
  'cheektowaga':'buffalo','tonawanda':'buffalo','amherst':'buffalo','niagara falls':'buffalo',
  // ── Batch 6 suburbs ──
  'cuyahoga falls':'akron','stow':'akron','barberton':'akron','green':'akron',
  'irondequoit':'rochester','greece':'rochester','brighton':'rochester','webster':'rochester',
  'warwick':'providence','cranston':'providence','pawtucket':'providence','east providence':'providence',
  'shrewsbury':'worcester','auburn':'worcester','leominster':'worcester',
  'farragut':'knoxville','maryville':'knoxville','oak ridge':'knoxville',
  'meridian':'boise','nampa':'boise','caldwell':'boise','eagle':'boise',
  'high point':'greensboro','burlington':'greensboro','kernersville':'greensboro',
  'broken arrow':'tulsa','owasso':'tulsa','sand springs':'tulsa','jenks':'tulsa',
  'kettering':'dayton','beavercreek':'dayton','huber heights':'dayton','centerville':'dayton',
  // ── Batch 7 suburbs ──
  'clearfield':'ogden','layton':'ogden','roy':'ogden',
  'clovis':'fresno','madera':'fresno','sanger':'fresno',
  'lodi':'stockton','manteca':'stockton','tracy':'stockton',
  'orem':'provo','lehi':'provo','spanish fork':'provo','springville':'provo',
  'west des moines':'des-moines','ankeny':'des-moines','urbandale':'des-moines','waukee':'des-moines',
  'north little rock':'little-rock','conway':'little-rock','benton':'little-rock','bryant':'little-rock',
  'spokane valley':'spokane','cheney':'spokane','liberty lake':'spokane',
  // ── Batch 8 suburbs ──
  'bradenton':'sarasota','north port':'sarasota','venice':'sarasota','englewood':'sarasota',
  'fort myers':'cape-coral','lehigh acres':'cape-coral','bonita springs':'cape-coral','estero':'cape-coral',
  'winter haven':'lakeland','bartow':'lakeland','haines city':'lakeland','auburndale':'lakeland',
  'deltona':'daytona-beach','ormond beach':'daytona-beach','port orange':'daytona-beach','new smyrna beach':'daytona-beach',
  'melbourne':'palm-bay','titusville':'palm-bay','cocoa':'palm-bay','rockledge':'palm-bay',
  'east ridge':'chattanooga','red bank':'chattanooga','signal mountain':'chattanooga',
  'pooler':'savannah','richmond hill':'savannah','hinesville':'savannah',
  'north charleston':'charleston','mount pleasant':'charleston','summerville':'charleston','goose creek':'charleston',
  'anderson':'greenville','greer':'greenville','simpsonville':'greenville','mauldin':'greenville','easley':'greenville',
  'hendersonville':'asheville','brevard':'asheville','black mountain':'asheville','weaverville':'asheville',
  // ── Batch 9 suburbs ──
  'sparks':'reno','carson city':'reno','sun valley':'reno',
  'pace':'pensacola','milton':'pensacola','gulf breeze':'pensacola',
  'springdale':'fayetteville-ar','rogers':'fayetteville-ar','bentonville':'fayetteville-ar','lowell':'fayetteville-ar',
  'martinez':'augusta','evans':'augusta','north augusta':'augusta',
  'carlisle':'harrisburg','mechanicsburg':'harrisburg','camp hill':'harrisburg','hershey':'harrisburg',
  'dewitt':'syracuse','clay':'syracuse','liverpool':'syracuse','cicero':'syracuse',
  'leland':'wilmington-nc','hampstead':'wilmington-nc','carolina beach':'wilmington-nc',
  'ridgeland':'jackson','brandon':'jackson','flowood':'jackson','pearl':'jackson','clinton':'jackson',
  'ozark':'springfield-mo','nixa':'springfield-mo','republic':'springfield-mo'
};

function matchCity(city, state) {
  if (!city) return null;
  const normalized = city.trim().toLowerCase();

  // Normalize state: "Florida" → "fl", "FL" → "fl"
  let stateNorm = state ? state.trim().toLowerCase() : '';
  if (stateNorm.length > 2) {
    stateNorm = STATE_ABBREVS[stateNorm] || stateNorm;
  }

  // Direct slug match
  if (CITY_MAPPING[normalized]) return normalized;

  // Try "City, ST" format (with abbreviated state)
  if (stateNorm) {
    const withState = `${normalized}, ${stateNorm}`;
    if (CITY_ALIASES[withState]) return CITY_ALIASES[withState];
  }

  // Try city name only
  if (CITY_ALIASES[normalized]) return CITY_ALIASES[normalized];

  // Try slugified version
  const slugified = normalized.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (CITY_MAPPING[slugified]) return slugified;

  // Suburb fallback: check if this city is a known suburb of a metro hub
  if (SUBURB_FALLBACKS[normalized]) return SUBURB_FALLBACKS[normalized];

  // Fuzzy: check if any city name starts with the input
  for (const [alias, slug] of Object.entries(CITY_ALIASES)) {
    if (alias.startsWith(normalized) || normalized.startsWith(alias)) {
      return slug;
    }
  }

  return null;
}

// ══════════════════════════════════════════════════════════════
//  matchService — Find best service catalog match from title/description
// ══════════════════════════════════════════════════════════════

function matchService(text, category) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;

  for (const [id, service] of Object.entries(SERVICE_CATALOG)) {
    // Category filter: if category provided, only match same category
    if (category && service.category !== category) continue;

    let score = 0;

    // Check each keyword against the input text
    for (const kw of service.keywords) {
      const kwLower = kw.toLowerCase();
      if (lower.includes(kwLower)) {
        // Exact phrase match scores higher for longer keywords
        score += kwLower.split(/\s+/).length * 10;
      }
    }

    // Check service name directly
    if (lower.includes(service.name.toLowerCase())) {
      score += 50; // Strong bonus for exact name match
    }

    // Check individual words against keywords
    for (const word of words) {
      if (word.length < 3) continue; // Skip short words
      for (const kw of service.keywords) {
        if (kw.toLowerCase().split(/\s+/).includes(word)) {
          score += 3;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = service;
    }
  }

  // Require minimum confidence threshold
  return bestScore >= 10 ? bestMatch : null;
}

// ══════════════════════════════════════════════════════════════
//  calculateEstimate — Core pricing engine
// ══════════════════════════════════════════════════════════════

function calculateEstimate(serviceId, citySlug) {
  const service = SERVICE_CATALOG[serviceId];
  if (!service) return null;

  const wages = LABOR_RATES[citySlug] || LABOR_RATES._national;
  const rpp = PRICE_PARITIES[citySlug] || PRICE_PARITIES._national;
  const cityInfo = CITY_MAPPING[citySlug] || null;

  const localRate = wages[service.occupation] || LABOR_RATES._national[service.occupation];
  if (!localRate) return null;

  const materialMultiplier = (rpp.all || 100) / 100;

  // Calculate for each tier
  const tiers = {};
  for (const tier of ['budget', 'mid_range', 'premium']) {
    const laborHours = service.labor_hours[tier];
    const laborCost = localRate * laborHours;

    const matLow = service.materials[tier].low;
    const matHigh = service.materials[tier].high;
    const matAvg = (matLow + matHigh) / 2;
    const materialCost = matAvg * materialMultiplier;

    const subtotal = laborCost + materialCost;
    const fees = subtotal * service.shop_fee_pct;
    const total = subtotal + fees;

    tiers[tier] = {
      total_low:  roundTo10(total * 0.85),
      total_mid:  roundTo10(total),
      total_high: roundTo10(total * 1.20),
      labor: Math.round(laborCost),
      materials: Math.round(materialCost),
      fees: Math.round(fees),
      labor_rate: localRate,
      labor_hours: laborHours
    };
  }

  // National comparison
  const nationalRate = LABOR_RATES._national[service.occupation];
  const localVsNational = nationalRate ? ((localRate - nationalRate) / nationalRate * 100).toFixed(0) : '0';

  // Build confidence
  const confidence = calculateConfidence(service, citySlug, wages, rpp);

  return {
    serviceId: service.id,
    serviceName: service.name,
    tiers,
    localLaborRate: localRate,
    nationalLaborRate: nationalRate,
    occupation: service.occupation,
    socCode: service.bls_soc_code,
    cityComparison: localVsNational,
    rpp: rpp.all,
    costBreakdown: service.cost_breakdown,
    sources: [
      `BLS OEWS ${cityInfo ? cityInfo.bls_metro_name : 'National'} SOC ${service.bls_soc_code}`,
      `BEA RPP ${cityInfo ? cityInfo.display : 'National'} (${rpp.all})`
    ],
    dataYear: "May 2024 (BLS) / 2023 (BEA)",
    confidence
  };
}

// ══════════════════════════════════════════════════════════════
//  calculateConfidence — Point-based scoring system
// ══════════════════════════════════════════════════════════════

function calculateConfidence(service, citySlug, wages, rpp) {
  let score = 0;
  const factors = service.confidence_factors || {};

  // +30: Has BLS SOC match for this metro area
  if (citySlug && wages[service.occupation]) {
    score += (factors.bls_match || 30);
  } else if (LABOR_RATES._national[service.occupation]) {
    score += Math.round((factors.bls_match || 30) * 0.5); // Half credit for national
  }

  // +20: Has BEA RPP data for this metro area
  if (citySlug && rpp && rpp.all) {
    score += (factors.bea_data || 20);
  }

  // +20: Service scope is well-defined (from service data)
  score += (factors.scope_defined || 0);

  // +15: Common service (high frequency)
  score += (factors.common_service || 0);

  // +15: Materials cost is predictable
  score += (factors.predictable_materials || 0);

  // Determine level
  let level, label, message;
  const cityDisplay = CITY_MAPPING[citySlug]?.display || 'your area';

  if (score >= 80) {
    level = 'high';
    label = 'High Confidence';
    message = `Based on BLS labor data for ${cityDisplay} and verified material costs`;
  } else if (score >= 50) {
    level = 'medium';
    label = 'Good Estimate';
    message = `Based on regional data. Actual cost depends on project scope.`;
  } else {
    level = 'low';
    label = 'Ballpark Range';
    message = `This service varies widely. Get 3+ quotes for your specific project.`;
  }

  return { score, level, label, message };
}

// ══════════════════════════════════════════════════════════════
//  Utility
// ══════════════════════════════════════════════════════════════

function roundTo10(n) {
  return Math.round(n / 10) * 10;
}

// ══════════════════════════════════════════════════════════════
//  Exports
// ══════════════════════════════════════════════════════════════

module.exports = {
  matchCity,
  matchService,
  calculateEstimate,
  calculateConfidence,
  SERVICE_CATALOG,
  LABOR_RATES,
  PRICE_PARITIES,
  CITY_MAPPING
};
