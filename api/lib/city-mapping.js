// Ecostify City-to-Metro Mapping
// Maps each Ecostify city slug to its official BLS metro area name and code
// Used for data citations in estimate results

module.exports = {
  // ── Batch 1 ──
  houston:       { display: "Houston, TX",       bls_metro_code: "26420", bls_metro_name: "Houston-The Woodlands-Sugar Land, TX",       state: "TX" },
  "los-angeles": { display: "Los Angeles, CA",   bls_metro_code: "31080", bls_metro_name: "Los Angeles-Long Beach-Anaheim, CA",         state: "CA" },
  chicago:       { display: "Chicago, IL",       bls_metro_code: "16980", bls_metro_name: "Chicago-Naperville-Elgin, IL-IN-WI",         state: "IL" },
  phoenix:       { display: "Phoenix, AZ",       bls_metro_code: "38060", bls_metro_name: "Phoenix-Mesa-Chandler, AZ",                  state: "AZ" },
  philadelphia:  { display: "Philadelphia, PA",  bls_metro_code: "37980", bls_metro_name: "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD", state: "PA" },
  "san-antonio": { display: "San Antonio, TX",   bls_metro_code: "41700", bls_metro_name: "San Antonio-New Braunfels, TX",              state: "TX" },
  dallas:        { display: "Dallas, TX",        bls_metro_code: "19100", bls_metro_name: "Dallas-Fort Worth-Arlington, TX",             state: "TX" },
  "san-diego":   { display: "San Diego, CA",     bls_metro_code: "41740", bls_metro_name: "San Diego-Chula Vista-Carlsbad, CA",         state: "CA" },
  denver:        { display: "Denver, CO",        bls_metro_code: "19740", bls_metro_name: "Denver-Aurora-Lakewood, CO",                  state: "CO" },
  miami:         { display: "Miami, FL",         bls_metro_code: "33100", bls_metro_name: "Miami-Fort Lauderdale-Pompano Beach, FL",     state: "FL" },

  // ── Batch 2 ──
  "new-york":    { display: "New York, NY",      bls_metro_code: "35620", bls_metro_name: "New York-Newark-Jersey City, NY-NJ-PA",      state: "NY" },
  atlanta:       { display: "Atlanta, GA",       bls_metro_code: "12060", bls_metro_name: "Atlanta-Sandy Springs-Alpharetta, GA",        state: "GA" },
  seattle:       { display: "Seattle, WA",       bls_metro_code: "42660", bls_metro_name: "Seattle-Tacoma-Bellevue, WA",                 state: "WA" },
  tampa:         { display: "Tampa, FL",         bls_metro_code: "45300", bls_metro_name: "Tampa-St. Petersburg-Clearwater, FL",         state: "FL" },
  minneapolis:   { display: "Minneapolis, MN",   bls_metro_code: "33460", bls_metro_name: "Minneapolis-St. Paul-Bloomington, MN-WI",    state: "MN" },
  charlotte:     { display: "Charlotte, NC",     bls_metro_code: "16740", bls_metro_name: "Charlotte-Concord-Gastonia, NC-SC",           state: "NC" },
  "las-vegas":   { display: "Las Vegas, NV",     bls_metro_code: "29820", bls_metro_name: "Las Vegas-Henderson-Paradise, NV",            state: "NV" },
  austin:        { display: "Austin, TX",        bls_metro_code: "12420", bls_metro_name: "Austin-Round Rock-Georgetown, TX",            state: "TX" },
  nashville:     { display: "Nashville, TN",     bls_metro_code: "34980", bls_metro_name: "Nashville-Davidson-Murfreesboro-Franklin, TN", state: "TN" },
  portland:      { display: "Portland, OR",      bls_metro_code: "38900", bls_metro_name: "Portland-Vancouver-Hillsboro, OR-WA",        state: "OR" },

  // ── Batch 3 ──
  "san-jose":      { display: "San Jose, CA",      bls_metro_code: "41940", bls_metro_name: "San Jose-Sunnyvale-Santa Clara, CA",       state: "CA" },
  jacksonville:    { display: "Jacksonville, FL",   bls_metro_code: "27260", bls_metro_name: "Jacksonville, FL",                         state: "FL" },
  indianapolis:    { display: "Indianapolis, IN",   bls_metro_code: "26900", bls_metro_name: "Indianapolis-Carmel-Anderson, IN",         state: "IN" },
  columbus:        { display: "Columbus, OH",       bls_metro_code: "18140", bls_metro_name: "Columbus, OH",                             state: "OH" },
  "san-francisco": { display: "San Francisco, CA",  bls_metro_code: "41860", bls_metro_name: "San Francisco-Oakland-Berkeley, CA",       state: "CA" },

  // ── Batch 4 ──
  detroit:            { display: "Detroit, MI",           bls_metro_code: "19820", bls_metro_name: "Detroit-Warren-Dearborn, MI",                    state: "MI" },
  baltimore:          { display: "Baltimore, MD",         bls_metro_code: "12580", bls_metro_name: "Baltimore-Columbia-Towson, MD",                  state: "MD" },
  memphis:            { display: "Memphis, TN",           bls_metro_code: "32820", bls_metro_name: "Memphis, TN-MS-AR",                              state: "TN" },
  louisville:         { display: "Louisville, KY",        bls_metro_code: "31140", bls_metro_name: "Louisville/Jefferson County, KY-IN",             state: "KY" },
  milwaukee:          { display: "Milwaukee, WI",         bls_metro_code: "33340", bls_metro_name: "Milwaukee-Waukesha, WI",                         state: "WI" },
  "oklahoma-city":    { display: "Oklahoma City, OK",     bls_metro_code: "36420", bls_metro_name: "Oklahoma City, OK",                              state: "OK" },
  tucson:             { display: "Tucson, AZ",            bls_metro_code: "46060", bls_metro_name: "Tucson, AZ",                                     state: "AZ" },
  raleigh:            { display: "Raleigh, NC",           bls_metro_code: "39580", bls_metro_name: "Raleigh-Cary, NC",                               state: "NC" },
  "kansas-city":      { display: "Kansas City, MO",       bls_metro_code: "28140", bls_metro_name: "Kansas City, MO-KS",                             state: "MO" },
  sacramento:         { display: "Sacramento, CA",        bls_metro_code: "40900", bls_metro_name: "Sacramento-Roseville-Folsom, CA",                state: "CA" },
  mesa:               { display: "Mesa, AZ",             bls_metro_code: "38060", bls_metro_name: "Phoenix-Mesa-Chandler, AZ",                      state: "AZ" },
  omaha:              { display: "Omaha, NE",            bls_metro_code: "36540", bls_metro_name: "Omaha-Council Bluffs, NE-IA",                     state: "NE" },
  "colorado-springs": { display: "Colorado Springs, CO",  bls_metro_code: "17820", bls_metro_name: "Colorado Springs, CO",                           state: "CO" },
  "virginia-beach":   { display: "Virginia Beach, VA",    bls_metro_code: "47260", bls_metro_name: "Virginia Beach-Norfolk-Newport News, VA-NC",     state: "VA" },
  marietta:           { display: "Marietta, GA",          bls_metro_code: "12060", bls_metro_name: "Atlanta-Sandy Springs-Alpharetta, GA",            state: "GA" },
  orlando:            { display: "Orlando, FL",           bls_metro_code: "36740", bls_metro_name: "Orlando-Kissimmee-Sanford, FL",                  state: "FL" },
  "fort-worth":       { display: "Fort Worth, TX",        bls_metro_code: "19100", bls_metro_name: "Dallas-Fort Worth-Arlington, TX",                state: "TX" },
  arlington:          { display: "Arlington, TX",         bls_metro_code: "19100", bls_metro_name: "Dallas-Fort Worth-Arlington, TX",                state: "TX" },
  "new-orleans":      { display: "New Orleans, LA",       bls_metro_code: "35380", bls_metro_name: "New Orleans-Metairie, LA",                       state: "LA" },
  bakersfield:        { display: "Bakersfield, CA",       bls_metro_code: "12540", bls_metro_name: "Bakersfield, CA",                                state: "CA" },
  honolulu:           { display: "Honolulu, HI",          bls_metro_code: "46520", bls_metro_name: "Urban Honolulu, HI",                             state: "HI" },
  albuquerque:        { display: "Albuquerque, NM",       bls_metro_code: "10740", bls_metro_name: "Albuquerque, NM",                                state: "NM" },
  pittsburgh:         { display: "Pittsburgh, PA",        bls_metro_code: "38300", bls_metro_name: "Pittsburgh, PA",                                 state: "PA" },
  cincinnati:         { display: "Cincinnati, OH",        bls_metro_code: "17140", bls_metro_name: "Cincinnati, OH-KY-IN",                           state: "OH" },
  "st-louis":         { display: "St. Louis, MO",        bls_metro_code: "41180", bls_metro_name: "St. Louis, MO-IL",                               state: "MO" },

  // ── Batch 5 ──
  richmond:           { display: "Richmond, VA",         bls_metro_code: "40060", bls_metro_name: "Richmond, VA",                                    state: "VA" },
  "salt-lake-city":   { display: "Salt Lake City, UT",   bls_metro_code: "41620", bls_metro_name: "Salt Lake City-Murray, UT",                       state: "UT" },
  birmingham:         { display: "Birmingham, AL",       bls_metro_code: "13820", bls_metro_name: "Birmingham-Hoover, AL",                           state: "AL" },
  wichita:            { display: "Wichita, KS",          bls_metro_code: "48620", bls_metro_name: "Wichita, KS",                                     state: "KS" },
  madison:            { display: "Madison, WI",          bls_metro_code: "31540", bls_metro_name: "Madison, WI",                                     state: "WI" },
  "baton-rouge":      { display: "Baton Rouge, LA",      bls_metro_code: "12940", bls_metro_name: "Baton Rouge, LA",                                 state: "LA" },
  "grand-rapids":     { display: "Grand Rapids, MI",     bls_metro_code: "24340", bls_metro_name: "Grand Rapids-Wyoming-Kentwood, MI",               state: "MI" },
  columbia:           { display: "Columbia, SC",         bls_metro_code: "17900", bls_metro_name: "Columbia, SC",                                    state: "SC" },
  hartford:           { display: "Hartford, CT",         bls_metro_code: "25540", bls_metro_name: "Hartford-West Hartford-East Hartford, CT",        state: "CT" },
  buffalo:            { display: "Buffalo, NY",          bls_metro_code: "15380", bls_metro_name: "Buffalo-Cheektowaga, NY",                         state: "NY" },

  // ── Batch 6 ──
  huntsville:         { display: "Huntsville, AL",       bls_metro_code: "26620", bls_metro_name: "Huntsville, AL",                                  state: "AL" },
  akron:              { display: "Akron, OH",            bls_metro_code: "10420", bls_metro_name: "Akron, OH",                                       state: "OH" },
  rochester:          { display: "Rochester, NY",        bls_metro_code: "40380", bls_metro_name: "Rochester, NY",                                   state: "NY" },
  providence:         { display: "Providence, RI",       bls_metro_code: "39300", bls_metro_name: "Providence-Warwick, RI-MA",                       state: "RI" },
  worcester:          { display: "Worcester, MA",        bls_metro_code: "49340", bls_metro_name: "Worcester, MA-CT",                                state: "MA" },
  knoxville:          { display: "Knoxville, TN",        bls_metro_code: "28940", bls_metro_name: "Knoxville, TN",                                   state: "TN" },
  boise:              { display: "Boise, ID",            bls_metro_code: "14260", bls_metro_name: "Boise City, ID",                                  state: "ID" },
  greensboro:         { display: "Greensboro, NC",       bls_metro_code: "24660", bls_metro_name: "Greensboro-High Point, NC",                       state: "NC" },
  tulsa:              { display: "Tulsa, OK",            bls_metro_code: "46140", bls_metro_name: "Tulsa, OK",                                       state: "OK" },
  dayton:             { display: "Dayton, OH",           bls_metro_code: "19380", bls_metro_name: "Dayton-Kettering-Beavercreek, OH",                state: "OH" },

  // ── Batch 7 ──
  "el-paso":          { display: "El Paso, TX",          bls_metro_code: "21340", bls_metro_name: "El Paso, TX",                                     state: "TX" },
  ogden:              { display: "Ogden, UT",            bls_metro_code: "36260", bls_metro_name: "Ogden-Clearfield, UT",                            state: "UT" },
  fresno:             { display: "Fresno, CA",           bls_metro_code: "23420", bls_metro_name: "Fresno, CA",                                      state: "CA" },
  stockton:           { display: "Stockton, CA",         bls_metro_code: "44700", bls_metro_name: "Stockton-Lodi, CA",                               state: "CA" },
  provo:              { display: "Provo, UT",            bls_metro_code: "39340", bls_metro_name: "Provo-Orem-Lehi, UT",                             state: "UT" },
  anchorage:          { display: "Anchorage, AK",        bls_metro_code: "11260", bls_metro_name: "Anchorage, AK",                                   state: "AK" },
  "des-moines":       { display: "Des Moines, IA",       bls_metro_code: "19780", bls_metro_name: "Des Moines-West Des Moines, IA",                  state: "IA" },
  "little-rock":      { display: "Little Rock, AR",      bls_metro_code: "30780", bls_metro_name: "Little Rock-North Little Rock-Conway, AR",        state: "AR" },
  spokane:            { display: "Spokane, WA",          bls_metro_code: "44060", bls_metro_name: "Spokane-Spokane Valley, WA",                      state: "WA" },
  lexington:          { display: "Lexington, KY",        bls_metro_code: "30460", bls_metro_name: "Lexington-Fayette, KY",                           state: "KY" },

  // ── Batch 8 ──
  sarasota:           { display: "Sarasota, FL",         bls_metro_code: "35840", bls_metro_name: "North Port-Bradenton-Sarasota, FL",               state: "FL" },
  "cape-coral":       { display: "Cape Coral, FL",       bls_metro_code: "15980", bls_metro_name: "Cape Coral-Fort Myers, FL",                       state: "FL" },
  lakeland:           { display: "Lakeland, FL",         bls_metro_code: "29460", bls_metro_name: "Lakeland-Winter Haven, FL",                       state: "FL" },
  "daytona-beach":    { display: "Daytona Beach, FL",    bls_metro_code: "19660", bls_metro_name: "Deltona-Daytona Beach-Ormond Beach, FL",          state: "FL" },
  "palm-bay":         { display: "Palm Bay, FL",         bls_metro_code: "37340", bls_metro_name: "Palm Bay-Melbourne-Titusville, FL",               state: "FL" },
  chattanooga:        { display: "Chattanooga, TN",      bls_metro_code: "16860", bls_metro_name: "Chattanooga, TN-GA",                              state: "TN" },
  savannah:           { display: "Savannah, GA",         bls_metro_code: "42340", bls_metro_name: "Savannah, GA",                                    state: "GA" },
  charleston:         { display: "Charleston, SC",       bls_metro_code: "16700", bls_metro_name: "Charleston-North Charleston, SC",                  state: "SC" },
  greenville:         { display: "Greenville, SC",       bls_metro_code: "24860", bls_metro_name: "Greenville-Anderson-Greer, SC",                   state: "SC" },
  asheville:          { display: "Asheville, NC",        bls_metro_code: "11700", bls_metro_name: "Asheville, NC",                                   state: "NC" },

  // ── Batch 9 ──
  reno:               { display: "Reno, NV",             bls_metro_code: "39900", bls_metro_name: "Reno, NV",                                        state: "NV" },
  tallahassee:        { display: "Tallahassee, FL",      bls_metro_code: "45220", bls_metro_name: "Tallahassee, FL",                                  state: "FL" },
  pensacola:          { display: "Pensacola, FL",        bls_metro_code: "37860", bls_metro_name: "Pensacola-Ferry Pass-Brent, FL",                   state: "FL" },
  "fayetteville-ar":  { display: "Fayetteville, AR",     bls_metro_code: "22220", bls_metro_name: "Fayetteville-Springdale-Rogers, AR",               state: "AR" },
  augusta:            { display: "Augusta, GA",          bls_metro_code: "12260", bls_metro_name: "Augusta-Richmond County, GA-SC",                   state: "GA" },
  harrisburg:         { display: "Harrisburg, PA",       bls_metro_code: "25420", bls_metro_name: "Harrisburg-Carlisle, PA",                          state: "PA" },
  syracuse:           { display: "Syracuse, NY",         bls_metro_code: "45060", bls_metro_name: "Syracuse, NY",                                     state: "NY" },
  "wilmington-nc":    { display: "Wilmington, NC",       bls_metro_code: "48900", bls_metro_name: "Wilmington, NC",                                   state: "NC" },
  jackson:            { display: "Jackson, MS",          bls_metro_code: "27140", bls_metro_name: "Jackson, MS",                                      state: "MS" },
  "springfield-mo":   { display: "Springfield, MO",      bls_metro_code: "44180", bls_metro_name: "Springfield, MO",                                   state: "MO" },

  // ── National fallback ──
  _national:          { display: "National Average",     bls_metro_code: "0",     bls_metro_name: "National",                                       state: "US" }
};
