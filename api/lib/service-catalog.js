// Ecostify Service Catalog — ~46 services with structured pricing data
// Sources: BLS OEWS May 2024 national medians, industry labor time guides
// Each service has: labor hours by tier, material costs by tier, SOC code mapping,
// keyword matching array, confidence scoring factors

const SERVICE_CATALOG = {
  // ═══════════════════════════════════════════════════════════════
  //  AUTO SERVICES (22 services)
  // ═══════════════════════════════════════════════════════════════

  "auto-brake-pad-replacement": {
    id: "auto-brake-pad-replacement",
    category: "auto",
    name: "Brake Pad Replacement",
    keywords: ["brake pads", "brake pad", "brake replacement", "brakes", "brake job", "brake repair", "front brakes", "rear brakes", "brake pad replacement"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 1.0, mid_range: 2.0, premium: 3.0 },
    materials: {
      budget:    { low: 30,  high: 60 },
      mid_range: { low: 80,  high: 150 },
      premium:   { low: 150, high: 300 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.40, labor_pct: 0.55, fees_pct: 0.05 },
    tags: ["urgent", "partially_diy", "1_2_hours"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 20, common_service: 15, predictable_materials: 15 },
    sources: ["BLS OEWS May 2024", "Industry labor time guides"]
  },

  "auto-oil-change": {
    id: "auto-oil-change",
    category: "auto",
    name: "Oil Change",
    keywords: ["oil change", "oil", "synthetic oil", "conventional oil", "oil filter", "oil service", "oil change service"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 0.5, mid_range: 0.75, premium: 1.0 },
    materials: {
      budget:    { low: 25,  high: 40 },
      mid_range: { low: 40,  high: 70 },
      premium:   { low: 70,  high: 90 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.45, fees_pct: 0.05 },
    tags: ["routine", "diy_friendly", "under_1_hour"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 20, common_service: 15, predictable_materials: 15 },
    sources: ["BLS OEWS May 2024", "Industry labor time guides"]
  },

  "auto-car-wrap": {
    id: "auto-car-wrap",
    category: "auto",
    name: "Full Car Wrap",
    keywords: ["car wrap", "vehicle wrap", "vinyl wrap", "full wrap", "wrap", "color change wrap", "vehicle vinyl"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 15, mid_range: 25, premium: 40 },
    materials: {
      budget:    { low: 800,  high: 1200 },
      mid_range: { low: 1200, high: 2000 },
      premium:   { low: 2000, high: 3000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.40, fees_pct: 0.05 },
    tags: ["specialty", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-ceramic-coating": {
    id: "auto-ceramic-coating",
    category: "auto",
    name: "Ceramic Coating",
    keywords: ["ceramic coating", "ceramic", "paint protection", "nano coating", "ceramic coat"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 8, mid_range: 14, premium: 20 },
    materials: {
      budget:    { low: 100, high: 200 },
      mid_range: { low: 200, high: 350 },
      premium:   { low: 350, high: 500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.35, labor_pct: 0.60, fees_pct: 0.05 },
    tags: ["specialty", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-transmission-repair": {
    id: "auto-transmission-repair",
    category: "auto",
    name: "Transmission Repair",
    keywords: ["transmission", "transmission repair", "transmission rebuild", "transmission replacement", "trans repair", "gearbox"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 4, mid_range: 10, premium: 15 },
    materials: {
      budget:    { low: 300,  high: 800 },
      mid_range: { low: 800,  high: 2000 },
      premium:   { low: 2000, high: 3500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.45, fees_pct: 0.05 },
    tags: ["urgent", "expensive", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 10, predictable_materials: 5 },
    sources: ["BLS OEWS May 2024", "Industry labor time guides"]
  },

  "auto-window-tinting": {
    id: "auto-window-tinting",
    category: "auto",
    name: "Window Tinting",
    keywords: ["window tint", "tinting", "tint", "window tinting", "car tint", "auto tint"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 2, mid_range: 3, premium: 4 },
    materials: {
      budget:    { low: 80,  high: 150 },
      mid_range: { low: 150, high: 250 },
      premium:   { low: 250, high: 400 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.45, fees_pct: 0.05 },
    tags: ["specialty", "half_day"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-ev-charger": {
    id: "auto-ev-charger",
    category: "auto",
    name: "EV Charger Installation",
    keywords: ["ev charger", "electric vehicle charger", "level 2 charger", "ev charging", "charger installation", "home charger", "ev charger install"],
    bls_soc_code: "47-2111",
    occupation: "electrician",
    labor_hours: { budget: 3, mid_range: 5, premium: 8 },
    materials: {
      budget:    { low: 300,  high: 500 },
      mid_range: { low: 500,  high: 800 },
      premium:   { low: 800,  high: 1200 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.37, fees_pct: 0.08 },
    tags: ["electrical", "half_day"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-ac-repair": {
    id: "auto-ac-repair",
    category: "auto",
    name: "AC Repair & Recharge",
    keywords: ["ac repair", "ac recharge", "air conditioning", "car ac", "auto ac", "ac not working", "ac fix", "freon", "refrigerant"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 1, mid_range: 2.5, premium: 4 },
    materials: {
      budget:    { low: 50,  high: 150 },
      mid_range: { low: 150, high: 350 },
      premium:   { low: 350, high: 600 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.45, labor_pct: 0.50, fees_pct: 0.05 },
    tags: ["common", "seasonal"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 15, predictable_materials: 8 },
    sources: ["BLS OEWS May 2024", "Industry labor time guides"]
  },

  "auto-tire-replacement": {
    id: "auto-tire-replacement",
    category: "auto",
    name: "Tire Replacement",
    keywords: ["tires", "tire replacement", "new tires", "tire change", "tire install", "flat tire", "tire set"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 0.75, mid_range: 1.0, premium: 1.5 },
    materials: {
      budget:    { low: 200, high: 350 },
      mid_range: { low: 350, high: 600 },
      premium:   { low: 600, high: 1200 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.75, labor_pct: 0.20, fees_pct: 0.05 },
    tags: ["common", "safety"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 15, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-battery-replacement": {
    id: "auto-battery-replacement",
    category: "auto",
    name: "Battery Replacement",
    keywords: ["battery", "car battery", "battery replacement", "dead battery", "battery install", "new battery"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 0.25, mid_range: 0.5, premium: 1.0 },
    materials: {
      budget:    { low: 80,  high: 120 },
      mid_range: { low: 120, high: 200 },
      premium:   { low: 200, high: 350 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.75, labor_pct: 0.20, fees_pct: 0.05 },
    tags: ["common", "diy_friendly", "under_1_hour"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 20, common_service: 15, predictable_materials: 15 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-check-engine": {
    id: "auto-check-engine",
    category: "auto",
    name: "Check Engine Light Diagnosis",
    keywords: ["check engine", "check engine light", "engine light", "diagnostic", "engine diagnosis", "obd", "trouble code"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 0.5, mid_range: 1.0, premium: 2.0 },
    materials: {
      budget:    { low: 0,   high: 50 },
      mid_range: { low: 50,  high: 200 },
      premium:   { low: 200, high: 500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.30, labor_pct: 0.65, fees_pct: 0.05 },
    tags: ["common", "diagnostic"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 15, predictable_materials: 5 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-full-detail": {
    id: "auto-full-detail",
    category: "auto",
    name: "Full Car Detail",
    keywords: ["detail", "car detail", "full detail", "detailing", "auto detail", "interior detail", "exterior detail"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 2, mid_range: 4, premium: 8 },
    materials: {
      budget:    { low: 20,  high: 50 },
      mid_range: { low: 50,  high: 100 },
      premium:   { low: 100, high: 200 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.20, labor_pct: 0.75, fees_pct: 0.05 },
    tags: ["common", "cosmetic"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 15, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-alternator": {
    id: "auto-alternator",
    category: "auto",
    name: "Alternator Replacement",
    keywords: ["alternator", "alternator replacement", "charging system", "alternator repair"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 1.5, mid_range: 2.5, premium: 4.0 },
    materials: {
      budget:    { low: 150, high: 250 },
      mid_range: { low: 250, high: 400 },
      premium:   { low: 400, high: 600 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.40, fees_pct: 0.05 },
    tags: ["common", "electrical"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-starter-motor": {
    id: "auto-starter-motor",
    category: "auto",
    name: "Starter Motor Replacement",
    keywords: ["starter", "starter motor", "starter replacement", "car won't start", "starter repair"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 1.5, mid_range: 2.5, premium: 4.0 },
    materials: {
      budget:    { low: 100, high: 200 },
      mid_range: { low: 200, high: 350 },
      premium:   { low: 350, high: 500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.45, fees_pct: 0.05 },
    tags: ["common", "electrical"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-suspension": {
    id: "auto-suspension",
    category: "auto",
    name: "Suspension Repair",
    keywords: ["suspension", "struts", "shocks", "suspension repair", "strut replacement", "shock absorber"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 2, mid_range: 4, premium: 6 },
    materials: {
      budget:    { low: 150, high: 300 },
      mid_range: { low: 300, high: 600 },
      premium:   { low: 600, high: 1000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.45, labor_pct: 0.50, fees_pct: 0.05 },
    tags: ["common", "safety"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-exhaust": {
    id: "auto-exhaust",
    category: "auto",
    name: "Exhaust System Repair",
    keywords: ["exhaust", "muffler", "exhaust repair", "catalytic converter", "exhaust leak", "muffler replacement"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 1, mid_range: 2.5, premium: 5 },
    materials: {
      budget:    { low: 100, high: 250 },
      mid_range: { low: 250, high: 600 },
      premium:   { low: 600, high: 1500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.40, fees_pct: 0.05 },
    tags: ["common"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 12, predictable_materials: 8 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-timing-belt": {
    id: "auto-timing-belt",
    category: "auto",
    name: "Timing Belt Replacement",
    keywords: ["timing belt", "timing chain", "timing belt replacement", "timing chain replacement"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 3, mid_range: 5, premium: 8 },
    materials: {
      budget:    { low: 100, high: 200 },
      mid_range: { low: 200, high: 400 },
      premium:   { low: 400, high: 700 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.35, labor_pct: 0.60, fees_pct: 0.05 },
    tags: ["maintenance", "multi_hour"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry labor time guides"]
  },

  "auto-wheel-alignment": {
    id: "auto-wheel-alignment",
    category: "auto",
    name: "Wheel Alignment",
    keywords: ["alignment", "wheel alignment", "front end alignment", "tire alignment", "car pulls"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 0.5, mid_range: 1.0, premium: 1.5 },
    materials: {
      budget:    { low: 0,  high: 20 },
      mid_range: { low: 20, high: 50 },
      premium:   { low: 50, high: 100 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.15, labor_pct: 0.80, fees_pct: 0.05 },
    tags: ["common", "quick"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 20, common_service: 15, predictable_materials: 15 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-radiator": {
    id: "auto-radiator",
    category: "auto",
    name: "Radiator Replacement",
    keywords: ["radiator", "radiator replacement", "cooling system", "radiator repair", "overheating", "coolant leak"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 2, mid_range: 3.5, premium: 5 },
    materials: {
      budget:    { low: 150, high: 250 },
      mid_range: { low: 250, high: 450 },
      premium:   { low: 450, high: 700 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.45, fees_pct: 0.05 },
    tags: ["common", "cooling"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-spark-plugs": {
    id: "auto-spark-plugs",
    category: "auto",
    name: "Spark Plug Replacement",
    keywords: ["spark plugs", "spark plug", "plug replacement", "ignition", "misfire"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 0.5, mid_range: 1.5, premium: 3.0 },
    materials: {
      budget:    { low: 20,  high: 50 },
      mid_range: { low: 50,  high: 100 },
      premium:   { low: 100, high: 200 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.35, labor_pct: 0.60, fees_pct: 0.05 },
    tags: ["maintenance", "diy_friendly"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 15, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-water-pump": {
    id: "auto-water-pump",
    category: "auto",
    name: "Water Pump Replacement",
    keywords: ["water pump", "water pump replacement", "coolant pump", "water pump leak"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 2, mid_range: 4, premium: 6 },
    materials: {
      budget:    { low: 80,  high: 150 },
      mid_range: { low: 150, high: 300 },
      premium:   { low: 300, high: 500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.40, labor_pct: 0.55, fees_pct: 0.05 },
    tags: ["common", "cooling"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "auto-clutch-replacement": {
    id: "auto-clutch-replacement",
    category: "auto",
    name: "Clutch Replacement",
    keywords: ["clutch", "clutch replacement", "clutch repair", "clutch slipping"],
    bls_soc_code: "49-3023",
    occupation: "autoMech",
    labor_hours: { budget: 4, mid_range: 6, premium: 10 },
    materials: {
      budget:    { low: 200, high: 400 },
      mid_range: { low: 400, high: 700 },
      premium:   { low: 700, high: 1200 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.40, labor_pct: 0.55, fees_pct: 0.05 },
    tags: ["expensive", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry labor time guides"]
  },

  // ═══════════════════════════════════════════════════════════════
  //  HOME SERVICES (24 services)
  // ═══════════════════════════════════════════════════════════════

  "home-kitchen-remodel": {
    id: "home-kitchen-remodel",
    category: "home",
    name: "Kitchen Remodel",
    keywords: ["kitchen remodel", "kitchen renovation", "kitchen update", "kitchen redo", "kitchen cabinets", "kitchen countertops", "new kitchen"],
    bls_soc_code: "47-2031",
    occupation: "carpenter",
    labor_hours: { budget: 80, mid_range: 180, premium: 300 },
    materials: {
      budget:    { low: 5000,  high: 10000 },
      mid_range: { low: 10000, high: 22000 },
      premium:   { low: 22000, high: 35000 }
    },
    shop_fee_pct: 0.10,
    cost_breakdown: { parts_pct: 0.45, labor_pct: 0.40, fees_pct: 0.15 },
    tags: ["major_project", "multi_week", "permit_likely"],
    data_confidence: "low",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 5, common_service: 10, predictable_materials: 5 },
    sources: ["BLS OEWS May 2024", "RS Means data", "Industry estimates"]
  },

  "home-bathroom-remodel": {
    id: "home-bathroom-remodel",
    category: "home",
    name: "Bathroom Remodel",
    keywords: ["bathroom remodel", "bathroom renovation", "bathroom update", "bath remodel", "shower remodel", "bathroom redo", "new bathroom"],
    bls_soc_code: "47-2152",
    occupation: "plumber",
    labor_hours: { budget: 40, mid_range: 100, premium: 160 },
    materials: {
      budget:    { low: 2000,  high: 5000 },
      mid_range: { low: 5000,  high: 10000 },
      premium:   { low: 10000, high: 15000 }
    },
    shop_fee_pct: 0.10,
    cost_breakdown: { parts_pct: 0.40, labor_pct: 0.45, fees_pct: 0.15 },
    tags: ["major_project", "multi_week", "permit_likely"],
    data_confidence: "low",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 5, common_service: 10, predictable_materials: 5 },
    sources: ["BLS OEWS May 2024", "RS Means data", "Industry estimates"]
  },

  "home-roof-replacement": {
    id: "home-roof-replacement",
    category: "home",
    name: "Roof Replacement",
    keywords: ["roof replacement", "new roof", "roof repair", "roofing", "shingles", "roof leak", "re-roof", "roof damage"],
    bls_soc_code: "47-2181",
    occupation: "roofer",
    labor_hours: { budget: 16, mid_range: 35, premium: 60 },
    materials: {
      budget:    { low: 3000,  high: 5000 },
      mid_range: { low: 5000,  high: 8500 },
      premium:   { low: 8500,  high: 12000 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.40, fees_pct: 0.10 },
    tags: ["major_project", "multi_day", "permit_likely"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 12, predictable_materials: 8 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-hvac-replacement": {
    id: "home-hvac-replacement",
    category: "home",
    name: "HVAC Replacement",
    keywords: ["hvac replacement", "hvac install", "new hvac", "furnace replacement", "ac unit", "central air", "heating system", "heat pump", "furnace install"],
    bls_soc_code: "49-9021",
    occupation: "hvac",
    labor_hours: { budget: 8, mid_range: 16, premium: 24 },
    materials: {
      budget:    { low: 2500, high: 4000 },
      mid_range: { low: 4000, high: 6000 },
      premium:   { low: 6000, high: 8000 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.35, fees_pct: 0.10 },
    tags: ["major_project", "permit_likely"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 12, predictable_materials: 8 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-interior-painting": {
    id: "home-interior-painting",
    category: "home",
    name: "Interior Painting",
    keywords: ["interior painting", "house painting", "room painting", "wall painting", "paint house", "interior paint", "repaint"],
    bls_soc_code: "47-2141",
    occupation: "painter",
    labor_hours: { budget: 16, mid_range: 36, premium: 60 },
    materials: {
      budget:    { low: 200,  high: 400 },
      mid_range: { low: 400,  high: 800 },
      premium:   { low: 800,  high: 1200 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.25, labor_pct: 0.70, fees_pct: 0.05 },
    tags: ["common", "multi_day", "partially_diy"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 15, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-fence-installation": {
    id: "home-fence-installation",
    category: "home",
    name: "Fence Installation",
    keywords: ["fence", "fence installation", "new fence", "fence repair", "wood fence", "vinyl fence", "chain link fence", "privacy fence"],
    bls_soc_code: "47-2031",
    occupation: "carpenter",
    labor_hours: { budget: 12, mid_range: 24, premium: 40 },
    materials: {
      budget:    { low: 800,  high: 1800 },
      mid_range: { low: 1800, high: 3200 },
      premium:   { low: 3200, high: 5000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.40, fees_pct: 0.05 },
    tags: ["outdoor", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 12, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-flooring-installation": {
    id: "home-flooring-installation",
    category: "home",
    name: "Flooring Installation",
    keywords: ["flooring", "floor installation", "new floors", "hardwood floors", "laminate", "vinyl plank", "lvp", "tile floor", "carpet installation"],
    bls_soc_code: "47-2042",
    occupation: "floorLayer",
    labor_hours: { budget: 16, mid_range: 32, premium: 50 },
    materials: {
      budget:    { low: 1000, high: 2500 },
      mid_range: { low: 2500, high: 5000 },
      premium:   { low: 5000, high: 8000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.40, fees_pct: 0.05 },
    tags: ["common", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 25, bea_data: 20, scope_defined: 12, common_service: 12, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-garage-door": {
    id: "home-garage-door",
    category: "home",
    name: "Garage Door Replacement",
    keywords: ["garage door", "garage door replacement", "new garage door", "garage door opener", "garage door install", "garage door repair"],
    bls_soc_code: "47-2031",
    occupation: "carpenter",
    labor_hours: { budget: 3, mid_range: 5, premium: 8 },
    materials: {
      budget:    { low: 600,  high: 1200 },
      mid_range: { low: 1200, high: 2500 },
      premium:   { low: 2500, high: 4000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.65, labor_pct: 0.30, fees_pct: 0.05 },
    tags: ["common"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-plumbing-repair": {
    id: "home-plumbing-repair",
    category: "home",
    name: "Plumbing Repair",
    keywords: ["plumbing", "plumbing repair", "leaking faucet", "pipe repair", "drain repair", "faucet", "toilet repair", "pipe leak", "clogged drain", "plumber"],
    bls_soc_code: "47-2152",
    occupation: "plumber",
    labor_hours: { budget: 1, mid_range: 2.5, premium: 5 },
    materials: {
      budget:    { low: 20,  high: 80 },
      mid_range: { low: 80,  high: 200 },
      premium:   { low: 200, high: 500 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.30, labor_pct: 0.65, fees_pct: 0.05 },
    tags: ["common", "urgent"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 15, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-electrical-repair": {
    id: "home-electrical-repair",
    category: "home",
    name: "Electrical Repair",
    keywords: ["electrical", "electrical repair", "outlet", "wiring", "circuit breaker", "light fixture", "electrical panel", "electrician", "rewire"],
    bls_soc_code: "47-2111",
    occupation: "electrician",
    labor_hours: { budget: 1, mid_range: 3, premium: 6 },
    materials: {
      budget:    { low: 20,  high: 80 },
      mid_range: { low: 80,  high: 250 },
      premium:   { low: 250, high: 600 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.25, labor_pct: 0.67, fees_pct: 0.08 },
    tags: ["common", "safety"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 12, predictable_materials: 8 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-water-heater": {
    id: "home-water-heater",
    category: "home",
    name: "Water Heater Replacement",
    keywords: ["water heater", "hot water heater", "water heater replacement", "tankless water heater", "water heater install", "no hot water"],
    bls_soc_code: "47-2152",
    occupation: "plumber",
    labor_hours: { budget: 2, mid_range: 4, premium: 8 },
    materials: {
      budget:    { low: 400,  high: 700 },
      mid_range: { low: 700,  high: 1200 },
      premium:   { low: 1200, high: 2500 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.60, labor_pct: 0.32, fees_pct: 0.08 },
    tags: ["common", "urgent"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 18, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-ac-repair": {
    id: "home-ac-repair",
    category: "home",
    name: "Home AC Repair",
    keywords: ["ac repair home", "home ac", "central air repair", "ac not cooling", "ac broken", "air conditioning repair", "home air conditioning"],
    bls_soc_code: "49-9021",
    occupation: "hvac",
    labor_hours: { budget: 1, mid_range: 3, premium: 6 },
    materials: {
      budget:    { low: 50,   high: 150 },
      mid_range: { low: 150,  high: 400 },
      premium:   { low: 400,  high: 800 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.40, labor_pct: 0.52, fees_pct: 0.08 },
    tags: ["common", "seasonal", "urgent"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 15, predictable_materials: 8 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-landscaping": {
    id: "home-landscaping",
    category: "home",
    name: "Landscaping",
    keywords: ["landscaping", "landscape", "lawn", "yard work", "garden", "sod", "mulch", "tree removal", "lawn care", "landscape design"],
    bls_soc_code: "37-3011",
    occupation: "landscaper",
    labor_hours: { budget: 8, mid_range: 24, premium: 60 },
    materials: {
      budget:    { low: 200,  high: 600 },
      mid_range: { low: 600,  high: 2000 },
      premium:   { low: 2000, high: 5000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.45, labor_pct: 0.50, fees_pct: 0.05 },
    tags: ["outdoor", "seasonal"],
    data_confidence: "low",
    confidence_factors: { bls_match: 25, bea_data: 20, scope_defined: 5, common_service: 10, predictable_materials: 5 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-window-replacement": {
    id: "home-window-replacement",
    category: "home",
    name: "Window Replacement",
    keywords: ["window replacement", "new windows", "window install", "window repair", "broken window", "energy efficient windows"],
    bls_soc_code: "47-2031",
    occupation: "carpenter",
    labor_hours: { budget: 2, mid_range: 6, premium: 16 },
    materials: {
      budget:    { low: 200,  high: 500 },
      mid_range: { low: 500,  high: 1500 },
      premium:   { low: 1500, high: 4000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.60, labor_pct: 0.35, fees_pct: 0.05 },
    tags: ["common", "energy_efficiency"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 12, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-deck-build": {
    id: "home-deck-build",
    category: "home",
    name: "Deck Construction",
    keywords: ["deck", "deck build", "new deck", "deck construction", "patio deck", "wood deck", "composite deck"],
    bls_soc_code: "47-2031",
    occupation: "carpenter",
    labor_hours: { budget: 20, mid_range: 40, premium: 80 },
    materials: {
      budget:    { low: 1500, high: 3000 },
      mid_range: { low: 3000, high: 6000 },
      premium:   { low: 6000, high: 12000 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.50, labor_pct: 0.40, fees_pct: 0.10 },
    tags: ["major_project", "outdoor", "permit_likely"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-insulation": {
    id: "home-insulation",
    category: "home",
    name: "Insulation Installation",
    keywords: ["insulation", "attic insulation", "wall insulation", "blown insulation", "spray foam", "insulation install"],
    bls_soc_code: "47-2131",
    occupation: "carpenter",
    labor_hours: { budget: 4, mid_range: 10, premium: 20 },
    materials: {
      budget:    { low: 300,  high: 700 },
      mid_range: { low: 700,  high: 1500 },
      premium:   { low: 1500, high: 3000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.40, fees_pct: 0.05 },
    tags: ["energy_efficiency"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 25, bea_data: 20, scope_defined: 15, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-exterior-painting": {
    id: "home-exterior-painting",
    category: "home",
    name: "Exterior Painting",
    keywords: ["exterior painting", "house exterior", "outside painting", "exterior paint", "house paint exterior", "siding paint"],
    bls_soc_code: "47-2141",
    occupation: "painter",
    labor_hours: { budget: 24, mid_range: 48, premium: 80 },
    materials: {
      budget:    { low: 300,  high: 600 },
      mid_range: { low: 600,  high: 1200 },
      premium:   { low: 1200, high: 2000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.20, labor_pct: 0.75, fees_pct: 0.05 },
    tags: ["common", "multi_day", "seasonal"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 12, common_service: 12, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-drywall-repair": {
    id: "home-drywall-repair",
    category: "home",
    name: "Drywall Repair",
    keywords: ["drywall", "drywall repair", "wall repair", "hole in wall", "drywall patch", "sheetrock"],
    bls_soc_code: "47-2081",
    occupation: "carpenter",
    labor_hours: { budget: 1, mid_range: 3, premium: 8 },
    materials: {
      budget:    { low: 15,  high: 40 },
      mid_range: { low: 40,  high: 120 },
      premium:   { low: 120, high: 300 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.20, labor_pct: 0.75, fees_pct: 0.05 },
    tags: ["common", "partially_diy"],
    data_confidence: "high",
    confidence_factors: { bls_match: 25, bea_data: 20, scope_defined: 18, common_service: 15, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-siding": {
    id: "home-siding",
    category: "home",
    name: "Siding Installation",
    keywords: ["siding", "siding installation", "new siding", "vinyl siding", "house siding", "siding replacement"],
    bls_soc_code: "47-2031",
    occupation: "carpenter",
    labor_hours: { budget: 16, mid_range: 40, premium: 80 },
    materials: {
      budget:    { low: 2000, high: 4000 },
      mid_range: { low: 4000, high: 8000 },
      premium:   { low: 8000, high: 15000 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.55, labor_pct: 0.35, fees_pct: 0.10 },
    tags: ["major_project", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 10, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-gutter-install": {
    id: "home-gutter-install",
    category: "home",
    name: "Gutter Installation",
    keywords: ["gutters", "gutter installation", "new gutters", "gutter replacement", "rain gutters", "gutter repair"],
    bls_soc_code: "47-2181",
    occupation: "roofer",
    labor_hours: { budget: 4, mid_range: 8, premium: 14 },
    materials: {
      budget:    { low: 200,  high: 500 },
      mid_range: { low: 500,  high: 1000 },
      premium:   { low: 1000, high: 2000 }
    },
    shop_fee_pct: 0.05,
    cost_breakdown: { parts_pct: 0.45, labor_pct: 0.50, fees_pct: 0.05 },
    tags: ["common", "outdoor"],
    data_confidence: "high",
    confidence_factors: { bls_match: 30, bea_data: 20, scope_defined: 15, common_service: 12, predictable_materials: 12 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  },

  "home-concrete": {
    id: "home-concrete",
    category: "home",
    name: "Concrete Work",
    keywords: ["concrete", "driveway", "patio", "sidewalk", "concrete repair", "concrete pour", "stamped concrete", "concrete slab"],
    bls_soc_code: "47-2051",
    occupation: "carpenter",
    labor_hours: { budget: 8, mid_range: 20, premium: 40 },
    materials: {
      budget:    { low: 400,  high: 1000 },
      mid_range: { low: 1000, high: 2500 },
      premium:   { low: 2500, high: 5000 }
    },
    shop_fee_pct: 0.08,
    cost_breakdown: { parts_pct: 0.40, labor_pct: 0.50, fees_pct: 0.10 },
    tags: ["outdoor", "multi_day"],
    data_confidence: "medium",
    confidence_factors: { bls_match: 25, bea_data: 20, scope_defined: 10, common_service: 10, predictable_materials: 10 },
    sources: ["BLS OEWS May 2024", "Industry estimates"]
  }
};

// Build a lookup map by ID for fast access
const CATALOG_BY_ID = SERVICE_CATALOG;

// Build keyword index for service matching
const KEYWORD_INDEX = {};
for (const [id, service] of Object.entries(SERVICE_CATALOG)) {
  for (const kw of service.keywords) {
    const key = kw.toLowerCase();
    if (!KEYWORD_INDEX[key]) KEYWORD_INDEX[key] = [];
    KEYWORD_INDEX[key].push(id);
  }
}

module.exports = { SERVICE_CATALOG, CATALOG_BY_ID, KEYWORD_INDEX };
