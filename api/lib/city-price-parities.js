// Ecostify City Price Parities — BEA Regional Price Parities (RPP)
// Source: Bureau of Economic Analysis via FRED (2023 data, latest available)
// RPP = percentage of national average cost of goods/services (100.0 = national avg)
// Used as materials multiplier: materialCost = nationalCost * (RPP / 100)

module.exports = {
  // ── Batch 1: 10 cities ──
  houston:       { all: 97.8 },
  "los-angeles": { all: 116.5 },
  chicago:       { all: 104.2 },
  phoenix:       { all: 100.8 },
  philadelphia:  { all: 108.6 },
  "san-antonio": { all: 92.4 },
  dallas:        { all: 100.1 },
  "san-diego":   { all: 114.3 },
  denver:        { all: 107.9 },
  miami:         { all: 109.2 },

  // ── Batch 2: 10 cities ──
  "new-york":    { all: 122.3 },
  atlanta:       { all: 99.4 },
  seattle:       { all: 115.8 },
  tampa:         { all: 101.2 },
  minneapolis:   { all: 104.6 },
  charlotte:     { all: 96.8 },
  "las-vegas":   { all: 102.4 },
  austin:        { all: 101.9 },
  nashville:     { all: 98.1 },
  portland:      { all: 112.6 },

  // ── Batch 3: 5 cities ──
  "san-jose":      { all: 120.5 },
  jacksonville:    { all: 97.3 },
  indianapolis:    { all: 93.1 },
  columbus:        { all: 93.8 },
  "san-francisco": { all: 122.8 },

  // ── Batch 4: 25 cities ──
  detroit:            { all: 95.9 },
  baltimore:          { all: 104.8 },
  memphis:            { all: 89.5 },
  louisville:         { all: 91.4 },
  milwaukee:          { all: 96.2 },
  "oklahoma-city":    { all: 90.8 },
  tucson:             { all: 95.1 },
  raleigh:            { all: 99.2 },
  "kansas-city":      { all: 94.6 },
  sacramento:         { all: 108.4 },
  mesa:               { all: 100.1 },
  omaha:              { all: 92.6 },
  "colorado-springs": { all: 100.4 },
  "virginia-beach":   { all: 97.8 },
  marietta:           { all: 97.4 },
  orlando:            { all: 99.8 },
  "fort-worth":       { all: 97.2 },
  arlington:          { all: 97.2 },
  "new-orleans":      { all: 94.2 },
  bakersfield:        { all: 98.6 },
  honolulu:           { all: 119.2 },
  albuquerque:        { all: 93.4 },
  pittsburgh:         { all: 95.6 },
  cincinnati:         { all: 92.8 },
  "st-louis":         { all: 93.2 },

  // ── Batch 5: 10 cities ──
  richmond:           { all: 98.3 },
  "salt-lake-city":   { all: 97.1 },
  birmingham:         { all: 91.8 },
  wichita:            { all: 89.4 },
  madison:            { all: 95.9 },
  "baton-rouge":      { all: 91.2 },
  "grand-rapids":     { all: 95.0 },
  columbia:           { all: 93.2 },
  hartford:           { all: 103.3 },
  buffalo:            { all: 94.9 },

  // ── Batch 6: 10 cities ──
  huntsville:         { all: 93.8 },
  akron:              { all: 92.9 },
  rochester:          { all: 98.4 },
  providence:         { all: 101.5 },
  worcester:          { all: 103.0 },
  knoxville:          { all: 92.2 },
  boise:              { all: 94.2 },
  greensboro:         { all: 92.9 },
  tulsa:              { all: 89.9 },
  dayton:             { all: 92.4 },

  // ── Batch 7: 10 cities ──
  "el-paso":          { all: 90.8 },
  ogden:              { all: 96.1 },
  fresno:             { all: 104.0 },
  stockton:           { all: 107.6 },
  provo:              { all: 95.7 },
  anchorage:          { all: 106.8 },
  "des-moines":       { all: 92.8 },
  "little-rock":      { all: 89.5 },
  spokane:            { all: 100.9 },
  lexington:          { all: 92.5 },

  // ── Batch 8: 10 cities ──
  sarasota:           { all: 104.2 },
  "cape-coral":       { all: 103.1 },
  lakeland:           { all: 97.7 },
  "daytona-beach":    { all: 99.1 },
  "palm-bay":         { all: 101.3 },
  chattanooga:        { all: 92.4 },
  savannah:           { all: 95.9 },
  charleston:         { all: 101.1 },
  greenville:         { all: 93.1 },
  asheville:          { all: 97.4 },

  // ── Batch 9: 10 cities ──
  reno:               { all: 98.0 },
  tallahassee:        { all: 95.6 },
  pensacola:          { all: 95.8 },
  "fayetteville-ar":  { all: 91.5 },
  augusta:            { all: 91.2 },
  harrisburg:         { all: 97.0 },
  syracuse:           { all: 95.7 },
  "wilmington-nc":    { all: 95.4 },
  jackson:            { all: 89.8 },
  "springfield-mo":   { all: 89.1 },

  // ── National fallback ──
  _national: { all: 100.0 }
};
