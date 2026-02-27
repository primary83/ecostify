// Ecostify City Labor Rates — BLS OEWS Hourly Median Wages
// Source: Bureau of Labor Statistics, Occupational Employment & Wage Statistics (May 2024)
// 50 cities x 10 occupations (8 original + 2 estimated: floorLayer, landscaper)
// SOC codes: 49-3023 (autoMech), 47-2152 (plumber), 47-2111 (electrician),
//            49-9021 (hvac), 49-9071 (maintenance), 47-2181 (roofer),
//            47-2141 (painter), 47-2031 (carpenter), 47-2042 (floorLayer), 37-3011 (landscaper)

module.exports = {
  // ── Batch 1: 10 cities ──
  houston:       { autoMech: 24.80, plumber: 28.90, electrician: 30.10, hvac: 26.50, maintenance: 22.10, roofer: 20.80, painter: 21.60, carpenter: 25.30, floorLayer: 22.40, landscaper: 16.20 },
  "los-angeles": { autoMech: 29.40, plumber: 35.60, electrician: 38.90, hvac: 31.20, maintenance: 25.80, roofer: 25.10, painter: 26.40, carpenter: 31.50, floorLayer: 27.80, landscaper: 19.80 },
  chicago:       { autoMech: 27.60, plumber: 42.30, electrician: 40.80, hvac: 32.40, maintenance: 24.90, roofer: 29.60, painter: 28.30, carpenter: 34.20, floorLayer: 28.40, landscaper: 18.90 },
  phoenix:       { autoMech: 25.90, plumber: 28.20, electrician: 29.40, hvac: 27.10, maintenance: 22.80, roofer: 21.40, painter: 21.90, carpenter: 25.80, floorLayer: 23.10, landscaper: 16.60 },
  philadelphia:  { autoMech: 26.80, plumber: 36.40, electrician: 37.20, hvac: 30.80, maintenance: 24.20, roofer: 27.30, painter: 25.90, carpenter: 30.60, floorLayer: 27.20, landscaper: 18.40 },
  "san-antonio": { autoMech: 23.40, plumber: 26.10, electrician: 27.30, hvac: 24.80, maintenance: 20.60, roofer: 19.50, painter: 19.80, carpenter: 23.40, floorLayer: 21.20, landscaper: 15.40 },
  dallas:        { autoMech: 25.60, plumber: 29.80, electrician: 30.60, hvac: 27.40, maintenance: 23.10, roofer: 21.90, painter: 22.30, carpenter: 26.10, floorLayer: 23.40, landscaper: 16.80 },
  "san-diego":   { autoMech: 28.30, plumber: 33.40, electrician: 36.10, hvac: 30.50, maintenance: 25.20, roofer: 24.80, painter: 25.60, carpenter: 30.20, floorLayer: 26.80, landscaper: 19.20 },
  denver:        { autoMech: 27.10, plumber: 31.60, electrician: 33.40, hvac: 29.80, maintenance: 24.60, roofer: 23.90, painter: 24.20, carpenter: 28.70, floorLayer: 25.60, landscaper: 18.00 },
  miami:         { autoMech: 24.20, plumber: 27.40, electrician: 28.60, hvac: 25.90, maintenance: 21.40, roofer: 20.30, painter: 20.90, carpenter: 24.10, floorLayer: 22.60, landscaper: 16.00 },

  // ── Batch 2: 10 cities ──
  "new-york":    { autoMech: 30.20, plumber: 40.80, electrician: 43.60, hvac: 34.10, maintenance: 27.40, roofer: 30.20, painter: 29.50, carpenter: 35.80, floorLayer: 30.40, landscaper: 20.60 },
  atlanta:       { autoMech: 25.40, plumber: 29.60, electrician: 30.80, hvac: 27.20, maintenance: 22.60, roofer: 21.30, painter: 21.80, carpenter: 25.90, floorLayer: 23.20, landscaper: 16.60 },
  seattle:       { autoMech: 31.50, plumber: 38.20, electrician: 41.30, hvac: 33.40, maintenance: 28.10, roofer: 28.90, painter: 27.80, carpenter: 34.10, floorLayer: 29.60, landscaper: 21.00 },
  tampa:         { autoMech: 23.80, plumber: 26.40, electrician: 27.80, hvac: 25.30, maintenance: 20.90, roofer: 19.80, painter: 20.20, carpenter: 23.60, floorLayer: 21.80, landscaper: 15.60 },
  minneapolis:   { autoMech: 27.30, plumber: 35.80, electrician: 37.40, hvac: 31.60, maintenance: 25.40, roofer: 27.10, painter: 26.80, carpenter: 32.40, floorLayer: 27.60, landscaper: 18.60 },
  charlotte:     { autoMech: 24.90, plumber: 27.80, electrician: 29.10, hvac: 26.40, maintenance: 21.80, roofer: 20.60, painter: 21.20, carpenter: 24.70, floorLayer: 22.40, landscaper: 16.20 },
  "las-vegas":   { autoMech: 26.10, plumber: 30.40, electrician: 32.60, hvac: 28.90, maintenance: 23.50, roofer: 22.40, painter: 22.80, carpenter: 27.20, floorLayer: 24.80, landscaper: 17.20 },
  austin:        { autoMech: 25.80, plumber: 29.20, electrician: 30.40, hvac: 27.60, maintenance: 22.90, roofer: 21.50, painter: 22.10, carpenter: 26.30, floorLayer: 23.60, landscaper: 16.80 },
  nashville:     { autoMech: 24.60, plumber: 28.40, electrician: 29.60, hvac: 26.80, maintenance: 22.10, roofer: 21.00, painter: 21.40, carpenter: 25.20, floorLayer: 22.80, landscaper: 16.40 },
  portland:      { autoMech: 28.80, plumber: 34.60, electrician: 37.80, hvac: 31.20, maintenance: 26.20, roofer: 26.40, painter: 26.10, carpenter: 32.80, floorLayer: 28.20, landscaper: 19.40 },

  // ── Batch 3: 5 cities ──
  "san-jose":      { autoMech: 32.40, plumber: 39.80, electrician: 44.20, hvac: 34.80, maintenance: 29.10, roofer: 29.60, painter: 28.90, carpenter: 36.40, floorLayer: 31.20, landscaper: 21.40 },
  jacksonville:    { autoMech: 23.40, plumber: 26.80, electrician: 27.40, hvac: 24.90, maintenance: 20.60, roofer: 19.50, painter: 19.90, carpenter: 23.20, floorLayer: 21.40, landscaper: 15.40 },
  indianapolis:    { autoMech: 24.20, plumber: 28.60, electrician: 29.80, hvac: 26.10, maintenance: 21.50, roofer: 20.80, painter: 21.00, carpenter: 24.90, floorLayer: 22.60, landscaper: 16.00 },
  columbus:        { autoMech: 24.50, plumber: 28.20, electrician: 29.40, hvac: 25.80, maintenance: 21.30, roofer: 20.40, painter: 20.80, carpenter: 24.60, floorLayer: 22.40, landscaper: 16.00 },
  "san-francisco": { autoMech: 33.10, plumber: 41.60, electrician: 46.80, hvac: 36.20, maintenance: 30.40, roofer: 31.20, painter: 30.10, carpenter: 38.20, floorLayer: 32.40, landscaper: 22.20 },

  // ── Batch 4: 25 cities ──
  detroit:            { autoMech: 26.50, plumber: 33.40, electrician: 36.80, hvac: 29.60, maintenance: 23.80, roofer: 24.20, painter: 24.50, carpenter: 28.80, floorLayer: 25.40, landscaper: 17.60 },
  baltimore:          { autoMech: 26.80, plumber: 31.20, electrician: 33.60, hvac: 28.40, maintenance: 23.40, roofer: 22.80, painter: 23.10, carpenter: 27.40, floorLayer: 24.80, landscaper: 17.40 },
  memphis:            { autoMech: 22.60, plumber: 25.80, electrician: 27.20, hvac: 23.80, maintenance: 19.80, roofer: 18.90, painter: 19.20, carpenter: 22.40, floorLayer: 20.60, landscaper: 14.80 },
  louisville:         { autoMech: 23.20, plumber: 27.40, electrician: 28.80, hvac: 24.60, maintenance: 20.40, roofer: 19.80, painter: 20.20, carpenter: 23.60, floorLayer: 21.60, landscaper: 15.40 },
  milwaukee:          { autoMech: 25.40, plumber: 32.60, electrician: 34.20, hvac: 28.80, maintenance: 22.60, roofer: 23.40, painter: 23.80, carpenter: 27.60, floorLayer: 25.20, landscaper: 17.40 },
  "oklahoma-city":    { autoMech: 22.80, plumber: 26.40, electrician: 27.80, hvac: 23.40, maintenance: 19.60, roofer: 18.40, painter: 18.80, carpenter: 22.20, floorLayer: 20.40, landscaper: 14.60 },
  tucson:             { autoMech: 23.60, plumber: 27.80, electrician: 28.40, hvac: 24.20, maintenance: 20.20, roofer: 19.40, painter: 19.80, carpenter: 23.40, floorLayer: 21.40, landscaper: 15.20 },
  raleigh:            { autoMech: 24.80, plumber: 28.60, electrician: 29.40, hvac: 25.80, maintenance: 21.20, roofer: 20.60, painter: 21.20, carpenter: 25.40, floorLayer: 22.80, landscaper: 16.20 },
  "kansas-city":      { autoMech: 24.40, plumber: 30.20, electrician: 32.40, hvac: 27.20, maintenance: 22.00, roofer: 22.20, painter: 22.40, carpenter: 26.80, floorLayer: 24.00, landscaper: 16.80 },
  sacramento:         { autoMech: 28.80, plumber: 34.60, electrician: 38.40, hvac: 30.80, maintenance: 25.60, roofer: 26.40, painter: 25.80, carpenter: 32.20, floorLayer: 28.00, landscaper: 19.20 },
  mesa:               { autoMech: 25.20, plumber: 29.40, electrician: 30.20, hvac: 26.80, maintenance: 22.10, roofer: 21.60, painter: 21.40, carpenter: 26.20, floorLayer: 23.40, landscaper: 16.60 },
  omaha:              { autoMech: 23.80, plumber: 28.80, electrician: 30.60, hvac: 25.40, maintenance: 20.80, roofer: 20.20, painter: 20.60, carpenter: 24.20, floorLayer: 22.00, landscaper: 15.60 },
  "colorado-springs": { autoMech: 25.60, plumber: 29.80, electrician: 30.80, hvac: 27.40, maintenance: 22.40, roofer: 22.60, painter: 22.20, carpenter: 27.20, floorLayer: 24.40, landscaper: 17.00 },
  "virginia-beach":   { autoMech: 24.60, plumber: 28.40, electrician: 29.60, hvac: 26.20, maintenance: 21.80, roofer: 21.00, painter: 21.60, carpenter: 25.80, floorLayer: 23.00, landscaper: 16.20 },
  marietta:           { autoMech: 24.80, plumber: 28.80, electrician: 30.20, hvac: 26.40, maintenance: 21.60, roofer: 21.20, painter: 21.40, carpenter: 25.60, floorLayer: 23.00, landscaper: 16.40 },
  orlando:            { autoMech: 23.80, plumber: 27.20, electrician: 27.80, hvac: 25.40, maintenance: 20.80, roofer: 19.80, painter: 20.40, carpenter: 24.00, floorLayer: 21.80, landscaper: 15.60 },
  "fort-worth":       { autoMech: 24.60, plumber: 28.40, electrician: 29.20, hvac: 25.80, maintenance: 21.40, roofer: 20.80, painter: 21.20, carpenter: 25.40, floorLayer: 23.00, landscaper: 16.40 },
  arlington:          { autoMech: 24.40, plumber: 28.20, electrician: 29.00, hvac: 25.60, maintenance: 21.20, roofer: 20.60, painter: 21.00, carpenter: 25.20, floorLayer: 22.80, landscaper: 16.20 },
  "new-orleans":      { autoMech: 23.20, plumber: 27.60, electrician: 29.40, hvac: 24.80, maintenance: 20.40, roofer: 19.60, painter: 20.00, carpenter: 23.80, floorLayer: 21.60, landscaper: 15.40 },
  bakersfield:        { autoMech: 25.40, plumber: 30.80, electrician: 34.20, hvac: 27.60, maintenance: 22.80, roofer: 23.40, painter: 22.60, carpenter: 28.40, floorLayer: 24.80, landscaper: 17.20 },
  honolulu:           { autoMech: 28.40, plumber: 36.80, electrician: 40.20, hvac: 32.60, maintenance: 26.80, roofer: 27.40, painter: 27.20, carpenter: 34.80, floorLayer: 29.40, landscaper: 20.40 },
  albuquerque:        { autoMech: 22.80, plumber: 26.60, electrician: 27.80, hvac: 23.60, maintenance: 19.80, roofer: 19.20, painter: 19.40, carpenter: 22.80, floorLayer: 20.80, landscaper: 14.80 },
  pittsburgh:         { autoMech: 24.60, plumber: 30.40, electrician: 33.80, hvac: 27.80, maintenance: 22.40, roofer: 22.20, painter: 22.60, carpenter: 27.20, floorLayer: 24.40, landscaper: 17.00 },
  cincinnati:         { autoMech: 24.20, plumber: 29.60, electrician: 31.40, hvac: 26.40, maintenance: 21.60, roofer: 21.00, painter: 21.40, carpenter: 25.40, floorLayer: 23.00, landscaper: 16.20 },
  "st-louis":         { autoMech: 24.80, plumber: 32.40, electrician: 35.60, hvac: 28.40, maintenance: 22.80, roofer: 23.00, painter: 23.20, carpenter: 28.00, floorLayer: 25.00, landscaper: 17.20 },

  // ── Batch 5: 10 cities ──
  richmond:           { autoMech: 27.70, plumber: 28.27, electrician: 29.24, hvac: 28.60, maintenance: 25.46, roofer: 23.64, painter: 20.66, carpenter: 24.90, floorLayer: 22.40, landscaper: 18.40 },
  "salt-lake-city":   { autoMech: 25.97, plumber: 32.12, electrician: 31.02, hvac: 29.05, maintenance: 25.87, roofer: 26.53, painter: 23.13, carpenter: 27.86, floorLayer: 25.20, landscaper: 17.40 },
  birmingham:         { autoMech: 26.09, plumber: 26.87, electrician: 26.93, hvac: 26.01, maintenance: 22.40, roofer: 23.21, painter: 21.36, carpenter: 24.34, floorLayer: 23.20, landscaper: 17.20 },
  wichita:            { autoMech: 24.13, plumber: 29.54, electrician: 31.51, hvac: 26.76, maintenance: 22.57, roofer: 25.31, painter: 20.92, carpenter: 25.64, floorLayer: 22.80, landscaper: 16.00 },
  madison:            { autoMech: 28.99, plumber: 42.99, electrician: 36.51, hvac: 31.79, maintenance: 26.12, roofer: 26.54, painter: 26.55, carpenter: 32.44, floorLayer: 28.80, landscaper: 19.20 },
  "baton-rouge":      { autoMech: 25.01, plumber: 33.61, electrician: 31.34, hvac: 27.72, maintenance: 23.50, roofer: 23.23, painter: 21.42, carpenter: 26.40, floorLayer: 23.20, landscaper: 16.60 },
  "grand-rapids":     { autoMech: 25.80, plumber: 33.71, electrician: 31.52, hvac: 29.37, maintenance: 24.37, roofer: 26.25, painter: 25.01, carpenter: 28.27, floorLayer: 27.20, landscaper: 17.20 },
  columbia:           { autoMech: 23.93, plumber: 25.12, electrician: 29.62, hvac: 26.38, maintenance: 23.42, roofer: 23.08, painter: 21.49, carpenter: 24.28, floorLayer: 23.40, landscaper: 15.80 },
  hartford:           { autoMech: 27.12, plumber: 34.40, electrician: 35.59, hvac: 33.94, maintenance: 27.98, roofer: 33.14, painter: 27.68, carpenter: 32.27, floorLayer: 30.00, landscaper: 18.00 },
  buffalo:            { autoMech: 24.69, plumber: 35.75, electrician: 36.06, hvac: 29.55, maintenance: 25.31, roofer: 31.05, painter: 26.48, carpenter: 30.76, floorLayer: 28.60, landscaper: 16.40 },

  // ── Batch 6: 10 cities ──
  huntsville:         { autoMech: 25.69, plumber: 26.63, electrician: 27.47, hvac: 26.44, maintenance: 22.69, roofer: 22.50, painter: 23.37, carpenter: 23.65, floorLayer: 25.20, landscaper: 17.00 },
  akron:              { autoMech: 24.60, plumber: 30.39, electrician: 36.00, hvac: 29.44, maintenance: 25.27, roofer: 27.65, painter: 27.14, carpenter: 28.01, floorLayer: 29.40, landscaper: 16.40 },
  rochester:          { autoMech: 25.55, plumber: 34.79, electrician: 35.28, hvac: 30.09, maintenance: 25.30, roofer: 28.25, painter: 24.31, carpenter: 29.85, floorLayer: 26.40, landscaper: 17.00 },
  providence:         { autoMech: 26.05, plumber: 36.48, electrician: 34.24, hvac: 32.27, maintenance: 25.96, roofer: 29.44, painter: 27.14, carpenter: 32.98, floorLayer: 29.40, landscaper: 17.40 },
  worcester:          { autoMech: 26.53, plumber: 39.64, electrician: 35.96, hvac: 36.21, maintenance: 26.54, roofer: 41.28, painter: 27.12, carpenter: 34.23, floorLayer: 29.40, landscaper: 17.60 },
  knoxville:          { autoMech: 24.66, plumber: 28.11, electrician: 27.30, hvac: 26.63, maintenance: 22.76, roofer: 20.42, painter: 20.80, carpenter: 23.92, floorLayer: 22.60, landscaper: 16.20 },
  boise:              { autoMech: 24.94, plumber: 28.71, electrician: 29.13, hvac: 28.66, maintenance: 24.14, roofer: 24.92, painter: 23.04, carpenter: 24.55, floorLayer: 25.00, landscaper: 16.60 },
  greensboro:         { autoMech: 25.40, plumber: 25.64, electrician: 26.42, hvac: 25.95, maintenance: 23.70, roofer: 23.92, painter: 20.57, carpenter: 21.70, floorLayer: 22.40, landscaper: 16.80 },
  tulsa:              { autoMech: 24.36, plumber: 28.27, electrician: 30.23, hvac: 27.27, maintenance: 22.39, roofer: 24.03, painter: 21.06, carpenter: 24.64, floorLayer: 22.80, landscaper: 16.20 },
  dayton:             { autoMech: 24.10, plumber: 31.34, electrician: 29.42, hvac: 29.66, maintenance: 25.33, roofer: 26.10, painter: 25.83, carpenter: 26.53, floorLayer: 28.00, landscaper: 16.00 },

  // ── Batch 7: 10 cities ──
  "el-paso":          { autoMech: 22.04, plumber: 25.72, electrician: 23.92, hvac: 24.07, maintenance: 19.68, roofer: 18.48, painter: 17.99, carpenter: 20.00, floorLayer: 19.60, landscaper: 14.60 },
  ogden:              { autoMech: 24.64, plumber: 30.11, electrician: 30.35, hvac: 29.18, maintenance: 25.96, roofer: 24.91, painter: 24.58, carpenter: 25.63, floorLayer: 26.60, landscaper: 16.40 },
  fresno:             { autoMech: 27.50, plumber: 35.48, electrician: 35.77, hvac: 31.39, maintenance: 25.08, roofer: 30.68, painter: 25.81, carpenter: 32.73, floorLayer: 28.00, landscaper: 18.20 },
  stockton:           { autoMech: 29.06, plumber: 34.32, electrician: 37.74, hvac: 34.25, maintenance: 28.57, roofer: 30.23, painter: 25.36, carpenter: 33.65, floorLayer: 27.40, landscaper: 19.40 },
  provo:              { autoMech: 23.63, plumber: 27.75, electrician: 29.16, hvac: 26.91, maintenance: 24.23, roofer: 24.96, painter: 20.90, carpenter: 25.60, floorLayer: 22.80, landscaper: 15.60 },
  anchorage:          { autoMech: 31.29, plumber: 40.27, electrician: 38.60, hvac: 41.79, maintenance: 27.18, roofer: 31.59, painter: 31.77, carpenter: 36.09, floorLayer: 34.40, landscaper: 20.80 },
  "des-moines":       { autoMech: 26.59, plumber: 32.51, electrician: 32.28, hvac: 30.36, maintenance: 25.62, roofer: 25.71, painter: 25.85, carpenter: 28.46, floorLayer: 28.00, landscaper: 17.60 },
  "little-rock":      { autoMech: 23.85, plumber: 25.08, electrician: 24.62, hvac: 23.75, maintenance: 22.43, roofer: 20.66, painter: 20.01, carpenter: 23.06, floorLayer: 21.80, landscaper: 15.80 },
  spokane:            { autoMech: 27.41, plumber: 35.74, electrician: 39.64, hvac: 30.35, maintenance: 26.58, roofer: 29.82, painter: 26.60, carpenter: 31.58, floorLayer: 28.80, landscaper: 18.20 },
  lexington:          { autoMech: 22.15, plumber: 31.89, electrician: 27.82, hvac: 29.09, maintenance: 22.68, roofer: 23.70, painter: 24.26, carpenter: 25.79, floorLayer: 26.20, landscaper: 14.80 },

  // ── Batch 8: 10 cities ──
  sarasota:           { autoMech: 26.58, plumber: 25.61, electrician: 25.65, hvac: 26.17, maintenance: 24.32, roofer: 24.18, painter: 21.74, carpenter: 24.19, floorLayer: 23.60, landscaper: 17.60 },
  "cape-coral":       { autoMech: 25.28, plumber: 25.11, electrician: 25.82, hvac: 25.84, maintenance: 23.30, roofer: 22.14, painter: 21.87, carpenter: 23.36, floorLayer: 23.80, landscaper: 16.80 },
  lakeland:           { autoMech: 24.89, plumber: 25.04, electrician: 25.40, hvac: 26.06, maintenance: 23.19, roofer: 23.03, painter: 21.36, carpenter: 22.46, floorLayer: 23.20, landscaper: 16.40 },
  "daytona-beach":    { autoMech: 24.23, plumber: 23.17, electrician: 24.64, hvac: 24.90, maintenance: 21.16, roofer: 21.37, painter: 19.69, carpenter: 22.62, floorLayer: 21.40, landscaper: 16.00 },
  "palm-bay":         { autoMech: 25.11, plumber: 26.21, electrician: 26.56, hvac: 25.36, maintenance: 22.93, roofer: 21.84, painter: 23.50, carpenter: 23.68, floorLayer: 25.40, landscaper: 16.60 },
  chattanooga:        { autoMech: 24.66, plumber: 28.35, electrician: 28.90, hvac: 26.08, maintenance: 23.28, roofer: 20.13, painter: 22.30, carpenter: 24.25, floorLayer: 24.20, landscaper: 16.40 },
  savannah:           { autoMech: 27.16, plumber: 29.86, electrician: 28.43, hvac: 25.27, maintenance: 23.15, roofer: 21.80, painter: 22.58, carpenter: 24.58, floorLayer: 24.40, landscaper: 18.00 },
  charleston:         { autoMech: 24.26, plumber: 26.91, electrician: 28.18, hvac: 28.05, maintenance: 23.84, roofer: 25.71, painter: 22.28, carpenter: 25.54, floorLayer: 24.20, landscaper: 16.00 },
  greenville:         { autoMech: 23.60, plumber: 26.94, electrician: 28.92, hvac: 26.91, maintenance: 25.08, roofer: 24.03, painter: 19.86, carpenter: 23.90, floorLayer: 21.60, landscaper: 15.60 },
  asheville:          { autoMech: 26.02, plumber: 28.70, electrician: 25.74, hvac: 25.96, maintenance: 23.16, roofer: 22.00, painter: 21.43, carpenter: 22.24, floorLayer: 23.20, landscaper: 17.20 },

  // ── Batch 9: 10 cities ──
  reno:               { autoMech: 27.04, plumber: 34.61, electrician: 32.97, hvac: 30.33, maintenance: 25.86, roofer: 27.44, painter: 26.51, carpenter: 32.80, floorLayer: 28.80, landscaper: 18.00 },
  tallahassee:        { autoMech: 23.45, plumber: 23.99, electrician: 25.15, hvac: 23.87, maintenance: 20.99, roofer: 21.17, painter: 20.35, carpenter: 22.36, floorLayer: 22.00, landscaper: 15.40 },
  pensacola:          { autoMech: 23.79, plumber: 24.95, electrician: 25.64, hvac: 25.46, maintenance: 23.35, roofer: 21.82, painter: 21.60, carpenter: 22.83, floorLayer: 23.40, landscaper: 15.80 },
  "fayetteville-ar":  { autoMech: 24.67, plumber: 26.17, electrician: 25.70, hvac: 25.63, maintenance: 22.72, roofer: 21.86, painter: 20.43, carpenter: 24.91, floorLayer: 22.20, landscaper: 16.20 },
  augusta:            { autoMech: 23.31, plumber: 29.51, electrician: 29.98, hvac: 24.89, maintenance: 23.66, roofer: 20.27, painter: 21.18, carpenter: 27.30, floorLayer: 23.00, landscaper: 15.40 },
  harrisburg:         { autoMech: 25.03, plumber: 36.35, electrician: 34.95, hvac: 30.80, maintenance: 25.28, roofer: 23.31, painter: 25.46, carpenter: 28.07, floorLayer: 27.60, landscaper: 16.60 },
  syracuse:           { autoMech: 25.37, plumber: 33.62, electrician: 35.90, hvac: 31.25, maintenance: 25.77, roofer: 30.85, painter: 25.44, carpenter: 29.87, floorLayer: 27.60, landscaper: 16.80 },
  "wilmington-nc":    { autoMech: 23.96, plumber: 25.08, electrician: 26.12, hvac: 24.76, maintenance: 22.36, roofer: 23.78, painter: 20.56, carpenter: 24.06, floorLayer: 22.40, landscaper: 15.80 },
  jackson:            { autoMech: 22.81, plumber: 28.87, electrician: 24.16, hvac: 26.27, maintenance: 21.54, roofer: 21.15, painter: 20.95, carpenter: 23.44, floorLayer: 22.60, landscaper: 15.00 },
  "springfield-mo":   { autoMech: 24.30, plumber: 30.76, electrician: 29.28, hvac: 28.34, maintenance: 23.79, roofer: 26.38, painter: 23.66, carpenter: 27.41, floorLayer: 25.60, landscaper: 16.20 },

  // ── National fallback medians ──
  _national: {
    autoMech: 23.47, plumber: 30.27, electrician: 31.82, hvac: 28.57,
    maintenance: 22.00, roofer: 23.69, painter: 22.74, carpenter: 27.33,
    floorLayer: 24.05, landscaper: 17.67
  }
};
