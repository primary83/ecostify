#!/usr/bin/env node
/* ============================================================
   Ecostify — City Service Page Generator (Batches 10-19)
   Generates 1,700 static HTML pages: 100 cities × 16 services
   + 100 city index pages = 1,700 pages total
   Uses BLS OEWS wage data + BEA RPP cost-of-living multipliers
   ============================================================ */

const fs = require('fs');
const path = require('path');

// ── Existing cities (for cross-linking) ─────────────────────
const EXISTING_CITIES = [
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

// ── 100 NEW CITIES (Batches 10-19) ──────────────────────────
const NEW_CITIES = [
    // Batch 10 — Midwest & Great Lakes
    { slug: 'toledo',          name: 'Toledo',          state: 'OH', metro: 'Toledo',                              pop: '0.6M' },
    { slug: 'ann-arbor',       name: 'Ann Arbor',       state: 'MI', metro: 'Ann Arbor',                           pop: '0.4M' },
    { slug: 'lansing',         name: 'Lansing',         state: 'MI', metro: 'Lansing-East Lansing',                 pop: '0.5M' },
    { slug: 'fort-wayne',      name: 'Fort Wayne',      state: 'IN', metro: 'Fort Wayne',                          pop: '0.4M' },
    { slug: 'south-bend',      name: 'South Bend',      state: 'IN', metro: 'South Bend-Mishawaka',                pop: '0.3M' },
    { slug: 'peoria',          name: 'Peoria',          state: 'IL', metro: 'Peoria',                              pop: '0.4M' },
    { slug: 'rockford',        name: 'Rockford',        state: 'IL', metro: 'Rockford',                            pop: '0.3M' },
    { slug: 'evansville',      name: 'Evansville',      state: 'IN', metro: 'Evansville',                          pop: '0.3M' },
    { slug: 'green-bay',       name: 'Green Bay',       state: 'WI', metro: 'Green Bay',                           pop: '0.3M' },
    { slug: 'duluth',          name: 'Duluth',          state: 'MN', metro: 'Duluth',                              pop: '0.3M' },
    // Batch 11 — South & Southeast
    { slug: 'mobile',          name: 'Mobile',          state: 'AL', metro: 'Mobile',                              pop: '0.4M' },
    { slug: 'montgomery',      name: 'Montgomery',      state: 'AL', metro: 'Montgomery',                          pop: '0.4M' },
    { slug: 'shreveport',      name: 'Shreveport',      state: 'LA', metro: 'Shreveport-Bossier City',             pop: '0.4M' },
    { slug: 'lafayette',       name: 'Lafayette',       state: 'LA', metro: 'Lafayette',                           pop: '0.5M' },
    { slug: 'macon',           name: 'Macon',           state: 'GA', metro: 'Macon-Bibb County',                   pop: '0.2M' },
    { slug: 'gainesville',     name: 'Gainesville',     state: 'FL', metro: 'Gainesville',                         pop: '0.3M' },
    { slug: 'ocala',           name: 'Ocala',           state: 'FL', metro: 'Ocala',                               pop: '0.4M' },
    { slug: 'port-st-lucie',   name: 'Port St. Lucie',  state: 'FL', metro: 'Port St. Lucie',                      pop: '0.5M' },
    { slug: 'naples',          name: 'Naples',          state: 'FL', metro: 'Naples-Marco Island',                  pop: '0.4M' },
    { slug: 'myrtle-beach',    name: 'Myrtle Beach',    state: 'SC', metro: 'Myrtle Beach-Conway-North Myrtle Beach', pop: '0.5M' },
    // Batch 12 — Texas & Southwest
    { slug: 'lubbock',         name: 'Lubbock',         state: 'TX', metro: 'Lubbock',                             pop: '0.3M' },
    { slug: 'amarillo',        name: 'Amarillo',        state: 'TX', metro: 'Amarillo',                            pop: '0.3M' },
    { slug: 'corpus-christi',  name: 'Corpus Christi',  state: 'TX', metro: 'Corpus Christi',                      pop: '0.5M' },
    { slug: 'mcallen',         name: 'McAllen',         state: 'TX', metro: 'McAllen-Edinburg-Mission',            pop: '0.9M' },
    { slug: 'brownsville',     name: 'Brownsville',     state: 'TX', metro: 'Brownsville-Harlingen',               pop: '0.4M' },
    { slug: 'laredo',          name: 'Laredo',          state: 'TX', metro: 'Laredo',                              pop: '0.3M' },
    { slug: 'midland',         name: 'Midland',         state: 'TX', metro: 'Midland',                             pop: '0.2M' },
    { slug: 'beaumont',        name: 'Beaumont',        state: 'TX', metro: 'Beaumont-Port Arthur',                pop: '0.4M' },
    { slug: 'killeen',         name: 'Killeen',         state: 'TX', metro: 'Killeen-Temple',                      pop: '0.5M' },
    { slug: 'waco',            name: 'Waco',            state: 'TX', metro: 'Waco',                                pop: '0.3M' },
    // Batch 13 — Northeast & Mid-Atlantic
    { slug: 'albany',          name: 'Albany',          state: 'NY', metro: 'Albany-Schenectady-Troy',              pop: '0.9M' },
    { slug: 'scranton',        name: 'Scranton',        state: 'PA', metro: 'Scranton-Wilkes-Barre',               pop: '0.6M' },
    { slug: 'allentown',       name: 'Allentown',       state: 'PA', metro: 'Allentown-Bethlehem-Easton',          pop: '0.8M' },
    { slug: 'reading',         name: 'Reading',         state: 'PA', metro: 'Reading',                             pop: '0.4M' },
    { slug: 'lancaster',       name: 'Lancaster',       state: 'PA', metro: 'Lancaster',                           pop: '0.6M' },
    { slug: 'new-haven',       name: 'New Haven',       state: 'CT', metro: 'New Haven-Milford',                   pop: '0.9M' },
    { slug: 'bridgeport',      name: 'Bridgeport',      state: 'CT', metro: 'Bridgeport-Stamford-Norwalk',         pop: '1.0M' },
    { slug: 'portland-me',     name: 'Portland',        state: 'ME', metro: 'Portland-South Portland',             pop: '0.5M' },
    { slug: 'burlington',      name: 'Burlington',      state: 'VT', metro: 'Burlington-South Burlington',         pop: '0.2M' },
    { slug: 'manchester',      name: 'Manchester',      state: 'NH', metro: 'Manchester-Nashua',                   pop: '0.4M' },
    // Batch 14 — Mountain West & Plains
    { slug: 'billings',        name: 'Billings',        state: 'MT', metro: 'Billings',                            pop: '0.2M' },
    { slug: 'missoula',        name: 'Missoula',        state: 'MT', metro: 'Missoula',                            pop: '0.1M' },
    { slug: 'bozeman',         name: 'Bozeman',         state: 'MT', metro: 'Bozeman',                             pop: '0.1M' },
    { slug: 'cheyenne',        name: 'Cheyenne',        state: 'WY', metro: 'Cheyenne',                            pop: '0.1M' },
    { slug: 'sioux-falls',     name: 'Sioux Falls',     state: 'SD', metro: 'Sioux Falls',                         pop: '0.3M' },
    { slug: 'fargo',           name: 'Fargo',           state: 'ND', metro: 'Fargo',                               pop: '0.3M' },
    { slug: 'rapid-city',      name: 'Rapid City',      state: 'SD', metro: 'Rapid City',                          pop: '0.2M' },
    { slug: 'lincoln',         name: 'Lincoln',         state: 'NE', metro: 'Lincoln',                             pop: '0.3M' },
    { slug: 'topeka',          name: 'Topeka',          state: 'KS', metro: 'Topeka',                              pop: '0.2M' },
    { slug: 'cedar-rapids',    name: 'Cedar Rapids',    state: 'IA', metro: 'Cedar Rapids',                        pop: '0.3M' },
    // Batch 15 — Pacific & West Coast
    { slug: 'eugene',          name: 'Eugene',          state: 'OR', metro: 'Eugene-Springfield',                   pop: '0.4M' },
    { slug: 'salem',           name: 'Salem',           state: 'OR', metro: 'Salem',                               pop: '0.4M' },
    { slug: 'medford',         name: 'Medford',         state: 'OR', metro: 'Medford',                             pop: '0.2M' },
    { slug: 'tacoma',          name: 'Tacoma',          state: 'WA', metro: 'Tacoma-Lakewood',                     pop: '0.9M' },
    { slug: 'olympia',         name: 'Olympia',         state: 'WA', metro: 'Olympia-Lacey-Tumwater',              pop: '0.3M' },
    { slug: 'bellingham',      name: 'Bellingham',      state: 'WA', metro: 'Bellingham',                          pop: '0.2M' },
    { slug: 'santa-rosa',      name: 'Santa Rosa',      state: 'CA', metro: 'Santa Rosa-Petaluma',                 pop: '0.5M' },
    { slug: 'modesto',         name: 'Modesto',         state: 'CA', metro: 'Modesto',                             pop: '0.6M' },
    { slug: 'visalia',         name: 'Visalia',         state: 'CA', metro: 'Visalia',                             pop: '0.5M' },
    { slug: 'oxnard',          name: 'Oxnard',          state: 'CA', metro: 'Oxnard-Thousand Oaks-Ventura',        pop: '0.8M' },
    // Batch 16 — Carolinas, Virginia & Tennessee
    { slug: 'durham',          name: 'Durham',          state: 'NC', metro: 'Durham-Chapel Hill',                   pop: '0.6M' },
    { slug: 'fayetteville-nc', name: 'Fayetteville',    state: 'NC', metro: 'Fayetteville',                        pop: '0.5M' },
    { slug: 'hickory',         name: 'Hickory',         state: 'NC', metro: 'Hickory-Lenoir-Morganton',            pop: '0.4M' },
    { slug: 'norfolk',         name: 'Norfolk',         state: 'VA', metro: 'Virginia Beach-Norfolk-Newport News', pop: '1.8M' },
    { slug: 'lynchburg',       name: 'Lynchburg',       state: 'VA', metro: 'Lynchburg',                           pop: '0.3M' },
    { slug: 'roanoke',         name: 'Roanoke',         state: 'VA', metro: 'Roanoke',                             pop: '0.3M' },
    { slug: 'clarksville',     name: 'Clarksville',     state: 'TN', metro: 'Clarksville',                         pop: '0.3M' },
    { slug: 'johnson-city',    name: 'Johnson City',    state: 'TN', metro: 'Johnson City',                        pop: '0.2M' },
    { slug: 'spartanburg',     name: 'Spartanburg',     state: 'SC', metro: 'Spartanburg',                         pop: '0.3M' },
    { slug: 'florence',        name: 'Florence',        state: 'SC', metro: 'Florence',                            pop: '0.2M' },
    // Batch 17 — Ohio, Kentucky, West Virginia
    { slug: 'youngstown',      name: 'Youngstown',      state: 'OH', metro: 'Youngstown-Warren-Boardman',          pop: '0.5M' },
    { slug: 'canton',          name: 'Canton',          state: 'OH', metro: 'Canton-Massillon',                    pop: '0.4M' },
    { slug: 'huntington',      name: 'Huntington',      state: 'WV', metro: 'Huntington-Ashland',                  pop: '0.3M' },
    { slug: 'charleston-wv',   name: 'Charleston',      state: 'WV', metro: 'Charleston',                          pop: '0.3M' },
    { slug: 'bowling-green',   name: 'Bowling Green',   state: 'KY', metro: 'Bowling Green',                       pop: '0.2M' },
    { slug: 'covington',       name: 'Covington',       state: 'KY', metro: 'Cincinnati-Northern Kentucky',        pop: '2.3M' },
    { slug: 'elyria',          name: 'Elyria',          state: 'OH', metro: 'Elyria',                              pop: '0.3M' },
    { slug: 'mansfield',       name: 'Mansfield',       state: 'OH', metro: 'Mansfield',                           pop: '0.1M' },
    { slug: 'springfield-oh',  name: 'Springfield',     state: 'OH', metro: 'Springfield',                         pop: '0.1M' },
    { slug: 'parkersburg',     name: 'Parkersburg',     state: 'WV', metro: 'Parkersburg-Vienna',                  pop: '0.1M' },
    // Batch 18 — Deep South, Gulf Coast & Mississippi Valley
    { slug: 'gulfport',        name: 'Gulfport',        state: 'MS', metro: 'Gulfport-Biloxi',                     pop: '0.4M' },
    { slug: 'hattiesburg',     name: 'Hattiesburg',     state: 'MS', metro: 'Hattiesburg',                         pop: '0.2M' },
    { slug: 'tuscaloosa',      name: 'Tuscaloosa',      state: 'AL', metro: 'Tuscaloosa',                          pop: '0.3M' },
    { slug: 'dothan',          name: 'Dothan',          state: 'AL', metro: 'Dothan',                              pop: '0.2M' },
    { slug: 'columbus-ga',     name: 'Columbus',        state: 'GA', metro: 'Columbus',                            pop: '0.3M' },
    { slug: 'warner-robins',   name: 'Warner Robins',   state: 'GA', metro: 'Warner Robins',                       pop: '0.2M' },
    { slug: 'lake-charles',    name: 'Lake Charles',    state: 'LA', metro: 'Lake Charles',                        pop: '0.2M' },
    { slug: 'houma',           name: 'Houma',           state: 'LA', metro: 'Houma-Thibodaux',                     pop: '0.2M' },
    { slug: 'texarkana',       name: 'Texarkana',       state: 'TX', metro: 'Texarkana',                           pop: '0.2M' },
    { slug: 'pine-bluff',      name: 'Pine Bluff',      state: 'AR', metro: 'Pine Bluff',                          pop: '0.1M' },
    // Batch 19 — Geographic Gap Fillers (Mixed)
    { slug: 'santa-fe',        name: 'Santa Fe',        state: 'NM', metro: 'Santa Fe',                            pop: '0.2M' },
    { slug: 'las-cruces',      name: 'Las Cruces',      state: 'NM', metro: 'Las Cruces',                          pop: '0.2M' },
    { slug: 'flagstaff',       name: 'Flagstaff',       state: 'AZ', metro: 'Flagstaff',                           pop: '0.1M' },
    { slug: 'prescott',        name: 'Prescott',        state: 'AZ', metro: 'Prescott Valley-Prescott',            pop: '0.2M' },
    { slug: 'st-george',       name: 'St. George',      state: 'UT', metro: 'St. George',                          pop: '0.2M' },
    { slug: 'idaho-falls',     name: 'Idaho Falls',     state: 'ID', metro: 'Idaho Falls',                         pop: '0.2M' },
    { slug: 'coeur-dalene',    name: "Coeur d'Alene",   state: 'ID', metro: "Coeur d'Alene",                       pop: '0.2M' },
    { slug: 'pueblo',          name: 'Pueblo',          state: 'CO', metro: 'Pueblo',                              pop: '0.2M' },
    { slug: 'fort-collins',    name: 'Fort Collins',    state: 'CO', metro: 'Fort Collins-Loveland',               pop: '0.4M' },
    { slug: 'bend',            name: 'Bend',            state: 'OR', metro: 'Bend',                                pop: '0.2M' },
];

const ALL_CITIES = [...EXISTING_CITIES, ...NEW_CITIES];

// ── BLS OEWS Hourly Mean Wages by Metro × Occupation ────────
// Source: BLS Occupational Employment & Wage Statistics (May 2024)
const WAGES = {
    // Batch 10 — Midwest & Great Lakes
    toledo:          { autoMech: 23.90, plumber: 30.88, electrician: 31.40, hvac: 28.36, maintenance: 24.10, roofer: 24.50, painter: 23.14, carpenter: 26.08 },
    'ann-arbor':     { autoMech: 27.30, plumber: 36.90, electrician: 38.20, hvac: 32.40, maintenance: 27.80, roofer: 28.10, painter: 25.70, carpenter: 30.60 },
    lansing:         { autoMech: 25.40, plumber: 32.80, electrician: 33.10, hvac: 29.70, maintenance: 25.50, roofer: 26.30, painter: 24.10, carpenter: 28.20 },
    'fort-wayne':    { autoMech: 24.20, plumber: 29.60, electrician: 30.40, hvac: 27.90, maintenance: 23.80, roofer: 23.90, painter: 22.10, carpenter: 25.40 },
    'south-bend':    { autoMech: 23.50, plumber: 28.10, electrician: 29.30, hvac: 26.80, maintenance: 23.10, roofer: 22.80, painter: 21.40, carpenter: 24.30 },
    peoria:          { autoMech: 24.80, plumber: 33.50, electrician: 34.20, hvac: 30.10, maintenance: 25.90, roofer: 27.10, painter: 24.80, carpenter: 28.90 },
    rockford:        { autoMech: 24.10, plumber: 31.20, electrician: 32.60, hvac: 28.50, maintenance: 24.60, roofer: 25.80, painter: 23.20, carpenter: 26.70 },
    evansville:      { autoMech: 23.70, plumber: 27.90, electrician: 28.80, hvac: 26.50, maintenance: 22.90, roofer: 22.40, painter: 21.10, carpenter: 24.10 },
    'green-bay':     { autoMech: 25.10, plumber: 33.20, electrician: 32.90, hvac: 29.80, maintenance: 25.30, roofer: 26.90, painter: 24.50, carpenter: 28.40 },
    duluth:          { autoMech: 24.60, plumber: 35.40, electrician: 34.80, hvac: 30.50, maintenance: 26.20, roofer: 27.80, painter: 25.30, carpenter: 29.70 },
    // Batch 11 — South & Southeast
    mobile:          { autoMech: 23.10, plumber: 25.80, electrician: 26.70, hvac: 25.10, maintenance: 21.90, roofer: 21.30, painter: 20.10, carpenter: 23.20 },
    montgomery:      { autoMech: 22.80, plumber: 25.40, electrician: 26.10, hvac: 24.80, maintenance: 21.60, roofer: 20.90, painter: 19.80, carpenter: 22.70 },
    shreveport:      { autoMech: 23.40, plumber: 26.20, electrician: 27.30, hvac: 25.50, maintenance: 22.30, roofer: 21.70, painter: 20.50, carpenter: 23.80 },
    lafayette:       { autoMech: 23.80, plumber: 27.10, electrician: 28.40, hvac: 26.20, maintenance: 22.80, roofer: 22.30, painter: 21.00, carpenter: 24.50 },
    macon:           { autoMech: 22.50, plumber: 24.80, electrician: 25.60, hvac: 24.20, maintenance: 21.10, roofer: 20.40, painter: 19.30, carpenter: 22.10 },
    gainesville:     { autoMech: 23.90, plumber: 25.60, electrician: 26.40, hvac: 25.30, maintenance: 22.40, roofer: 21.80, painter: 20.60, carpenter: 23.40 },
    ocala:           { autoMech: 23.20, plumber: 24.70, electrician: 25.30, hvac: 24.60, maintenance: 21.50, roofer: 21.00, painter: 19.90, carpenter: 22.40 },
    'port-st-lucie': { autoMech: 24.80, plumber: 26.30, electrician: 27.10, hvac: 25.90, maintenance: 23.20, roofer: 22.50, painter: 21.30, carpenter: 24.00 },
    naples:          { autoMech: 26.10, plumber: 27.80, electrician: 28.60, hvac: 27.40, maintenance: 24.50, roofer: 23.80, painter: 22.60, carpenter: 25.50 },
    'myrtle-beach':  { autoMech: 23.60, plumber: 25.90, electrician: 26.80, hvac: 25.40, maintenance: 22.50, roofer: 22.10, painter: 20.70, carpenter: 23.60 },
    // Batch 12 — Texas & Southwest
    lubbock:         { autoMech: 22.90, plumber: 26.80, electrician: 27.50, hvac: 25.60, maintenance: 22.10, roofer: 21.40, painter: 20.20, carpenter: 23.30 },
    amarillo:        { autoMech: 23.10, plumber: 27.30, electrician: 28.10, hvac: 26.00, maintenance: 22.50, roofer: 21.80, painter: 20.60, carpenter: 23.70 },
    'corpus-christi':{ autoMech: 23.40, plumber: 27.60, electrician: 28.40, hvac: 26.30, maintenance: 22.70, roofer: 22.10, painter: 20.80, carpenter: 24.00 },
    mcallen:         { autoMech: 21.50, plumber: 23.80, electrician: 24.60, hvac: 23.10, maintenance: 19.80, roofer: 18.90, painter: 17.80, carpenter: 20.50 },
    brownsville:     { autoMech: 21.20, plumber: 23.40, electrician: 24.10, hvac: 22.70, maintenance: 19.40, roofer: 18.50, painter: 17.40, carpenter: 20.00 },
    laredo:          { autoMech: 21.80, plumber: 24.20, electrician: 25.00, hvac: 23.50, maintenance: 20.10, roofer: 19.20, painter: 18.10, carpenter: 20.80 },
    midland:         { autoMech: 25.80, plumber: 30.40, electrician: 31.20, hvac: 28.90, maintenance: 25.10, roofer: 24.30, painter: 23.10, carpenter: 26.80 },
    beaumont:        { autoMech: 24.10, plumber: 28.90, electrician: 29.70, hvac: 27.20, maintenance: 23.60, roofer: 22.80, painter: 21.50, carpenter: 24.90 },
    killeen:         { autoMech: 22.60, plumber: 25.10, electrician: 25.80, hvac: 24.30, maintenance: 21.20, roofer: 20.50, painter: 19.40, carpenter: 22.30 },
    waco:            { autoMech: 22.90, plumber: 25.60, electrician: 26.30, hvac: 24.70, maintenance: 21.50, roofer: 20.80, painter: 19.70, carpenter: 22.60 },
    // Batch 13 — Northeast & Mid-Atlantic
    albany:          { autoMech: 25.80, plumber: 35.20, electrician: 36.40, hvac: 31.80, maintenance: 26.40, roofer: 28.90, painter: 25.80, carpenter: 30.40 },
    scranton:        { autoMech: 24.30, plumber: 30.10, electrician: 31.20, hvac: 28.40, maintenance: 24.10, roofer: 24.80, painter: 22.90, carpenter: 26.50 },
    allentown:       { autoMech: 25.10, plumber: 32.40, electrician: 33.60, hvac: 29.80, maintenance: 25.20, roofer: 26.40, painter: 24.10, carpenter: 28.30 },
    reading:         { autoMech: 24.50, plumber: 30.80, electrician: 31.90, hvac: 28.70, maintenance: 24.30, roofer: 25.10, painter: 23.20, carpenter: 26.80 },
    lancaster:       { autoMech: 24.80, plumber: 31.50, electrician: 32.70, hvac: 29.20, maintenance: 24.70, roofer: 25.60, painter: 23.60, carpenter: 27.40 },
    'new-haven':     { autoMech: 26.40, plumber: 34.80, electrician: 36.10, hvac: 33.20, maintenance: 27.30, roofer: 30.50, painter: 27.10, carpenter: 31.80 },
    bridgeport:      { autoMech: 28.90, plumber: 38.60, electrician: 40.20, hvac: 36.80, maintenance: 30.10, roofer: 33.40, painter: 29.80, carpenter: 35.20 },
    'portland-me':   { autoMech: 25.60, plumber: 30.40, electrician: 31.80, hvac: 29.10, maintenance: 25.40, roofer: 26.20, painter: 24.30, carpenter: 28.10 },
    burlington:      { autoMech: 25.20, plumber: 29.80, electrician: 31.10, hvac: 28.60, maintenance: 25.10, roofer: 25.80, painter: 23.90, carpenter: 27.60 },
    manchester:      { autoMech: 25.90, plumber: 31.20, electrician: 32.40, hvac: 29.70, maintenance: 25.80, roofer: 26.90, painter: 24.70, carpenter: 28.80 },
    // Batch 14 — Mountain West & Plains
    billings:        { autoMech: 24.40, plumber: 29.20, electrician: 30.10, hvac: 27.80, maintenance: 24.00, roofer: 24.10, painter: 22.40, carpenter: 25.80 },
    missoula:        { autoMech: 24.00, plumber: 28.60, electrician: 29.40, hvac: 27.10, maintenance: 23.50, roofer: 23.60, painter: 21.90, carpenter: 25.20 },
    bozeman:         { autoMech: 24.70, plumber: 29.90, electrician: 30.80, hvac: 28.30, maintenance: 24.40, roofer: 24.80, painter: 23.00, carpenter: 26.50 },
    cheyenne:        { autoMech: 24.10, plumber: 28.80, electrician: 29.60, hvac: 27.30, maintenance: 23.70, roofer: 23.80, painter: 22.10, carpenter: 25.40 },
    'sioux-falls':   { autoMech: 24.30, plumber: 29.40, electrician: 30.20, hvac: 27.60, maintenance: 23.90, roofer: 24.20, painter: 22.50, carpenter: 25.90 },
    fargo:           { autoMech: 24.50, plumber: 30.10, electrician: 30.90, hvac: 28.20, maintenance: 24.30, roofer: 24.60, painter: 22.80, carpenter: 26.30 },
    'rapid-city':    { autoMech: 23.80, plumber: 28.30, electrician: 29.10, hvac: 26.80, maintenance: 23.20, roofer: 23.30, painter: 21.60, carpenter: 24.90 },
    lincoln:         { autoMech: 24.20, plumber: 29.10, electrician: 29.90, hvac: 27.40, maintenance: 23.80, roofer: 24.00, painter: 22.30, carpenter: 25.70 },
    topeka:          { autoMech: 23.60, plumber: 28.80, electrician: 29.50, hvac: 27.00, maintenance: 23.30, roofer: 23.50, painter: 21.90, carpenter: 25.20 },
    'cedar-rapids':  { autoMech: 24.40, plumber: 30.20, electrician: 31.00, hvac: 28.40, maintenance: 24.20, roofer: 24.50, painter: 22.70, carpenter: 26.10 },
    // Batch 15 — Pacific & West Coast
    eugene:          { autoMech: 25.80, plumber: 32.40, electrician: 33.60, hvac: 30.10, maintenance: 25.60, roofer: 26.80, painter: 24.60, carpenter: 28.90 },
    salem:           { autoMech: 25.30, plumber: 31.60, electrician: 32.80, hvac: 29.40, maintenance: 25.10, roofer: 26.10, painter: 24.00, carpenter: 28.10 },
    medford:         { autoMech: 25.00, plumber: 30.80, electrician: 31.90, hvac: 28.80, maintenance: 24.60, roofer: 25.40, painter: 23.50, carpenter: 27.40 },
    tacoma:          { autoMech: 28.40, plumber: 37.80, electrician: 39.20, hvac: 35.60, maintenance: 29.40, roofer: 32.10, painter: 28.90, carpenter: 34.00 },
    olympia:         { autoMech: 27.10, plumber: 35.60, electrician: 36.80, hvac: 33.40, maintenance: 27.80, roofer: 30.20, painter: 27.10, carpenter: 31.80 },
    bellingham:      { autoMech: 26.80, plumber: 34.90, electrician: 36.10, hvac: 32.80, maintenance: 27.30, roofer: 29.60, painter: 26.60, carpenter: 31.20 },
    'santa-rosa':    { autoMech: 29.10, plumber: 38.40, electrician: 39.80, hvac: 36.20, maintenance: 30.20, roofer: 33.10, painter: 29.50, carpenter: 34.80 },
    modesto:         { autoMech: 27.80, plumber: 35.20, electrician: 36.60, hvac: 33.00, maintenance: 27.60, roofer: 29.80, painter: 26.80, carpenter: 31.50 },
    visalia:         { autoMech: 26.40, plumber: 33.10, electrician: 34.20, hvac: 30.80, maintenance: 25.80, roofer: 27.60, painter: 24.90, carpenter: 29.10 },
    oxnard:          { autoMech: 28.60, plumber: 37.40, electrician: 38.80, hvac: 35.20, maintenance: 29.10, roofer: 31.80, painter: 28.50, carpenter: 33.60 },
    // Batch 16 — Carolinas, Virginia & Tennessee
    durham:          { autoMech: 25.60, plumber: 27.80, electrician: 28.60, hvac: 27.10, maintenance: 24.20, roofer: 24.50, painter: 22.30, carpenter: 25.80 },
    'fayetteville-nc':{ autoMech: 23.80, plumber: 25.40, electrician: 26.20, hvac: 24.90, maintenance: 22.10, roofer: 21.60, painter: 20.30, carpenter: 23.20 },
    hickory:         { autoMech: 23.40, plumber: 25.00, electrician: 25.80, hvac: 24.50, maintenance: 21.80, roofer: 21.20, painter: 19.90, carpenter: 22.80 },
    norfolk:         { autoMech: 25.10, plumber: 27.40, electrician: 28.20, hvac: 26.80, maintenance: 23.90, roofer: 24.10, painter: 22.00, carpenter: 25.40 },
    lynchburg:       { autoMech: 23.60, plumber: 25.80, electrician: 26.60, hvac: 25.20, maintenance: 22.30, roofer: 21.80, painter: 20.50, carpenter: 23.50 },
    roanoke:         { autoMech: 24.00, plumber: 26.40, electrician: 27.20, hvac: 25.80, maintenance: 22.80, roofer: 22.30, painter: 21.00, carpenter: 24.10 },
    clarksville:     { autoMech: 23.20, plumber: 25.60, electrician: 26.40, hvac: 25.00, maintenance: 22.00, roofer: 21.40, painter: 20.10, carpenter: 23.00 },
    'johnson-city':  { autoMech: 22.90, plumber: 25.10, electrician: 25.90, hvac: 24.60, maintenance: 21.60, roofer: 20.90, painter: 19.70, carpenter: 22.50 },
    spartanburg:     { autoMech: 23.30, plumber: 25.50, electrician: 26.30, hvac: 24.90, maintenance: 22.10, roofer: 21.50, painter: 20.20, carpenter: 23.10 },
    florence:        { autoMech: 22.70, plumber: 24.80, electrician: 25.50, hvac: 24.20, maintenance: 21.30, roofer: 20.60, painter: 19.40, carpenter: 22.10 },
    // Batch 17 — Ohio, Kentucky, West Virginia
    youngstown:      { autoMech: 23.40, plumber: 28.60, electrician: 29.80, hvac: 27.10, maintenance: 23.20, roofer: 23.80, painter: 22.00, carpenter: 25.30 },
    canton:          { autoMech: 23.80, plumber: 29.10, electrician: 30.30, hvac: 27.60, maintenance: 23.60, roofer: 24.20, painter: 22.40, carpenter: 25.80 },
    huntington:      { autoMech: 22.40, plumber: 26.80, electrician: 27.60, hvac: 25.40, maintenance: 21.80, roofer: 21.10, painter: 19.80, carpenter: 22.80 },
    'charleston-wv': { autoMech: 23.10, plumber: 27.40, electrician: 28.20, hvac: 26.00, maintenance: 22.40, roofer: 21.70, painter: 20.40, carpenter: 23.40 },
    'bowling-green': { autoMech: 22.60, plumber: 26.20, electrician: 27.00, hvac: 25.10, maintenance: 21.50, roofer: 20.80, painter: 19.60, carpenter: 22.40 },
    covington:       { autoMech: 24.60, plumber: 30.80, electrician: 32.00, hvac: 29.10, maintenance: 24.80, roofer: 25.60, painter: 23.80, carpenter: 27.20 },
    elyria:          { autoMech: 24.20, plumber: 30.20, electrician: 31.40, hvac: 28.60, maintenance: 24.40, roofer: 25.10, painter: 23.30, carpenter: 26.70 },
    mansfield:       { autoMech: 23.00, plumber: 27.80, electrician: 28.60, hvac: 26.20, maintenance: 22.60, roofer: 22.00, painter: 20.60, carpenter: 23.60 },
    'springfield-oh':{ autoMech: 23.20, plumber: 28.20, electrician: 29.00, hvac: 26.60, maintenance: 22.90, roofer: 22.30, painter: 20.90, carpenter: 24.00 },
    parkersburg:     { autoMech: 22.20, plumber: 26.40, electrician: 27.20, hvac: 25.00, maintenance: 21.40, roofer: 20.60, painter: 19.40, carpenter: 22.20 },
    // Batch 18 — Deep South, Gulf Coast & Mississippi Valley
    gulfport:        { autoMech: 22.80, plumber: 25.60, electrician: 26.40, hvac: 24.80, maintenance: 21.50, roofer: 20.80, painter: 19.60, carpenter: 22.50 },
    hattiesburg:     { autoMech: 22.30, plumber: 24.90, electrician: 25.70, hvac: 24.10, maintenance: 21.00, roofer: 20.20, painter: 19.10, carpenter: 21.90 },
    tuscaloosa:      { autoMech: 23.00, plumber: 25.80, electrician: 26.60, hvac: 25.00, maintenance: 21.70, roofer: 21.10, painter: 19.90, carpenter: 22.80 },
    dothan:          { autoMech: 22.50, plumber: 24.60, electrician: 25.30, hvac: 23.90, maintenance: 20.80, roofer: 20.00, painter: 18.90, carpenter: 21.70 },
    'columbus-ga':   { autoMech: 22.90, plumber: 25.40, electrician: 26.10, hvac: 24.60, maintenance: 21.40, roofer: 20.70, painter: 19.50, carpenter: 22.40 },
    'warner-robins': { autoMech: 23.10, plumber: 25.70, electrician: 26.50, hvac: 25.00, maintenance: 21.70, roofer: 21.00, painter: 19.80, carpenter: 22.70 },
    'lake-charles':  { autoMech: 23.50, plumber: 27.20, electrician: 28.10, hvac: 26.10, maintenance: 22.60, roofer: 22.00, painter: 20.70, carpenter: 23.90 },
    houma:           { autoMech: 23.20, plumber: 26.80, electrician: 27.60, hvac: 25.70, maintenance: 22.20, roofer: 21.50, painter: 20.30, carpenter: 23.40 },
    texarkana:       { autoMech: 22.60, plumber: 25.30, electrician: 26.00, hvac: 24.40, maintenance: 21.20, roofer: 20.40, painter: 19.30, carpenter: 22.10 },
    'pine-bluff':    { autoMech: 21.80, plumber: 24.00, electrician: 24.70, hvac: 23.20, maintenance: 20.20, roofer: 19.40, painter: 18.30, carpenter: 21.00 },
    // Batch 19 — Geographic Gap Fillers
    'santa-fe':      { autoMech: 24.80, plumber: 28.40, electrician: 29.20, hvac: 27.00, maintenance: 23.60, roofer: 23.00, painter: 21.80, carpenter: 25.10 },
    'las-cruces':    { autoMech: 22.60, plumber: 25.10, electrician: 25.80, hvac: 24.20, maintenance: 20.80, roofer: 20.00, painter: 18.90, carpenter: 21.60 },
    flagstaff:       { autoMech: 25.30, plumber: 29.60, electrician: 30.40, hvac: 28.10, maintenance: 24.50, roofer: 24.80, painter: 23.00, carpenter: 26.40 },
    prescott:        { autoMech: 24.60, plumber: 28.80, electrician: 29.60, hvac: 27.30, maintenance: 23.90, roofer: 24.10, painter: 22.30, carpenter: 25.60 },
    'st-george':     { autoMech: 24.00, plumber: 28.20, electrician: 29.00, hvac: 26.70, maintenance: 23.40, roofer: 23.50, painter: 21.80, carpenter: 25.10 },
    'idaho-falls':   { autoMech: 23.80, plumber: 27.90, electrician: 28.70, hvac: 26.40, maintenance: 23.10, roofer: 23.20, painter: 21.50, carpenter: 24.70 },
    'coeur-dalene':  { autoMech: 24.30, plumber: 28.60, electrician: 29.40, hvac: 27.00, maintenance: 23.60, roofer: 23.80, painter: 22.00, carpenter: 25.30 },
    pueblo:          { autoMech: 23.40, plumber: 27.10, electrician: 27.90, hvac: 25.60, maintenance: 22.40, roofer: 22.60, painter: 21.00, carpenter: 24.10 },
    'fort-collins':  { autoMech: 25.60, plumber: 31.40, electrician: 32.20, hvac: 29.60, maintenance: 25.40, roofer: 26.20, painter: 24.10, carpenter: 28.00 },
    bend:            { autoMech: 25.90, plumber: 32.10, electrician: 33.00, hvac: 30.20, maintenance: 25.80, roofer: 26.70, painter: 24.50, carpenter: 28.60 },
};

// ── BEA Regional Price Parities (RPP) ─────────────────────
const RPP = {
    // Batch 10
    toledo: 90.8, 'ann-arbor': 98.6, lansing: 93.4, 'fort-wayne': 89.2, 'south-bend': 88.6,
    peoria: 90.1, rockford: 91.3, evansville: 87.8, 'green-bay': 92.7, duluth: 93.5,
    // Batch 11
    mobile: 89.4, montgomery: 88.7, shreveport: 88.2, lafayette: 89.1, macon: 87.3,
    gainesville: 96.2, ocala: 94.8, 'port-st-lucie': 101.8, naples: 107.4, 'myrtle-beach': 96.4,
    // Batch 12
    lubbock: 88.9, amarillo: 89.3, 'corpus-christi': 90.2, mcallen: 85.4, brownsville: 84.8,
    laredo: 85.1, midland: 96.8, beaumont: 89.7, killeen: 88.1, waco: 87.6,
    // Batch 13
    albany: 96.8, scranton: 91.4, allentown: 95.2, reading: 93.6, lancaster: 94.8,
    'new-haven': 104.6, bridgeport: 116.2, 'portland-me': 100.8, burlington: 100.2, manchester: 102.4,
    // Batch 14
    billings: 93.8, missoula: 96.2, bozeman: 102.4, cheyenne: 92.6, 'sioux-falls': 91.8,
    fargo: 91.2, 'rapid-city': 92.4, lincoln: 90.6, topeka: 89.4, 'cedar-rapids': 91.6,
    // Batch 15
    eugene: 100.4, salem: 98.6, medford: 97.8, tacoma: 112.6, olympia: 108.4,
    bellingham: 106.8, 'santa-rosa': 118.2, modesto: 105.4, visalia: 100.8, oxnard: 114.6,
    // Batch 16
    durham: 97.2, 'fayetteville-nc': 91.6, hickory: 89.8, norfolk: 96.4, lynchburg: 90.2,
    roanoke: 91.4, clarksville: 89.6, 'johnson-city': 88.4, spartanburg: 90.8, florence: 88.2,
    // Batch 17
    youngstown: 88.6, canton: 89.4, huntington: 86.8, 'charleston-wv': 88.4, 'bowling-green': 87.6,
    covington: 93.2, elyria: 91.8, mansfield: 87.2, 'springfield-oh': 87.8, parkersburg: 85.6,
    // Batch 18
    gulfport: 88.4, hattiesburg: 86.8, tuscaloosa: 88.2, dothan: 86.4, 'columbus-ga': 88.8,
    'warner-robins': 89.2, 'lake-charles': 89.6, houma: 88.8, texarkana: 86.2, 'pine-bluff': 84.6,
    // Batch 19
    'santa-fe': 101.6, 'las-cruces': 88.4, flagstaff: 100.2, prescott: 98.6, 'st-george': 96.8,
    'idaho-falls': 91.4, 'coeur-dalene': 95.2, pueblo: 89.8, 'fort-collins': 102.8, bend: 105.6,
};

// ── 16 Services (8 Auto + 8 Home) ──────────────────────────
const SERVICES = [
    { slug: 'brake-pad-replacement', name: 'Brake Pad Replacement', category: 'auto', occupation: 'autoMech', laborHoursLow: 1, laborHoursHigh: 2, partsNationalLow: 80, partsNationalHigh: 250, shortDesc: 'front and rear brake pad replacement', icon: '\u{1F527}', relatedBlog: '/blog/brake-pad-replacement-cost' },
    { slug: 'oil-change', name: 'Oil Change', category: 'auto', occupation: 'autoMech', laborHoursLow: 0.5, laborHoursHigh: 1, partsNationalLow: 25, partsNationalHigh: 90, shortDesc: 'conventional and synthetic oil change service', icon: '\u{1F6E2}\uFE0F', relatedBlog: '/blog/oil-change-cost' },
    { slug: 'car-wrap', name: 'Full Car Wrap', category: 'auto', occupation: 'autoMech', laborHoursLow: 15, laborHoursHigh: 40, partsNationalLow: 800, partsNationalHigh: 3000, shortDesc: 'full vehicle vinyl wrap', icon: '\u{1F3A8}', relatedBlog: '/blog/how-much-does-a-car-wrap-cost' },
    { slug: 'ceramic-coating', name: 'Ceramic Coating', category: 'auto', occupation: 'autoMech', laborHoursLow: 8, laborHoursHigh: 20, partsNationalLow: 100, partsNationalHigh: 500, shortDesc: 'professional ceramic coating application', icon: '\u2728', relatedBlog: '/blog/ceramic-coating-cost' },
    { slug: 'transmission-repair', name: 'Transmission Repair', category: 'auto', occupation: 'autoMech', laborHoursLow: 4, laborHoursHigh: 15, partsNationalLow: 300, partsNationalHigh: 3500, shortDesc: 'transmission diagnosis, repair, and rebuild', icon: '\u2699\uFE0F', relatedBlog: '/blog/transmission-repair-cost' },
    { slug: 'window-tinting', name: 'Window Tinting', category: 'auto', occupation: 'autoMech', laborHoursLow: 2, laborHoursHigh: 4, partsNationalLow: 80, partsNationalHigh: 400, shortDesc: 'automotive window tinting', icon: '\u{1FA9F}', relatedBlog: '/blog/window-tinting-cost' },
    { slug: 'ev-charger-installation', name: 'EV Charger Installation', category: 'auto', occupation: 'electrician', laborHoursLow: 3, laborHoursHigh: 8, partsNationalLow: 300, partsNationalHigh: 1200, shortDesc: 'Level 2 home EV charger installation', icon: '\u26A1', relatedBlog: '/blog/ev-charger-installation-cost' },
    { slug: 'ac-repair', name: 'AC Repair & Recharge', category: 'auto', occupation: 'autoMech', laborHoursLow: 1, laborHoursHigh: 4, partsNationalLow: 50, partsNationalHigh: 600, shortDesc: 'automotive AC diagnosis, repair, and recharge', icon: '\u2744\uFE0F' },
    { slug: 'kitchen-remodel', name: 'Kitchen Remodel', category: 'home', occupation: 'carpenter', laborHoursLow: 80, laborHoursHigh: 300, partsNationalLow: 5000, partsNationalHigh: 35000, shortDesc: 'partial to full kitchen remodel', icon: '\u{1F373}', relatedBlog: '/blog/kitchen-remodel-cost-guide' },
    { slug: 'bathroom-remodel', name: 'Bathroom Remodel', category: 'home', occupation: 'plumber', laborHoursLow: 40, laborHoursHigh: 160, partsNationalLow: 2000, partsNationalHigh: 15000, shortDesc: 'partial to full bathroom remodel', icon: '\u{1F6BF}', relatedBlog: '/blog/bathroom-remodel-cost' },
    { slug: 'roof-replacement', name: 'Roof Replacement', category: 'home', occupation: 'roofer', laborHoursLow: 16, laborHoursHigh: 60, partsNationalLow: 3000, partsNationalHigh: 12000, shortDesc: 'full roof replacement', icon: '\u{1F3E0}', relatedBlog: '/blog/roof-replacement-cost' },
    { slug: 'hvac-replacement', name: 'HVAC Replacement', category: 'home', occupation: 'hvac', laborHoursLow: 8, laborHoursHigh: 24, partsNationalLow: 2500, partsNationalHigh: 8000, shortDesc: 'HVAC system replacement and installation', icon: '\u{1F321}\uFE0F', relatedBlog: '/blog/hvac-replacement-cost' },
    { slug: 'interior-painting', name: 'Interior Painting', category: 'home', occupation: 'painter', laborHoursLow: 16, laborHoursHigh: 60, partsNationalLow: 200, partsNationalHigh: 1200, shortDesc: 'whole-house or multi-room interior painting', icon: '\u{1F58C}\uFE0F', relatedBlog: '/blog/interior-painting-cost' },
    { slug: 'fence-installation', name: 'Fence Installation', category: 'home', occupation: 'carpenter', laborHoursLow: 12, laborHoursHigh: 40, partsNationalLow: 800, partsNationalHigh: 5000, shortDesc: 'wood, vinyl, or chain-link fence installation', icon: '\u{1F3D7}\uFE0F', relatedBlog: '/blog/fence-installation-cost' },
    { slug: 'flooring-installation', name: 'Flooring Installation', category: 'home', occupation: 'carpenter', laborHoursLow: 16, laborHoursHigh: 50, partsNationalLow: 1000, partsNationalHigh: 8000, shortDesc: 'hardwood, LVP, tile, or carpet flooring installation', icon: '\u{1FAB5}', relatedBlog: '/blog/flooring-installation-cost' },
    { slug: 'garage-door-replacement', name: 'Garage Door Replacement', category: 'home', occupation: 'carpenter', laborHoursLow: 3, laborHoursHigh: 8, partsNationalLow: 600, partsNationalHigh: 4000, shortDesc: 'garage door replacement and opener installation', icon: '\u{1F6AA}', relatedBlog: '/blog/garage-door-replacement-cost' },
];

// ── Nearby cities map for compare table ─────────────────────
const NEARBY_MAP = {
    toledo: ['detroit', 'ann-arbor', 'columbus'], 'ann-arbor': ['detroit', 'lansing', 'toledo'],
    lansing: ['detroit', 'grand-rapids', 'ann-arbor'], 'fort-wayne': ['indianapolis', 'toledo', 'south-bend'],
    'south-bend': ['fort-wayne', 'chicago', 'lansing'], peoria: ['chicago', 'rockford', 'springfield-mo'],
    rockford: ['chicago', 'madison', 'peoria'], evansville: ['louisville', 'nashville', 'indianapolis'],
    'green-bay': ['milwaukee', 'madison', 'duluth'], duluth: ['minneapolis', 'green-bay', 'fargo'],
    mobile: ['pensacola', 'gulfport', 'montgomery'], montgomery: ['birmingham', 'mobile', 'columbus-ga'],
    shreveport: ['dallas', 'little-rock', 'texarkana'], lafayette: ['baton-rouge', 'lake-charles', 'houston'],
    macon: ['atlanta', 'augusta', 'columbus-ga'], gainesville: ['jacksonville', 'orlando', 'ocala'],
    ocala: ['gainesville', 'orlando', 'tampa'], 'port-st-lucie': ['palm-bay', 'miami', 'orlando'],
    naples: ['cape-coral', 'miami', 'sarasota'], 'myrtle-beach': ['wilmington-nc', 'charleston', 'florence'],
    lubbock: ['amarillo', 'midland', 'el-paso'], amarillo: ['lubbock', 'oklahoma-city', 'midland'],
    'corpus-christi': ['san-antonio', 'mcallen', 'houston'], mcallen: ['brownsville', 'corpus-christi', 'laredo'],
    brownsville: ['mcallen', 'laredo', 'corpus-christi'], laredo: ['mcallen', 'san-antonio', 'brownsville'],
    midland: ['lubbock', 'el-paso', 'amarillo'], beaumont: ['houston', 'lake-charles', 'baton-rouge'],
    killeen: ['austin', 'waco', 'san-antonio'], waco: ['austin', 'killeen', 'dallas'],
    albany: ['syracuse', 'hartford', 'new-york'], scranton: ['allentown', 'harrisburg', 'new-york'],
    allentown: ['reading', 'philadelphia', 'scranton'], reading: ['allentown', 'lancaster', 'harrisburg'],
    lancaster: ['harrisburg', 'reading', 'philadelphia'], 'new-haven': ['bridgeport', 'hartford', 'new-york'],
    bridgeport: ['new-haven', 'new-york', 'hartford'], 'portland-me': ['manchester', 'burlington', 'portland'],
    burlington: ['portland-me', 'albany', 'manchester'], manchester: ['portland-me', 'burlington', 'hartford'],
    billings: ['missoula', 'bozeman', 'rapid-city'], missoula: ['bozeman', 'billings', 'spokane'],
    bozeman: ['billings', 'missoula', 'idaho-falls'], cheyenne: ['denver', 'fort-collins', 'lincoln'],
    'sioux-falls': ['fargo', 'omaha', 'des-moines'], fargo: ['sioux-falls', 'duluth', 'minneapolis'],
    'rapid-city': ['billings', 'sioux-falls', 'cheyenne'], lincoln: ['omaha', 'des-moines', 'topeka'],
    topeka: ['kansas-city', 'wichita', 'lincoln'], 'cedar-rapids': ['des-moines', 'madison', 'peoria'],
    eugene: ['salem', 'portland', 'medford'], salem: ['portland', 'eugene', 'olympia'],
    medford: ['eugene', 'salem', 'bend'], tacoma: ['seattle', 'olympia', 'portland'],
    olympia: ['tacoma', 'seattle', 'salem'], bellingham: ['seattle', 'tacoma', 'spokane'],
    'santa-rosa': ['san-francisco', 'sacramento', 'modesto'], modesto: ['stockton', 'fresno', 'sacramento'],
    visalia: ['fresno', 'bakersfield', 'modesto'], oxnard: ['los-angeles', 'santa-rosa', 'san-diego'],
    durham: ['raleigh', 'greensboro', 'charlotte'], 'fayetteville-nc': ['raleigh', 'wilmington-nc', 'durham'],
    hickory: ['charlotte', 'asheville', 'greenville'], norfolk: ['virginia-beach', 'richmond', 'raleigh'],
    lynchburg: ['roanoke', 'richmond', 'charlottesville' /* fallback */ ], roanoke: ['lynchburg', 'richmond', 'charleston-wv'],
    clarksville: ['nashville', 'memphis', 'evansville'], 'johnson-city': ['knoxville', 'asheville', 'chattanooga'],
    spartanburg: ['greenville', 'charlotte', 'asheville'], florence: ['myrtle-beach', 'fayetteville-nc', 'columbia'],
    youngstown: ['akron', 'pittsburgh', 'canton'], canton: ['akron', 'youngstown', 'columbus'],
    huntington: ['charleston-wv', 'lexington', 'columbus'], 'charleston-wv': ['huntington', 'lexington', 'roanoke'],
    'bowling-green': ['nashville', 'louisville', 'evansville'], covington: ['cincinnati', 'lexington', 'louisville'],
    elyria: ['akron', 'toledo', 'columbus'], mansfield: ['columbus', 'akron', 'canton'],
    'springfield-oh': ['dayton', 'columbus', 'cincinnati'], parkersburg: ['charleston-wv', 'huntington', 'columbus'],
    gulfport: ['mobile', 'hattiesburg', 'new-orleans'], hattiesburg: ['gulfport', 'jackson', 'mobile'],
    tuscaloosa: ['birmingham', 'montgomery', 'columbus-ga'], dothan: ['montgomery', 'columbus-ga', 'tallahassee'],
    'columbus-ga': ['macon', 'montgomery', 'atlanta'], 'warner-robins': ['macon', 'atlanta', 'augusta'],
    'lake-charles': ['beaumont', 'lafayette', 'houston'], houma: ['new-orleans', 'baton-rouge', 'lafayette'],
    texarkana: ['shreveport', 'little-rock', 'dallas'], 'pine-bluff': ['little-rock', 'memphis', 'jackson'],
    'santa-fe': ['albuquerque', 'las-cruces', 'el-paso'], 'las-cruces': ['el-paso', 'albuquerque', 'tucson'],
    flagstaff: ['phoenix', 'prescott', 'albuquerque'], prescott: ['phoenix', 'flagstaff', 'tucson'],
    'st-george': ['las-vegas', 'provo', 'salt-lake-city'], 'idaho-falls': ['boise', 'provo', 'salt-lake-city'],
    'coeur-dalene': ['spokane', 'boise', 'missoula'], pueblo: ['colorado-springs', 'denver', 'albuquerque'],
    'fort-collins': ['denver', 'cheyenne', 'colorado-springs'], bend: ['eugene', 'medford', 'portland'],
};

// ── Cost Calculation Engine ─────────────────────────────────
function calculateCosts(service, citySlug) {
    const wages = WAGES[citySlug];
    const rpp = RPP[citySlug] / 100;
    const hourlyWage = wages[service.occupation];
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
        hourlyWage, rpp: RPP[citySlug],
        laborCostLow: round10(laborCostLow), laborCostHigh: round10(laborCostHigh),
        partsCostLow: round10(partsCostLow), partsCostHigh: round10(partsCostHigh),
        budgetLow: round10(budgetLow), budgetHigh: round10(budgetHigh),
        midLow: round10(midLow), midHigh: round10(midHigh),
        premiumLow: round10(premiumLow), premiumHigh: round10(premiumHigh),
    };
}

// ── Shared HTML fragments ───────────────────────────────────
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

// ── Content generation ──────────────────────────────────────
function generateContentSections(service, city, costs) {
    const { name: svcName, category, shortDesc } = service;
    const { name: cityName, state, metro } = city;
    const loc = `${cityName}, ${state}`;
    const rpp = RPP[city.slug];
    const rppLabel = rpp > 103 ? 'above the national average' : rpp < 97 ? 'below the national average' : 'close to the national average';
    let s = '';
    s += `<p>If you live in the ${metro} metro area and need ${shortDesc}, understanding local pricing before you call a shop can save you hundreds of dollars. Labor rates, material costs, and demand all vary by region, and ${cityName} has its own pricing dynamics shaped by the local economy and cost of living.</p>\n\n`;
    s += `<p>Based on current labor rates and material costs in ${loc}, here is what you can expect to pay for ${shortDesc.replace(/^(a |an )/, '')} in 2026.</p>\n\n`;
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
    if (category === 'auto') {
        s += `<p><strong>Shop type matters.</strong> Dealerships in ${cityName} typically charge 30 to 60 percent more than independent mechanics for the same service. National chains like Midas, Pep Boys, and Firestone fall somewhere in between. For most routine ${shortDesc}, an independent shop with strong reviews offers the best value.</p>\n\n`;
        s += `<p><strong>Vehicle make and model.</strong> Luxury and European vehicles cost significantly more to service than economy brands. A ${svcName.toLowerCase()} on a BMW X5 or Mercedes GLE in ${cityName} can cost twice what the same job costs on a Honda CR-V or Toyota Camry.</p>\n\n`;
        s += `<p><strong>Parts quality.</strong> OEM parts cost more than aftermarket alternatives but ensure factory-spec fitment. High-quality aftermarket brands often deliver comparable performance at 20 to 40 percent less.</p>\n\n`;
    } else {
        s += `<p><strong>Contractor experience and licensing.</strong> Licensed, insured contractors in ${cityName} charge more than unlicensed handymen, but they offer permits, warranties, and accountability. For major ${shortDesc}, always verify that your contractor holds a valid ${state} license.</p>\n\n`;
        s += `<p><strong>Material quality tiers.</strong> The gap between budget and premium materials is often larger than the gap in labor costs. Choosing mid-range materials is usually the best balance of quality and value for most ${cityName} homeowners.</p>\n\n`;
        s += `<p><strong>Project scope and home size.</strong> A small-scale project can cost a fraction of a full-scale renovation. The estimates above cover typical residential projects in the ${metro} area, but your actual cost depends on the specific scope of work.</p>\n\n`;
    }
    s += `<p><strong>Neighborhood and demand.</strong> Shops and contractors in higher-income areas of ${cityName} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>\n\n`;
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

// ── Compare cities table ────────────────────────────────────
function generateCompareTable(service, city, costs) {
    const nearby = NEARBY_MAP[city.slug] || [];
    const comparisons = [];
    for (const slug of nearby) {
        if (WAGES[slug]) {
            const nc = calculateCosts(service, slug);
            const ncCity = ALL_CITIES.find(c => c.slug === slug) || NEW_CITIES.find(c => c.slug === slug);
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

// ── Cross-links ─────────────────────────────────────────────
function generateCrossLinks(service, city) {
    const otherServices = SERVICES.filter(s => s.slug !== service.slug).map(s =>
        `<a href="/cost/${city.slug}/${s.slug}">${s.name}</a>`
    ).join(' ');
    const topCities = ['houston', 'los-angeles', 'chicago', 'phoenix', 'philadelphia', 'dallas', 'new-york', 'san-antonio'];
    const otherCities = topCities.filter(c => c !== city.slug).slice(0, 8).map(slug => {
        const c = EXISTING_CITIES.find(x => x.slug === slug);
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

// ── Related services & other cities for body links ──────────
function getRelatedServices(service, city) {
    return SERVICES.filter(s => s.slug !== service.slug && s.category === service.category).slice(0, 4)
        .map(s => `                    <li><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name} Cost in ${city.name}</a></li>`).join('\n');
}
function getOtherCities(service, city) {
    const idx = NEW_CITIES.findIndex(c => c.slug === city.slug);
    const pool = EXISTING_CITIES.slice(0, 20);
    return [pool[idx % pool.length], pool[(idx+3) % pool.length], pool[(idx+7) % pool.length], pool[(idx+11) % pool.length], pool[(idx+15) % pool.length]]
        .filter(c => c.slug !== city.slug)
        .map(c => `                    <li><a href="/cost/${c.slug}/${service.slug}">${service.name} Cost in ${c.name}, ${c.state}</a></li>`).join('\n');
}

// ── Service Page Template ───────────────────────────────────
function generateHTML(service, city, costs) {
    const loc = `${city.name}, ${city.state}`;
    const title = `${service.name} Cost in ${loc} (2026 Prices) | Ecostify`;
    const desc = `${service.name} in ${loc} costs $${costs.budgetLow.toLocaleString()} to $${costs.premiumHigh.toLocaleString()} in 2026. See local labor rates, material costs, and tips to save. Data from BLS and BEA.`;
    const canonical = `https://www.ecostify.com/cost/${city.slug}/${service.slug}`;
    const badge = `${service.category === 'auto' ? 'Auto' : 'Home'} &middot; ${loc}`;
    const content = generateContentSections(service, city, costs);
    const blogLink = service.relatedBlog ? `<p>For a deeper dive into national pricing trends, read our full <a href="${service.relatedBlog}">${service.name} cost guide</a>.</p>` : '';
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
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://www.ecostify.com/images/og-image.png">
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Article","headline":"${service.name} Cost in ${loc} — 2026 Pricing Guide","description":"${desc}","datePublished":"2026-03-01","dateModified":"2026-03-01","author":{"@type":"Person","name":"Ecostify Editorial","url":"https://www.ecostify.com/about"},"publisher":{"@type":"Organization","name":"Ecostify","url":"https://www.ecostify.com"}}
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
                ${blogLink}

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

// ── City Index Page ─────────────────────────────────────────
function generateCityIndexPage(city) {
    const loc = `${city.name}, ${city.state}`;
    const autoServices = SERVICES.filter(s => s.category === 'auto');
    const homeServices = SERVICES.filter(s => s.category === 'home');
    const renderServiceRow = (s) => {
        const costs = calculateCosts(s, city.slug);
        return `\n                    <div class="cost-row">\n                        <span><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}</a></span>\n                        <span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span>\n                    </div>`;
    };
    const itemListJson = JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":`Auto & Home Service Costs in ${loc}`,"url":`https://www.ecostify.com/cost/${city.slug}/`,"numberOfItems":16,"itemListElement":SERVICES.map((s,i)=>({"@type":"ListItem","position":i+1,"name":`${s.name} Cost in ${city.name}`,"url":`https://www.ecostify.com/cost/${city.slug}/${s.slug}`}))});
    const breadcrumbJson = JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.ecostify.com/"},{"@type":"ListItem","position":2,"name":"Cost Guides","item":"https://www.ecostify.com/cost/"},{"@type":"ListItem","position":3,"name":loc}]});

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="theme-color" content="#1B2A3D">
    <title>Auto &amp; Home Service Costs in ${loc} (2026) | Ecostify</title>
    <meta name="description" content="Compare costs for 16 auto and home services in ${loc}. Local pricing based on BLS wages and BEA cost-of-living data for the ${city.metro} metro area.">
    <link rel="canonical" href="https://www.ecostify.com/cost/${city.slug}/">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.ecostify.com/cost/${city.slug}/">
    <meta property="og:title" content="Auto &amp; Home Service Costs in ${loc} (2026) | Ecostify">
    <meta property="og:description" content="16 services priced for ${city.metro}. BLS wage data + BEA cost-of-living.">
    <meta property="og:site_name" content="Ecostify">
    <meta property="og:image" content="https://www.ecostify.com/images/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://www.ecostify.com/images/og-image.png">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/global-light.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FCVYRYEKNX"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FCVYRYEKNX');</script>
    <script type="application/ld+json">
    ${itemListJson}
    </script>
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
                All cities
            </a>
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <a href="/cost/">Cost Guides</a>
                <span class="breadcrumb-sep">&rsaquo;</span>
                <span class="breadcrumb-current">${loc}</span>
            </nav>
            <div class="article-header">
                <h1>Auto &amp; Home Service Costs in ${loc}</h1>
                <p class="article-meta">${city.metro} metro area &middot; Pop. ${city.pop} &middot; RPP: ${RPP[city.slug]} &middot; Updated March 2026</p>
            </div>
            <div class="last-updated-badge">Last Updated: March 2026</div>
            <div class="article-body">

                <p>Here is what you can expect to pay for common auto and home services in the ${city.metro} metro area in 2026. All estimates are based on local BLS wage data and BEA Regional Price Parities.</p>

                <h2>Auto Services in ${city.name}</h2>

                <div class="cost-table">${autoServices.map(renderServiceRow).join('')}
                </div>
<div class="inline-cta">
    <a href="/" class="btn btn-accent">Get a Free Estimate &rarr;</a>
    <span class="inline-cta-sub">AI-powered &middot; No account needed &middot; Always free</span>
</div>

                <h2>Home Services in ${city.name}</h2>

                <div class="cost-table">${homeServices.map(renderServiceRow).join('')}
                </div>

                <div class="article-cta">
                    <h3>Get a Personalized Estimate for ${city.name}</h3>
                    <p>These are typical ranges. Upload a photo or describe your specific project to get an AI-powered estimate calibrated to ${loc} pricing.</p>
                    <a href="/" class="btn">Get Your Estimate &rarr;</a>
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

// ── Main Build ──────────────────────────────────────────────
function build() {
    const baseDir = path.join(__dirname, 'cost');
    let pageCount = 0;

    console.log('Ecostify City Page Generator — Batches 10-19');
    console.log(`${NEW_CITIES.length} cities x ${SERVICES.length} services = ${NEW_CITIES.length * SERVICES.length} service pages + ${NEW_CITIES.length} city index pages\n`);

    // Generate pages
    NEW_CITIES.forEach(city => {
        const cityDir = path.join(baseDir, city.slug);
        if (!fs.existsSync(cityDir)) fs.mkdirSync(cityDir, { recursive: true });

        fs.writeFileSync(path.join(cityDir, 'index.html'), generateCityIndexPage(city));
        pageCount++;

        SERVICES.forEach(service => {
            const costs = calculateCosts(service, city.slug);
            fs.writeFileSync(path.join(cityDir, `${service.slug}.html`), generateHTML(service, city, costs));
            pageCount++;
        });
        console.log(`  ${city.name}, ${city.state} — ${SERVICES.length} service pages + index`);
    });

    // Update /cost/index.html with new city cards
    console.log('\nUpdating /cost/index.html...');
    const costIndexPath = path.join(baseDir, 'index.html');
    let costIndexHTML = fs.readFileSync(costIndexPath, 'utf8');

    const newCityCards = NEW_CITIES.map(city => {
        const cityServices = SERVICES.slice(0, 4).map(s => {
            const costs = calculateCosts(s, city.slug);
            return `<li><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}: $${costs.budgetLow.toLocaleString()}&ndash;$${costs.premiumHigh.toLocaleString()}</a></li>`;
        }).join('\n                        ');
        return `
                <div class="city-card">
                    <h3><a href="/cost/${city.slug}/">${city.name}, ${city.state}</a></h3>
                    <p class="city-meta">${city.metro} &middot; Pop. ${city.pop}</p>
                    <ul class="city-services">
                        ${cityServices}
                    </ul>
                    <a href="/cost/${city.slug}/" class="city-view-all">View all 16 services &rarr;</a>
                </div>`;
    }).join('\n');

    costIndexHTML = costIndexHTML.replace(
        '                </div>\n            </div>\n        </div>\n    </article>',
        newCityCards + '\n                </div>\n            </div>\n        </div>\n    </article>'
    );
    costIndexHTML = costIndexHTML.replace(/across 100 major US metro areas/g, 'across 200 major US metro areas');

    fs.writeFileSync(costIndexPath, costIndexHTML);
    console.log('Updated /cost/index.html with 100 new city cards');

    // Update sitemap.xml
    console.log('\nUpdating sitemap.xml...');
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    let newEntries = '';
    NEW_CITIES.forEach(city => {
        newEntries += `  <url>\n    <loc>https://www.ecostify.com/cost/${city.slug}/</loc>\n    <lastmod>2026-03-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        SERVICES.forEach(s => {
            newEntries += `  <url>\n    <loc>https://www.ecostify.com/cost/${city.slug}/${s.slug}</loc>\n    <lastmod>2026-03-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });
    });
    sitemap = sitemap.replace('</urlset>', newEntries + '</urlset>');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`Added ${NEW_CITIES.length * 17} URLs to sitemap.xml`);

    console.log(`\nDone! Generated ${pageCount} pages total.`);
}

build();
