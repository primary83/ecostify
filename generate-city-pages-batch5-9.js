#!/usr/bin/env node
/* ============================================================
   Ecostify — City Service Page Generator (Batches 5-9)
   Generates 850 static HTML pages: 50 cities × 16 services
   + 50 city index pages = 850 pages total
   Uses BLS OEWS wage data + BEA RPP cost-of-living multipliers
   Formula: (Local Hourly Wage × Labor Hours) + (National Avg Parts × RPP Multiplier)
   ============================================================ */

const fs = require('fs');
const path = require('path');

// ── Batch 1 cities (for cross-linking) ──────────────────────
const BATCH1_CITIES = [
    { slug: 'houston',        name: 'Houston',        state: 'TX' },
    { slug: 'los-angeles',    name: 'Los Angeles',    state: 'CA' },
    { slug: 'chicago',        name: 'Chicago',        state: 'IL' },
    { slug: 'phoenix',        name: 'Phoenix',        state: 'AZ' },
    { slug: 'philadelphia',   name: 'Philadelphia',   state: 'PA' },
    { slug: 'san-antonio',    name: 'San Antonio',    state: 'TX' },
    { slug: 'dallas',         name: 'Dallas',         state: 'TX' },
    { slug: 'san-diego',      name: 'San Diego',      state: 'CA' },
    { slug: 'denver',         name: 'Denver',         state: 'CO' },
    { slug: 'miami',          name: 'Miami',          state: 'FL' },
];

// ── Batch 2 cities (for cross-linking) ──────────────────────
const BATCH2_CITIES = [
    { slug: 'new-york',       name: 'New York',       state: 'NY' },
    { slug: 'atlanta',        name: 'Atlanta',        state: 'GA' },
    { slug: 'seattle',        name: 'Seattle',        state: 'WA' },
    { slug: 'tampa',          name: 'Tampa',          state: 'FL' },
    { slug: 'minneapolis',    name: 'Minneapolis',    state: 'MN' },
    { slug: 'charlotte',      name: 'Charlotte',      state: 'NC' },
    { slug: 'las-vegas',      name: 'Las Vegas',      state: 'NV' },
    { slug: 'austin',         name: 'Austin',         state: 'TX' },
    { slug: 'nashville',      name: 'Nashville',      state: 'TN' },
    { slug: 'portland',       name: 'Portland',       state: 'OR' },
];

// ── Batch 3 cities (for cross-linking) ──────────────────────
const BATCH3_CITIES = [
    { slug: 'san-jose',       name: 'San Jose',       state: 'CA' },
    { slug: 'jacksonville',   name: 'Jacksonville',   state: 'FL' },
    { slug: 'indianapolis',   name: 'Indianapolis',   state: 'IN' },
    { slug: 'columbus',       name: 'Columbus',       state: 'OH' },
    { slug: 'san-francisco',  name: 'San Francisco',  state: 'CA' },
];

// ── Batch 4 cities (for cross-linking) ──────────────────────
const BATCH4_CITIES = [
    { slug: 'detroit',           name: 'Detroit',           state: 'MI' },
    { slug: 'baltimore',         name: 'Baltimore',         state: 'MD' },
    { slug: 'memphis',           name: 'Memphis',           state: 'TN' },
    { slug: 'louisville',        name: 'Louisville',        state: 'KY' },
    { slug: 'milwaukee',         name: 'Milwaukee',         state: 'WI' },
    { slug: 'oklahoma-city',     name: 'Oklahoma City',     state: 'OK' },
    { slug: 'tucson',            name: 'Tucson',            state: 'AZ' },
    { slug: 'raleigh',           name: 'Raleigh',           state: 'NC' },
    { slug: 'kansas-city',       name: 'Kansas City',       state: 'MO' },
    { slug: 'sacramento',        name: 'Sacramento',        state: 'CA' },
    { slug: 'mesa',              name: 'Mesa',              state: 'AZ' },
    { slug: 'omaha',             name: 'Omaha',             state: 'NE' },
    { slug: 'colorado-springs',  name: 'Colorado Springs',  state: 'CO' },
    { slug: 'virginia-beach',    name: 'Virginia Beach',    state: 'VA' },
    { slug: 'marietta',          name: 'Marietta',          state: 'GA' },
    { slug: 'orlando',           name: 'Orlando',           state: 'FL' },
    { slug: 'fort-worth',        name: 'Fort Worth',        state: 'TX' },
    { slug: 'arlington',         name: 'Arlington',         state: 'TX' },
    { slug: 'new-orleans',       name: 'New Orleans',       state: 'LA' },
    { slug: 'bakersfield',       name: 'Bakersfield',       state: 'CA' },
    { slug: 'honolulu',          name: 'Honolulu',          state: 'HI' },
    { slug: 'albuquerque',       name: 'Albuquerque',       state: 'NM' },
    { slug: 'pittsburgh',        name: 'Pittsburgh',        state: 'PA' },
    { slug: 'cincinnati',        name: 'Cincinnati',        state: 'OH' },
    { slug: 'st-louis',          name: 'St. Louis',         state: 'MO' },
];

// ── Batch 5: 10 new cities ──────────────────────────────────
const BATCH5_CITIES = [
    { slug: 'richmond',       name: 'Richmond',       state: 'VA', metro: 'Richmond',                           pop: '1.3M' },
    { slug: 'salt-lake-city', name: 'Salt Lake City', state: 'UT', metro: 'Salt Lake City-Murray',              pop: '1.2M' },
    { slug: 'birmingham',     name: 'Birmingham',     state: 'AL', metro: 'Birmingham-Hoover',                  pop: '1.1M' },
    { slug: 'wichita',        name: 'Wichita',        state: 'KS', metro: 'Wichita',                            pop: '0.6M' },
    { slug: 'madison',        name: 'Madison',        state: 'WI', metro: 'Madison',                            pop: '0.7M' },
    { slug: 'baton-rouge',    name: 'Baton Rouge',    state: 'LA', metro: 'Baton Rouge',                        pop: '0.9M' },
    { slug: 'grand-rapids',   name: 'Grand Rapids',   state: 'MI', metro: 'Grand Rapids-Wyoming-Kentwood',      pop: '1.1M' },
    { slug: 'columbia',       name: 'Columbia',        state: 'SC', metro: 'Columbia',                           pop: '0.8M' },
    { slug: 'hartford',       name: 'Hartford',       state: 'CT', metro: 'Hartford-West Hartford-East Hartford', pop: '1.2M' },
    { slug: 'buffalo',        name: 'Buffalo',        state: 'NY', metro: 'Buffalo-Cheektowaga',                pop: '1.2M' },
];

// ── Batch 6: 10 new cities ──────────────────────────────────
const BATCH6_CITIES = [
    { slug: 'huntsville',     name: 'Huntsville',     state: 'AL', metro: 'Huntsville',                         pop: '0.5M' },
    { slug: 'akron',          name: 'Akron',          state: 'OH', metro: 'Akron',                              pop: '0.7M' },
    { slug: 'rochester',      name: 'Rochester',      state: 'NY', metro: 'Rochester',                          pop: '1.1M' },
    { slug: 'providence',     name: 'Providence',     state: 'RI', metro: 'Providence-Warwick',                 pop: '1.6M' },
    { slug: 'worcester',      name: 'Worcester',      state: 'MA', metro: 'Worcester',                          pop: '0.9M' },
    { slug: 'knoxville',      name: 'Knoxville',      state: 'TN', metro: 'Knoxville',                          pop: '0.9M' },
    { slug: 'boise',          name: 'Boise',          state: 'ID', metro: 'Boise City',                         pop: '0.8M' },
    { slug: 'greensboro',     name: 'Greensboro',     state: 'NC', metro: 'Greensboro-High Point',              pop: '0.8M' },
    { slug: 'tulsa',          name: 'Tulsa',          state: 'OK', metro: 'Tulsa',                              pop: '1.0M' },
    { slug: 'dayton',         name: 'Dayton',         state: 'OH', metro: 'Dayton-Kettering-Beavercreek',       pop: '0.8M' },
];

// ── Batch 7: 10 new cities ──────────────────────────────────
const BATCH7_CITIES = [
    { slug: 'el-paso',        name: 'El Paso',        state: 'TX', metro: 'El Paso',                            pop: '0.9M' },
    { slug: 'ogden',          name: 'Ogden',          state: 'UT', metro: 'Ogden-Clearfield',                   pop: '0.7M' },
    { slug: 'fresno',         name: 'Fresno',         state: 'CA', metro: 'Fresno',                             pop: '1.0M' },
    { slug: 'stockton',       name: 'Stockton',       state: 'CA', metro: 'Stockton-Lodi',                      pop: '0.8M' },
    { slug: 'provo',          name: 'Provo',          state: 'UT', metro: 'Provo-Orem-Lehi',                    pop: '0.7M' },
    { slug: 'anchorage',      name: 'Anchorage',      state: 'AK', metro: 'Anchorage',                          pop: '0.4M' },
    { slug: 'des-moines',     name: 'Des Moines',     state: 'IA', metro: 'Des Moines-West Des Moines',         pop: '0.7M' },
    { slug: 'little-rock',    name: 'Little Rock',    state: 'AR', metro: 'Little Rock-North Little Rock-Conway', pop: '0.7M' },
    { slug: 'spokane',        name: 'Spokane',        state: 'WA', metro: 'Spokane-Spokane Valley',             pop: '0.6M' },
    { slug: 'lexington',      name: 'Lexington',      state: 'KY', metro: 'Lexington-Fayette',                  pop: '0.5M' },
];

// ── Batch 8: 10 new cities (Florida/Southeast) ─────────────
const BATCH8_CITIES = [
    { slug: 'sarasota',       name: 'Sarasota',       state: 'FL', metro: 'North Port-Bradenton-Sarasota',      pop: '0.9M' },
    { slug: 'cape-coral',     name: 'Cape Coral',     state: 'FL', metro: 'Cape Coral-Fort Myers',              pop: '0.8M' },
    { slug: 'lakeland',       name: 'Lakeland',       state: 'FL', metro: 'Lakeland-Winter Haven',              pop: '0.7M' },
    { slug: 'daytona-beach',  name: 'Daytona Beach',  state: 'FL', metro: 'Deltona-Daytona Beach-Ormond Beach', pop: '0.7M' },
    { slug: 'palm-bay',       name: 'Palm Bay',       state: 'FL', metro: 'Palm Bay-Melbourne-Titusville',      pop: '0.6M' },
    { slug: 'chattanooga',    name: 'Chattanooga',    state: 'TN', metro: 'Chattanooga',                        pop: '0.6M' },
    { slug: 'savannah',       name: 'Savannah',       state: 'GA', metro: 'Savannah',                           pop: '0.4M' },
    { slug: 'charleston',     name: 'Charleston',     state: 'SC', metro: 'Charleston-North Charleston',        pop: '0.8M' },
    { slug: 'greenville',     name: 'Greenville',     state: 'SC', metro: 'Greenville-Anderson-Greer',          pop: '0.9M' },
    { slug: 'asheville',      name: 'Asheville',      state: 'NC', metro: 'Asheville',                          pop: '0.5M' },
];

// ── Batch 9: 10 new cities (Geographic gap fillers) ─────────
const BATCH9_CITIES = [
    { slug: 'reno',            name: 'Reno',           state: 'NV', metro: 'Reno',                               pop: '0.5M' },
    { slug: 'tallahassee',     name: 'Tallahassee',    state: 'FL', metro: 'Tallahassee',                        pop: '0.4M' },
    { slug: 'pensacola',       name: 'Pensacola',      state: 'FL', metro: 'Pensacola-Ferry Pass-Brent',         pop: '0.5M' },
    { slug: 'fayetteville-ar', name: 'Fayetteville',   state: 'AR', metro: 'Fayetteville-Springdale-Rogers',     pop: '0.6M' },
    { slug: 'augusta',         name: 'Augusta',        state: 'GA', metro: 'Augusta-Richmond County',            pop: '0.6M' },
    { slug: 'harrisburg',      name: 'Harrisburg',     state: 'PA', metro: 'Harrisburg-Carlisle',                pop: '0.6M' },
    { slug: 'syracuse',        name: 'Syracuse',       state: 'NY', metro: 'Syracuse',                           pop: '0.7M' },
    { slug: 'wilmington-nc',   name: 'Wilmington',     state: 'NC', metro: 'Wilmington',                         pop: '0.3M' },
    { slug: 'jackson',         name: 'Jackson',        state: 'MS', metro: 'Jackson',                            pop: '0.6M' },
    { slug: 'springfield-mo',  name: 'Springfield',    state: 'MO', metro: 'Springfield',                        pop: '0.5M' },
];

// ── Combined arrays ─────────────────────────────────────────
const NEW_CITIES = [...BATCH5_CITIES, ...BATCH6_CITIES, ...BATCH7_CITIES, ...BATCH8_CITIES, ...BATCH9_CITIES];
const ALL_CITIES = [...BATCH1_CITIES, ...BATCH2_CITIES, ...BATCH3_CITIES, ...BATCH4_CITIES, ...NEW_CITIES];

// ── BLS OEWS Hourly Mean Wages by Metro × Occupation ────────
// Source: BLS Occupational Employment & Wage Statistics (May 2024)
// SOC codes: 49-3023 (Auto Mechanics), 47-2152 (Plumbers), 47-2111 (Electricians),
//            49-9021 (HVAC), 49-9071 (Maintenance), 47-2181 (Roofers),
//            47-2141 (Painters), 47-2031 (Carpenters)
const WAGES = {
    // ── Batch 5 ──
    richmond:          { autoMech: 27.70, plumber: 28.27, electrician: 29.24, hvac: 28.60, maintenance: 25.46, roofer: 23.64, painter: 20.66, carpenter: 24.90 },
    'salt-lake-city':  { autoMech: 25.97, plumber: 32.12, electrician: 31.02, hvac: 29.05, maintenance: 25.87, roofer: 26.53, painter: 23.13, carpenter: 27.86 },
    birmingham:        { autoMech: 26.09, plumber: 26.87, electrician: 26.93, hvac: 26.01, maintenance: 22.40, roofer: 23.21, painter: 21.36, carpenter: 24.34 },
    wichita:           { autoMech: 24.13, plumber: 29.54, electrician: 31.51, hvac: 26.76, maintenance: 22.57, roofer: 25.31, painter: 20.92, carpenter: 25.64 },
    madison:           { autoMech: 28.99, plumber: 42.99, electrician: 36.51, hvac: 31.79, maintenance: 26.12, roofer: 26.54, painter: 26.55, carpenter: 32.44 },
    'baton-rouge':     { autoMech: 25.01, plumber: 33.61, electrician: 31.34, hvac: 27.72, maintenance: 23.50, roofer: 23.23, painter: 21.42, carpenter: 26.40 },
    'grand-rapids':    { autoMech: 25.80, plumber: 33.71, electrician: 31.52, hvac: 29.37, maintenance: 24.37, roofer: 26.25, painter: 25.01, carpenter: 28.27 },
    columbia:          { autoMech: 23.93, plumber: 25.12, electrician: 29.62, hvac: 26.38, maintenance: 23.42, roofer: 23.08, painter: 21.49, carpenter: 24.28 },
    hartford:          { autoMech: 27.12, plumber: 34.40, electrician: 35.59, hvac: 33.94, maintenance: 27.98, roofer: 33.14, painter: 27.68, carpenter: 32.27 },
    buffalo:           { autoMech: 24.69, plumber: 35.75, electrician: 36.06, hvac: 29.55, maintenance: 25.31, roofer: 31.05, painter: 26.48, carpenter: 30.76 },
    // ── Batch 6 ──
    huntsville:        { autoMech: 25.69, plumber: 26.63, electrician: 27.47, hvac: 26.44, maintenance: 22.69, roofer: 22.50, painter: 23.37, carpenter: 23.65 },
    akron:             { autoMech: 24.60, plumber: 30.39, electrician: 36.00, hvac: 29.44, maintenance: 25.27, roofer: 27.65, painter: 27.14, carpenter: 28.01 },
    rochester:         { autoMech: 25.55, plumber: 34.79, electrician: 35.28, hvac: 30.09, maintenance: 25.30, roofer: 28.25, painter: 24.31, carpenter: 29.85 },
    providence:        { autoMech: 26.05, plumber: 36.48, electrician: 34.24, hvac: 32.27, maintenance: 25.96, roofer: 29.44, painter: 27.14, carpenter: 32.98 },
    worcester:         { autoMech: 26.53, plumber: 39.64, electrician: 35.96, hvac: 36.21, maintenance: 26.54, roofer: 41.28, painter: 27.12, carpenter: 34.23 },
    knoxville:         { autoMech: 24.66, plumber: 28.11, electrician: 27.30, hvac: 26.63, maintenance: 22.76, roofer: 20.42, painter: 20.80, carpenter: 23.92 },
    boise:             { autoMech: 24.94, plumber: 28.71, electrician: 29.13, hvac: 28.66, maintenance: 24.14, roofer: 24.92, painter: 23.04, carpenter: 24.55 },
    greensboro:        { autoMech: 25.40, plumber: 25.64, electrician: 26.42, hvac: 25.95, maintenance: 23.70, roofer: 23.92, painter: 20.57, carpenter: 21.70 },
    tulsa:             { autoMech: 24.36, plumber: 28.27, electrician: 30.23, hvac: 27.27, maintenance: 22.39, roofer: 24.03, painter: 21.06, carpenter: 24.64 },
    dayton:            { autoMech: 24.10, plumber: 31.34, electrician: 29.42, hvac: 29.66, maintenance: 25.33, roofer: 26.10, painter: 25.83, carpenter: 26.53 },
    // ── Batch 7 ──
    'el-paso':         { autoMech: 22.04, plumber: 25.72, electrician: 23.92, hvac: 24.07, maintenance: 19.68, roofer: 18.48, painter: 17.99, carpenter: 20.00 },
    ogden:             { autoMech: 24.64, plumber: 30.11, electrician: 30.35, hvac: 29.18, maintenance: 25.96, roofer: 24.91, painter: 24.58, carpenter: 25.63 },
    fresno:            { autoMech: 27.50, plumber: 35.48, electrician: 35.77, hvac: 31.39, maintenance: 25.08, roofer: 30.68, painter: 25.81, carpenter: 32.73 },
    stockton:          { autoMech: 29.06, plumber: 34.32, electrician: 37.74, hvac: 34.25, maintenance: 28.57, roofer: 30.23, painter: 25.36, carpenter: 33.65 },
    provo:             { autoMech: 23.63, plumber: 27.75, electrician: 29.16, hvac: 26.91, maintenance: 24.23, roofer: 24.96, painter: 20.90, carpenter: 25.60 },
    anchorage:         { autoMech: 31.29, plumber: 40.27, electrician: 38.60, hvac: 41.79, maintenance: 27.18, roofer: 31.59, painter: 31.77, carpenter: 36.09 },
    'des-moines':      { autoMech: 26.59, plumber: 32.51, electrician: 32.28, hvac: 30.36, maintenance: 25.62, roofer: 25.71, painter: 25.85, carpenter: 28.46 },
    'little-rock':     { autoMech: 23.85, plumber: 25.08, electrician: 24.62, hvac: 23.75, maintenance: 22.43, roofer: 20.66, painter: 20.01, carpenter: 23.06 },
    spokane:           { autoMech: 27.41, plumber: 35.74, electrician: 39.64, hvac: 30.35, maintenance: 26.58, roofer: 29.82, painter: 26.60, carpenter: 31.58 },
    lexington:         { autoMech: 22.15, plumber: 31.89, electrician: 27.82, hvac: 29.09, maintenance: 22.68, roofer: 23.70, painter: 24.26, carpenter: 25.79 },
    // ── Batch 8 ──
    sarasota:          { autoMech: 26.58, plumber: 25.61, electrician: 25.65, hvac: 26.17, maintenance: 24.32, roofer: 24.18, painter: 21.74, carpenter: 24.19 },
    'cape-coral':      { autoMech: 25.28, plumber: 25.11, electrician: 25.82, hvac: 25.84, maintenance: 23.30, roofer: 22.14, painter: 21.87, carpenter: 23.36 },
    lakeland:          { autoMech: 24.89, plumber: 25.04, electrician: 25.40, hvac: 26.06, maintenance: 23.19, roofer: 23.03, painter: 21.36, carpenter: 22.46 },
    'daytona-beach':   { autoMech: 24.23, plumber: 23.17, electrician: 24.64, hvac: 24.90, maintenance: 21.16, roofer: 21.37, painter: 19.69, carpenter: 22.62 },
    'palm-bay':        { autoMech: 25.11, plumber: 26.21, electrician: 26.56, hvac: 25.36, maintenance: 22.93, roofer: 21.84, painter: 23.50, carpenter: 23.68 },
    chattanooga:       { autoMech: 24.66, plumber: 28.35, electrician: 28.90, hvac: 26.08, maintenance: 23.28, roofer: 20.13, painter: 22.30, carpenter: 24.25 },
    savannah:          { autoMech: 27.16, plumber: 29.86, electrician: 28.43, hvac: 25.27, maintenance: 23.15, roofer: 21.80, painter: 22.58, carpenter: 24.58 },
    charleston:        { autoMech: 24.26, plumber: 26.91, electrician: 28.18, hvac: 28.05, maintenance: 23.84, roofer: 25.71, painter: 22.28, carpenter: 25.54 },
    greenville:        { autoMech: 23.60, plumber: 26.94, electrician: 28.92, hvac: 26.91, maintenance: 25.08, roofer: 24.03, painter: 19.86, carpenter: 23.90 },
    asheville:         { autoMech: 26.02, plumber: 28.70, electrician: 25.74, hvac: 25.96, maintenance: 23.16, roofer: 22.00, painter: 21.43, carpenter: 22.24 },
    // ── Batch 9 ──
    reno:              { autoMech: 27.04, plumber: 34.61, electrician: 32.97, hvac: 30.33, maintenance: 25.86, roofer: 27.44, painter: 26.51, carpenter: 32.80 },
    tallahassee:       { autoMech: 23.45, plumber: 23.99, electrician: 25.15, hvac: 23.87, maintenance: 20.99, roofer: 21.17, painter: 20.35, carpenter: 22.36 },
    pensacola:         { autoMech: 23.79, plumber: 24.95, electrician: 25.64, hvac: 25.46, maintenance: 23.35, roofer: 21.82, painter: 21.60, carpenter: 22.83 },
    'fayetteville-ar': { autoMech: 24.67, plumber: 26.17, electrician: 25.70, hvac: 25.63, maintenance: 22.72, roofer: 21.86, painter: 20.43, carpenter: 24.91 },
    augusta:           { autoMech: 23.31, plumber: 29.51, electrician: 29.98, hvac: 24.89, maintenance: 23.66, roofer: 20.27, painter: 21.18, carpenter: 27.30 },
    harrisburg:        { autoMech: 25.03, plumber: 36.35, electrician: 34.95, hvac: 30.80, maintenance: 25.28, roofer: 23.31, painter: 25.46, carpenter: 28.07 },
    syracuse:          { autoMech: 25.37, plumber: 33.62, electrician: 35.90, hvac: 31.25, maintenance: 25.77, roofer: 30.85, painter: 25.44, carpenter: 29.87 },
    'wilmington-nc':   { autoMech: 23.96, plumber: 25.08, electrician: 26.12, hvac: 24.76, maintenance: 22.36, roofer: 23.78, painter: 20.56, carpenter: 24.06 },
    jackson:           { autoMech: 22.81, plumber: 28.87, electrician: 24.16, hvac: 26.27, maintenance: 21.54, roofer: 21.15, painter: 20.95, carpenter: 23.44 },
    'springfield-mo':  { autoMech: 24.30, plumber: 30.76, electrician: 29.28, hvac: 28.34, maintenance: 23.79, roofer: 26.38, painter: 23.66, carpenter: 27.41 },
};

// ── BEA Regional Price Parities (RPP) ─────────────────────
// Source: Bureau of Economic Analysis (2023 data, latest available)
// RPP = percentage of national average cost of goods/services (100 = national avg)
const RPP = {
    // ── Batch 5 ──
    richmond:          98.3,
    'salt-lake-city':  97.1,
    birmingham:        91.8,
    wichita:           89.4,
    madison:           95.9,
    'baton-rouge':     91.2,
    'grand-rapids':    95.0,
    columbia:          93.2,
    hartford:          103.3,
    buffalo:           94.9,
    // ── Batch 6 ──
    huntsville:        93.8,
    akron:             92.9,
    rochester:         98.4,
    providence:        101.5,
    worcester:         103.0,
    knoxville:         92.2,
    boise:             94.2,
    greensboro:        92.9,
    tulsa:             89.9,
    dayton:            92.4,
    // ── Batch 7 ──
    'el-paso':         90.8,
    ogden:             96.1,
    fresno:            104.0,
    stockton:          107.6,
    provo:             95.7,
    anchorage:         106.8,
    'des-moines':      92.8,
    'little-rock':     89.5,
    spokane:           100.9,
    lexington:         92.5,
    // ── Batch 8 ──
    sarasota:          104.2,
    'cape-coral':      103.1,
    lakeland:          97.7,
    'daytona-beach':   99.1,
    'palm-bay':        101.3,
    chattanooga:       92.4,
    savannah:          95.9,
    charleston:        101.1,
    greenville:        93.1,
    asheville:         97.4,
    // ── Batch 9 ──
    reno:              98.0,
    tallahassee:       95.6,
    pensacola:         95.8,
    'fayetteville-ar': 91.5,
    augusta:           91.2,
    harrisburg:        97.0,
    syracuse:          95.7,
    'wilmington-nc':   95.4,
    jackson:           89.8,
    'springfield-mo':  89.1,
};

// ── 16 Services (8 Auto + 8 Home) ──────────────────────────
const SERVICES = [
    // ─── AUTO SERVICES ───
    {
        slug: 'brake-pad-replacement',
        name: 'Brake Pad Replacement',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 1,
        laborHoursHigh: 2,
        partsNationalLow: 80,
        partsNationalHigh: 250,
        shortDesc: 'front and rear brake pad replacement',
        icon: '\u{1F527}',
        relatedBlog: '/blog/brake-pad-replacement-cost',
    },
    {
        slug: 'oil-change',
        name: 'Oil Change',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 0.5,
        laborHoursHigh: 1,
        partsNationalLow: 25,
        partsNationalHigh: 90,
        shortDesc: 'conventional and synthetic oil change service',
        icon: '\u{1F6E2}\uFE0F',
        relatedBlog: '/blog/oil-change-cost',
    },
    {
        slug: 'car-wrap',
        name: 'Full Car Wrap',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 15,
        laborHoursHigh: 40,
        partsNationalLow: 800,
        partsNationalHigh: 3000,
        shortDesc: 'full vehicle vinyl wrap',
        icon: '\u{1F3A8}',
        relatedBlog: '/blog/how-much-does-a-car-wrap-cost',
    },
    {
        slug: 'ceramic-coating',
        name: 'Ceramic Coating',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 8,
        laborHoursHigh: 20,
        partsNationalLow: 100,
        partsNationalHigh: 500,
        shortDesc: 'professional ceramic coating application',
        icon: '\u2728',
        relatedBlog: '/blog/ceramic-coating-cost',
    },
    {
        slug: 'transmission-repair',
        name: 'Transmission Repair',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 4,
        laborHoursHigh: 15,
        partsNationalLow: 300,
        partsNationalHigh: 3500,
        shortDesc: 'transmission diagnosis, repair, and rebuild',
        icon: '\u2699\uFE0F',
        relatedBlog: '/blog/transmission-repair-cost',
    },
    {
        slug: 'window-tinting',
        name: 'Window Tinting',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 2,
        laborHoursHigh: 4,
        partsNationalLow: 80,
        partsNationalHigh: 400,
        shortDesc: 'automotive window tinting',
        icon: '\u{1FA9F}',
        relatedBlog: '/blog/window-tinting-cost',
    },
    {
        slug: 'ev-charger-installation',
        name: 'EV Charger Installation',
        category: 'auto',
        occupation: 'electrician',
        laborHoursLow: 3,
        laborHoursHigh: 8,
        partsNationalLow: 300,
        partsNationalHigh: 1200,
        shortDesc: 'Level 2 home EV charger installation',
        icon: '\u26A1',
        relatedBlog: '/blog/ev-charger-installation-cost',
    },
    {
        slug: 'ac-repair',
        name: 'AC Repair & Recharge',
        category: 'auto',
        occupation: 'autoMech',
        laborHoursLow: 1,
        laborHoursHigh: 4,
        partsNationalLow: 50,
        partsNationalHigh: 600,
        shortDesc: 'automotive AC diagnosis, repair, and recharge',
        icon: '\u2744\uFE0F',
    },
    // ─── HOME SERVICES ───
    {
        slug: 'kitchen-remodel',
        name: 'Kitchen Remodel',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 80,
        laborHoursHigh: 300,
        partsNationalLow: 5000,
        partsNationalHigh: 35000,
        shortDesc: 'partial to full kitchen remodel',
        icon: '\u{1F373}',
        relatedBlog: '/blog/kitchen-remodel-cost-guide',
    },
    {
        slug: 'bathroom-remodel',
        name: 'Bathroom Remodel',
        category: 'home',
        occupation: 'plumber',
        laborHoursLow: 40,
        laborHoursHigh: 160,
        partsNationalLow: 2000,
        partsNationalHigh: 15000,
        shortDesc: 'partial to full bathroom remodel',
        icon: '\u{1F6BF}',
        relatedBlog: '/blog/bathroom-remodel-cost',
    },
    {
        slug: 'roof-replacement',
        name: 'Roof Replacement',
        category: 'home',
        occupation: 'roofer',
        laborHoursLow: 16,
        laborHoursHigh: 60,
        partsNationalLow: 3000,
        partsNationalHigh: 12000,
        shortDesc: 'full roof replacement',
        icon: '\u{1F3E0}',
        relatedBlog: '/blog/roof-replacement-cost',
    },
    {
        slug: 'hvac-replacement',
        name: 'HVAC Replacement',
        category: 'home',
        occupation: 'hvac',
        laborHoursLow: 8,
        laborHoursHigh: 24,
        partsNationalLow: 2500,
        partsNationalHigh: 8000,
        shortDesc: 'HVAC system replacement and installation',
        icon: '\u{1F321}\uFE0F',
        relatedBlog: '/blog/hvac-replacement-cost',
    },
    {
        slug: 'interior-painting',
        name: 'Interior Painting',
        category: 'home',
        occupation: 'painter',
        laborHoursLow: 16,
        laborHoursHigh: 60,
        partsNationalLow: 200,
        partsNationalHigh: 1200,
        shortDesc: 'whole-house or multi-room interior painting',
        icon: '\u{1F58C}\uFE0F',
        relatedBlog: '/blog/interior-painting-cost',
    },
    {
        slug: 'fence-installation',
        name: 'Fence Installation',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 12,
        laborHoursHigh: 40,
        partsNationalLow: 800,
        partsNationalHigh: 5000,
        shortDesc: 'wood, vinyl, or chain-link fence installation',
        icon: '\u{1F3D7}\uFE0F',
        relatedBlog: '/blog/fence-installation-cost',
    },
    {
        slug: 'flooring-installation',
        name: 'Flooring Installation',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 16,
        laborHoursHigh: 50,
        partsNationalLow: 1000,
        partsNationalHigh: 8000,
        shortDesc: 'hardwood, LVP, tile, or carpet flooring installation',
        icon: '\u{1FAB5}',
        relatedBlog: '/blog/flooring-installation-cost',
    },
    {
        slug: 'garage-door-replacement',
        name: 'Garage Door Replacement',
        category: 'home',
        occupation: 'carpenter',
        laborHoursLow: 3,
        laborHoursHigh: 8,
        partsNationalLow: 600,
        partsNationalHigh: 4000,
        shortDesc: 'garage door replacement and opener installation',
        icon: '\u{1F6AA}',
        relatedBlog: '/blog/garage-door-replacement-cost',
    },
];

// ── Content generation per service type ─────────────────────
function generateContentSections(service, city, costs) {
    const { slug, name: svcName, category } = service;
    const { name: cityName, state, metro } = city;
    const loc = `${cityName}, ${state}`;
    const rpp = RPP[city.slug];
    const rppLabel = rpp > 103 ? 'above the national average' : rpp < 97 ? 'below the national average' : 'close to the national average';

    let sections = '';

    // Opening paragraph
    sections += `<p>If you live in the ${metro} metro area and need ${service.shortDesc}, understanding local pricing before you call a shop can save you hundreds of dollars. Labor rates, material costs, and demand all vary by region, and ${cityName} has its own pricing dynamics shaped by the local economy and cost of living.</p>\n\n`;

    // Cost overview
    sections += `<p>Based on current labor rates and material costs in ${loc}, here is what you can expect to pay for ${service.shortDesc.replace(/^(a |an )/, '')} in 2026.</p>\n\n`;

    // Cost table
    sections += `<div class="cost-table">\n`;
    sections += `    <div class="cost-row"><span>Budget estimate</span><span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.budgetHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Mid-range estimate</span><span>$${costs.midLow.toLocaleString()} &ndash; $${costs.midHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Premium estimate</span><span>$${costs.premiumLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Labor portion</span><span>$${costs.laborCostLow.toLocaleString()} &ndash; $${costs.laborCostHigh.toLocaleString()}</span></div>\n`;
    sections += `    <div class="cost-row"><span>Parts &amp; materials</span><span>$${costs.partsCostLow.toLocaleString()} &ndash; $${costs.partsCostHigh.toLocaleString()}</span></div>\n`;
    sections += `</div>\n\n`;

    // How we calculated
    sections += `<h2>How We Calculate ${svcName} Costs in ${cityName}</h2>\n\n`;
    sections += `<p>These estimates combine two data sources from the federal government. Local hourly wages come from the Bureau of Labor Statistics Occupational Employment and Wage Statistics program, which surveys employers across the ${metro} metro area every year. The cost-of-living adjustment uses Regional Price Parities from the Bureau of Economic Analysis, which measure how much goods and services cost in ${cityName} compared to the national average.</p>\n\n`;
    sections += `<p>The ${cityName} metro area has a Regional Price Parity of <strong>${rpp}</strong>, meaning the overall cost of goods and services is ${rppLabel}. The local hourly wage for this trade is <strong>$${costs.hourlyWage.toFixed(2)}</strong> per hour, which directly impacts how much shops charge for labor.</p>\n\n`;

    // Why prices vary in this city
    sections += `<h2>Why ${svcName} Costs Vary in ${cityName}</h2>\n\n`;
    sections += `<p>Even within the ${metro} metro area, you will find a wide range of prices. Several factors drive this variation.</p>\n\n`;

    if (category === 'auto') {
        sections += `<p><strong>Shop type matters.</strong> Dealerships in ${cityName} typically charge 30 to 60 percent more than independent mechanics for the same service. National chains like Midas, Pep Boys, and Firestone fall somewhere in between. For most routine ${service.shortDesc}, an independent shop with strong reviews offers the best value.</p>\n\n`;
        sections += `<p><strong>Vehicle make and model.</strong> Luxury and European vehicles cost significantly more to service than economy brands. A ${svcName.toLowerCase()} on a BMW X5 or Mercedes GLE in ${cityName} can cost twice what the same job costs on a Honda CR-V or Toyota Camry.</p>\n\n`;
        sections += `<p><strong>Parts quality.</strong> OEM parts cost more than aftermarket alternatives but ensure factory-spec fitment. High-quality aftermarket brands often deliver comparable performance at 20 to 40 percent less.</p>\n\n`;
    } else {
        sections += `<p><strong>Contractor experience and licensing.</strong> Licensed, insured contractors in ${cityName} charge more than unlicensed handymen, but they offer permits, warranties, and accountability. For major ${service.shortDesc}, always verify that your contractor holds a valid ${state} license.</p>\n\n`;
        sections += `<p><strong>Material quality tiers.</strong> The gap between budget and premium materials is often larger than the gap in labor costs. Choosing mid-range materials is usually the best balance of quality and value for most ${cityName} homeowners.</p>\n\n`;
        sections += `<p><strong>Project scope and home size.</strong> A small-scale project can cost a fraction of a full-scale renovation. The estimates above cover typical residential projects in the ${metro} area, but your actual cost depends on the specific scope of work.</p>\n\n`;
    }

    // Neighborhood differences
    sections += `<p><strong>Neighborhood and demand.</strong> Shops and contractors in higher-income areas of ${cityName} often charge more due to overhead and clientele expectations. Getting quotes from providers in neighboring suburbs can sometimes save 10 to 20 percent without sacrificing quality.</p>\n\n`;

    // Tips section
    sections += `<h2>How to Save on ${svcName} in ${cityName}</h2>\n\n`;
    sections += `<p>Getting the best price in ${loc} comes down to preparation and smart shopping.</p>\n\n`;
    sections += `<p><strong>Get at least three quotes.</strong> Prices in the ${metro} area vary significantly between providers. Spending an hour collecting quotes can easily save you $${Math.round(costs.midLow * 0.15)} or more.</p>\n\n`;
    sections += `<p><strong>Check seasonal timing.</strong> ${category === 'auto' ? 'Many auto shops offer promotions during slower months. In ' + cityName + ', demand tends to dip in early spring and late fall.' : 'Home service demand in ' + cityName + ' peaks in spring and summer. Scheduling work in late fall or winter can get you better pricing and faster scheduling.'}</p>\n\n`;
    sections += `<p><strong>Read recent reviews.</strong> Google Reviews, Yelp, and NextDoor are valuable resources for finding reliable ${category === 'auto' ? 'mechanics and shops' : 'contractors'} in ${cityName}. Look for providers with consistent 4.5+ star ratings and detailed reviews mentioning fair pricing.</p>\n\n`;
    sections += `<p><strong>Ask about warranties.</strong> Reputable providers in ${cityName} stand behind their work. A written warranty on both parts and labor protects you from paying twice for the same problem.</p>\n\n`;

    // CTA
    sections += `<h2>Get a Personalized ${svcName} Estimate</h2>\n\n`;
    sections += `<p>These ranges reflect typical pricing in the ${metro} metro area, but your actual cost depends on your specific situation. Use our free AI-powered estimator to get a detailed, personalized quote based on your exact needs and location in ${cityName}.</p>\n\n`;

    return sections;
}

// ── Cost Calculation Engine ─────────────────────────────────
function calculateCosts(service, citySlug) {
    const wages = WAGES[citySlug];
    const rpp = RPP[citySlug] / 100;
    const hourlyWage = wages[service.occupation];

    const shopMarkupLow = 1.6;
    const shopMarkupHigh = 2.2;
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
        hourlyWage,
        rpp: RPP[citySlug],
        laborCostLow: round10(laborCostLow),
        laborCostHigh: round10(laborCostHigh),
        partsCostLow: round10(partsCostLow),
        partsCostHigh: round10(partsCostHigh),
        budgetLow: round10(budgetLow),
        budgetHigh: round10(budgetHigh),
        midLow: round10(midLow),
        midHigh: round10(midHigh),
        premiumLow: round10(premiumLow),
        premiumHigh: round10(premiumHigh),
    };
}

// ── Related services for internal linking ───────────────────
function getRelatedServices(service, city) {
    return SERVICES
        .filter(s => s.slug !== service.slug && s.category === service.category)
        .slice(0, 4)
        .map(s => ({
            slug: s.slug,
            name: s.name,
            url: `/cost/${city.slug}/${s.slug}`,
            icon: s.icon,
        }));
}

// ── Other cities for same service (deterministic cross-linking) ──
function getOtherCitiesDeterministic(service, currentCity) {
    const idx = NEW_CITIES.findIndex(c => c.slug === currentCity.slug);
    const batch12 = [...BATCH1_CITIES, ...BATCH2_CITIES];
    const batch34 = [...BATCH3_CITIES, ...BATCH4_CITIES];
    const newOthers = NEW_CITIES.filter(c => c.slug !== currentCity.slug);

    return [
        newOthers[idx % newOthers.length],
        newOthers[(idx + 17) % newOthers.length],
        batch12[idx % batch12.length],
        batch34[idx % batch34.length],
        batch12[(idx + 7) % batch12.length],
    ].map(c => ({
        name: `${c.name}, ${c.state}`,
        url: `/cost/${c.slug}/${service.slug}`,
    }));
}

// ── HTML Service Page Template ──────────────────────────────
function generateHTML(service, city, costs) {
    const loc = `${city.name}, ${city.state}`;
    const title = `${service.name} Cost in ${loc} (2026 Prices) | Ecostify`;
    const desc = `${service.name} in ${loc} costs $${costs.budgetLow.toLocaleString()} to $${costs.premiumHigh.toLocaleString()} in 2026. See local labor rates, material costs, and tips to save. Data from BLS and BEA.`;
    const canonical = `https://www.ecostify.com/cost/${city.slug}/${service.slug}`;
    const categoryLabel = service.category === 'auto' ? 'Auto' : 'Home';
    const badge = `${categoryLabel} &middot; ${loc}`;
    const content = generateContentSections(service, city, costs);
    const relatedServices = getRelatedServices(service, city);
    const otherCities = getOtherCitiesDeterministic(service, city);
    const ctaLink = service.category === 'auto' ? '/#auto' : '/#home';
    const blogLink = service.relatedBlog ? `<p>For a deeper dive into national pricing trends, read our full <a href="${service.relatedBlog}">${service.name} cost guide</a>.</p>` : '';

    const relatedServicesHTML = relatedServices.map(s =>
        `                    <li><a href="${s.url}">${s.icon} ${s.name} Cost in ${city.name}</a></li>`
    ).join('\n');

    const otherCitiesHTML = otherCities.map(c =>
        `                    <li><a href="${c.url}">${service.name} Cost in ${c.name}</a></li>`
    ).join('\n');

    const breadcrumbJson = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
            { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
            { "@type": "ListItem", "position": 3, "name": `${loc}`, "item": `https://www.ecostify.com/cost/${city.slug}/` },
            { "@type": "ListItem", "position": 4, "name": service.name }
        ]
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="theme-color" content="#1B2A3D">
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
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${service.name} Cost in ${loc} — 2026 Pricing Guide",
        "description": "${desc}",
        "datePublished": "2026-02-24",
        "dateModified": "2026-02-24",
        "author": { "@type": "Person", "name": "Ecostify Editorial", "url": "https://www.ecostify.com/about" },
        "publisher": { "@type": "Organization", "name": "Ecostify", "url": "https://www.ecostify.com" }
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How much does ${service.name.toLowerCase()} cost in ${loc}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${service.name} in ${loc} typically costs between $${costs.budgetLow.toLocaleString()} and $${costs.premiumHigh.toLocaleString()} in 2026, depending on the scope of work and materials. The mid-range estimate is $${costs.midLow.toLocaleString()} to $${costs.midHigh.toLocaleString()}."
                }
            },
            {
                "@type": "Question",
                "name": "What is the average labor rate for this service in ${city.name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Based on BLS data, the average hourly wage for this trade in the ${city.metro} metro area is $${costs.hourlyWage.toFixed(2)} per hour. After shop overhead and markup, expect to pay roughly $${costs.laborCostLow.toLocaleString()} to $${costs.laborCostHigh.toLocaleString()} total for labor."
                }
            }
        ]
    }
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
            <div class="article-header">
                <div class="blog-card-badge">${badge}</div>
                <h1>${service.icon} ${service.name} Cost in ${loc}</h1>
                <p class="article-meta">Updated February 2026 &middot; Based on BLS &amp; BEA data for the ${city.metro} metro area</p>
            </div>
            <div class="article-body">

                ${content}
                ${blogLink}

                <h2>Other ${categoryLabel} Services in ${city.name}</h2>

                <ul>
${relatedServicesHTML}
                </ul>

                <h2>${service.name} Cost in Other Cities</h2>

                <ul>
${otherCitiesHTML}
                </ul>

                <div class="article-cta">
                    <h3>Get an Instant ${service.name} Estimate for ${city.name}</h3>
                    <p>Upload a photo or describe your project to get a personalized AI-powered cost estimate calibrated to ${loc} pricing.</p>
                    <a href="${ctaLink}" class="btn">Get Your Estimate &rarr;</a>
                </div>

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
                <span class="footer-copy">&copy; 2026 Ecostify</span>
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
        return `
                    <div class="cost-row">
                        <span><a href="/cost/${city.slug}/${s.slug}">${s.icon} ${s.name}</a></span>
                        <span>$${costs.budgetLow.toLocaleString()} &ndash; $${costs.premiumHigh.toLocaleString()}</span>
                    </div>`;
    };

    const itemListJson = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Auto & Home Service Costs in ${loc}`,
        "url": `https://www.ecostify.com/cost/${city.slug}/`,
        "numberOfItems": 16,
        "itemListElement": SERVICES.map((s, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": `${s.name} Cost in ${city.name}`,
            "url": `https://www.ecostify.com/cost/${city.slug}/${s.slug}`
        }))
    });

    const breadcrumbJson = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecostify.com/" },
            { "@type": "ListItem", "position": 2, "name": "Cost Guides", "item": "https://www.ecostify.com/cost/" },
            { "@type": "ListItem", "position": 3, "name": `${loc}` }
        ]
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto &amp; Home Service Costs in ${loc} (2026) | Ecostify</title>
    <meta name="description" content="Compare costs for 16 auto and home services in ${loc}. Local pricing based on BLS wages and BEA cost-of-living data for the ${city.metro} metro area.">
    <link rel="canonical" href="https://www.ecostify.com/cost/${city.slug}/">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="theme-color" content="#1B2A3D">
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
            <div class="article-header">
                <h1>Auto &amp; Home Service Costs in ${loc}</h1>
                <p class="article-meta">${city.metro} metro area &middot; Pop. ${city.pop} &middot; RPP: ${RPP[city.slug]} &middot; Updated February 2026</p>
            </div>
            <div class="article-body">

                <p>Here is what you can expect to pay for common auto and home services in the ${city.metro} metro area in 2026. All estimates are based on local BLS wage data and BEA Regional Price Parities.</p>

                <h2>Auto Services in ${city.name}</h2>

                <div class="cost-table">${autoServices.map(renderServiceRow).join('')}
                </div>

                <h2>Home Services in ${city.name}</h2>

                <div class="cost-table">${homeServices.map(renderServiceRow).join('')}
                </div>

                <div class="article-cta">
                    <h3>Get a Personalized Estimate for ${city.name}</h3>
                    <p>These are typical ranges. Upload a photo or describe your specific project to get an AI-powered estimate calibrated to ${loc} pricing.</p>
                    <a href="/" class="btn">Get Your Estimate &rarr;</a>
                </div>

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
                <span class="footer-copy">&copy; 2026 Ecostify</span>
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
</body>
</html>`;
}

// ── Main Build ──────────────────────────────────────────────
function build() {
    const baseDir = path.join(__dirname, 'cost');
    let pageCount = 0;

    console.log('🏗️  Ecostify City Page Generator — Batches 5-9');
    console.log(`   ${NEW_CITIES.length} cities × ${SERVICES.length} services = ${NEW_CITIES.length * SERVICES.length} service pages + ${NEW_CITIES.length} city index pages\n`);

    // Generate per-city and per-service pages
    NEW_CITIES.forEach(city => {
        const cityDir = path.join(baseDir, city.slug);
        if (!fs.existsSync(cityDir)) {
            fs.mkdirSync(cityDir, { recursive: true });
        }

        // City index page
        const cityIndexHTML = generateCityIndexPage(city);
        fs.writeFileSync(path.join(cityDir, 'index.html'), cityIndexHTML);
        console.log(`✅  /cost/${city.slug}/index.html`);
        pageCount++;

        // Individual service pages
        SERVICES.forEach(service => {
            const costs = calculateCosts(service, city.slug);
            const html = generateHTML(service, city, costs);
            fs.writeFileSync(path.join(cityDir, `${service.slug}.html`), html);
            pageCount++;
        });
        console.log(`   ✅  ${SERVICES.length} service pages for ${city.name}, ${city.state}`);
    });

    // Update the main /cost/index.html to add batch 5-9 city cards
    console.log('\n📝  Updating /cost/index.html with batch 5-9 cities...');
    const costIndexPath = path.join(baseDir, 'index.html');
    let costIndexHTML = fs.readFileSync(costIndexPath, 'utf8');

    // Generate new city cards
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

    // Insert new city cards before the closing city-grid div
    costIndexHTML = costIndexHTML.replace(
        '                </div>\n            </div>\n        </div>\n    </article>',
        newCityCards + '\n                </div>\n            </div>\n        </div>\n    </article>'
    );

    // Update text to reflect 100 cities
    costIndexHTML = costIndexHTML.replace(
        /across 50 major US cities/g,
        'across 100 major US metro areas'
    );
    costIndexHTML = costIndexHTML.replace(
        /across 50 major US metro areas/g,
        'across 100 major US metro areas'
    );
    costIndexHTML = costIndexHTML.replace(
        '50 major US metro areas',
        '100 major US metro areas'
    );

    fs.writeFileSync(costIndexPath, costIndexHTML);
    console.log('✅  Updated /cost/index.html with 50 new city cards\n');

    console.log(`\n🎉  Done! Generated ${pageCount} pages total.`);
    console.log(`   ${NEW_CITIES.length} city index pages + ${NEW_CITIES.length * SERVICES.length} service pages`);
}

build();
