// Vercel Serverless Function: /api/estimate
// Sends user's service description + optional photos to Gemini for AI cost estimation
// Enhanced with data-backed pricing from BLS OEWS + BEA RPP (Feb 2026)
import pricingEngine from './lib/pricing-engine.js';
const { matchCity, matchService, calculateEstimate: calcDataEstimate } = pricingEngine;

// Luxury/European vehicle brands that typically cost 2-3x more for services
const LUXURY_BRANDS = [
    'land rover', 'range rover', 'bmw', 'mercedes', 'mercedes-benz',
    'audi', 'porsche', 'jaguar', 'lexus', 'infiniti', 'acura',
    'volvo', 'maserati', 'bentley', 'rolls-royce', 'rolls royce',
    'ferrari', 'lamborghini', 'tesla', 'genesis', 'lincoln', 'cadillac',
    'alfa romeo', 'aston martin', 'mini cooper', 'land rover'
];
function detectLuxury(text) {
    if (!text) return null;
    const l = text.toLowerCase();
    return LUXURY_BRANDS.find(b => l.includes(b)) || null;
}

function roundTo10(n) { return Math.round(n / 10) * 10; }

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
        return res.status(500).json({ error: 'Missing Gemini API key' });
    }

    try {
        const { category, description, photoData, extraPhotos, lat, lng, city, state } = req.body;
        console.log('[PRICING] Input:', { city, state, category, desc: description?.slice(0, 60) });

        // Build location context
        let locationCtx = '';
        if (city && state) {
            locationCtx = `The user is located in ${city}, ${state}. Use pricing specific to this metro area — account for local labor rates, cost of living index, material availability, and regional market conditions. Do NOT use national averages — use ${city}, ${state} pricing specifically.`;
        } else {
            locationCtx = 'No location provided. Use national average US pricing and note that prices vary significantly by region.';
        }

        const serviceType = category === 'auto' ? 'automotive' : 'home';

        // Detect luxury/European vehicle in description
        const luxuryBrand = category === 'auto' ? detectLuxury(description) : null;
        let luxuryNote = '';
        if (luxuryBrand) {
            luxuryNote = `\n\nLUXURY VEHICLE NOTICE: The user's vehicle is a "${luxuryBrand}" — a luxury/European brand. Adjust ALL estimates upward by 2-3x compared to standard vehicles. Luxury vehicles require: specialized full-synthetic fluids (often higher capacity — e.g., 8-9 quarts vs 5 for oil changes), OEM or dealer-only parts that cost 2-5x more than aftermarket, specialist labor rates ($150-250/hr vs standard $80-130/hr), and sometimes dealer-only diagnostic tools. Do NOT use standard vehicle pricing for this brand.`;
        }

        // ── Data-backed pricing context ──
        // Match description to service catalog + city to BLS metro
        const citySlug = matchCity(city, state);
        const prelimMatch = matchService(description, category);
        console.log('[PRICING] Match:', { citySlug, service: prelimMatch?.id || null, luxury: luxuryBrand || 'none' });

        let dataContext = '';
        let prelimPricing = null;
        // Use national fallback if city not matched but service is matched
        if (prelimMatch) {
            const effectiveCity = citySlug || '_national';
            try {
                prelimPricing = calcDataEstimate(prelimMatch.id, effectiveCity);
                if (prelimPricing) {
                    // If luxury vehicle, multiply data-backed tiers before injecting into prompt
                    let tierData = prelimPricing.tiers;
                    if (luxuryBrand) {
                        tierData = JSON.parse(JSON.stringify(prelimPricing.tiers)); // deep clone
                        for (const tier of Object.values(tierData)) {
                            tier.total_low = roundTo10(tier.total_low * 2.0);
                            tier.total_mid = roundTo10(tier.total_mid * 2.0);
                            tier.total_high = roundTo10(tier.total_high * 2.0);
                        }
                    }
                    const cityLabel = citySlug ? `${city}, ${state}` : 'national average';
                    dataContext = `\n\nDATA-BACKED PRICING REFERENCE (use these BLS/BEA data points to calibrate your estimate):\nService matched: ${prelimMatch.name}${luxuryBrand ? ' (LUXURY VEHICLE — rates below are already adjusted 2x)' : ''}\nBLS labor rate for SOC ${prelimMatch.bls_soc_code} in ${cityLabel}: $${prelimPricing.localLaborRate}/hr (national median: $${prelimPricing.nationalLaborRate}/hr)\nBEA Regional Price Parity: ${prelimPricing.rpp} (national avg = 100)\n- Budget tier range: $${tierData.budget.total_low}–$${tierData.budget.total_high}\n- Mid-range tier range: $${tierData.mid_range.total_low}–$${tierData.mid_range.total_high}\n- Premium tier range: $${tierData.premium.total_low}–$${tierData.premium.total_high}\nYour estimate should align with these data-backed ranges (within 15-20%) unless the photo or description reveals unusual scope, complexity, or specific materials that justify a different price.`;
                    console.log('[PRICING] DataContext: OK, city:', effectiveCity);
                }
            } catch (e) {
                console.error('[PRICING] Engine error:', e.message);
            }
        }

        // Build the prompt
        const prompt = `You are a highly accurate cost estimation tool for ${serviceType} services. Your job is to help everyday consumers understand what a service should cost BEFORE they get quotes from providers. Your estimates must be realistic, specific, and useful — not vague or overly broad.

LOCATION CONTEXT:
${locationCtx}${dataContext}${luxuryNote}

USER'S REQUEST: "${description || 'See the attached photo(s) for what needs to be done.'}"

CRITICAL INSTRUCTIONS FOR ACCURACY:

1. SCOPE THE TIERS AS DIFFERENT LEVELS OF WORK — NOT JUST PRICE LEVELS:
   - "budget" = the minimum viable fix or most basic version of this service. Describe exactly what's included and what's NOT included.
   - "midRange" = the standard, most common approach that most people choose. Describe what's included.
   - "premium" = the comprehensive, high-end approach with the best materials/methods. Describe what's included.
   Each tier is a DIFFERENT SCOPE OF WORK, not just cheap vs expensive for the same job.

2. KEEP PRICE RANGES TIGHT:
   - Each tier's range should span no more than 40-50% of the low end.
   - Example: If budget low is $200, the high should be at most $300 — NOT $200–$600.
   - Tight ranges signal confidence. Wide ranges signal "I don't know."
   - If you genuinely cannot be more specific, explain WHY in the description.

3. STATE YOUR ASSUMPTIONS:
   - In the "description" field, explicitly state what you assumed about the scope.
   - For home services: state the assumed room size, square footage, or scope.
   - For auto services: state the assumed vehicle type (sedan, SUV, truck) if not specified.
   - Example: "Based on a standard 5×8 bathroom with basic fixtures" or "Based on a mid-size sedan with standard brake pads."

4. MAKE TIPS ACTIONABLE AND SPECIFIC:
   - Don't say "Get multiple quotes" — everyone knows that.
   - DO say "In ${city || 'your area'}, licensed plumbers typically charge $75-$150/hour — ask for hourly rate upfront."
   - Include specific negotiation language the user can use with providers.
   - Include at least one tip about timing or seasonal savings if applicable.

5. MAKE RED FLAGS SPECIFIC:
   - Don't say "Watch out for hidden fees" — too vague.
   - DO say "If a contractor won't provide a line-item breakdown, that's a red flag — every reputable provider itemizes parts, labor, and materials separately."

6. PRICE REALISTICALLY FOR 2025-2026:
   - For ${serviceType === 'automotive' ? 'auto services, reference pricing consistent with RepairPal, Kelley Blue Book, and AAA fair price ranges' : 'home services, reference pricing consistent with HomeGuide, Fixr, Angi, and RS Means data'}.
   - Account for post-2023 inflation in labor and materials.
   - If the service has seasonal price variation, note the current season's impact.

7. COST BREAKDOWN MUST BE REALISTIC:
   - For auto: typically 30-50% parts, 40-60% labor, 5-15% shop fees/supplies.
   - For home: varies by project — remodels are 35-45% materials, 40-50% labor, 10-20% permits/overhead.
   - Don't use a generic 40/55/5 split for everything — tailor it to this specific service.

8. IF THE INPUT IS VAGUE:
   - Still provide an estimate, but clearly state your assumptions in the description.
   - Make the "budget" tier match the most common/basic interpretation of the request.
   - Add a note in the first tip suggesting the user refine their request for a more accurate estimate.

${photoData ? '9. PHOTO ANALYSIS: Carefully examine the provided photo(s). Identify specific details — make, model, year of vehicle; type of damage or wear; materials visible; severity of issue. Use these details to make the estimate MORE specific, not less. If you can identify the specific problem from the photo, name it.' : ''}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "Service Name",
  "subtitle": "Brief one-line summary including key assumptions (e.g., 'Standard 5×8 guest bathroom, cosmetic refresh')",
  "priceRange": "$X — $Y",
  "description": "2-3 sentences explaining the service. MUST state assumptions about scope, size, and what's included. End with: 'Actual costs depend on [2-3 specific factors for this service].'",
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "redFlags": ["red flag 1", "red flag 2", "red flag 3"],
  "urgency": "high" or "medium" or "low",
  "urgencyNote": "Brief explanation of urgency level",
  "diyFeasibility": "yes" or "partial" or "no",
  "diyNote": "Brief DIY assessment with specific skill level needed",
  "priceTiers": {
    "budget": { "range": "$X — $Y", "description": "SPECIFIC scope: what's included, what's NOT included, what materials/parts" },
    "midRange": { "range": "$X — $Y", "description": "SPECIFIC scope: what's included, upgrades from budget, what materials/parts" },
    "premium": { "range": "$X — $Y", "description": "SPECIFIC scope: what's included, all upgrades, premium materials/parts" }
  },
  "costBreakdown": [
    { "item": "Category name", "percentage": number },
    { "item": "Category name", "percentage": number }
  ],
  "timeEstimate": "X-Y hours/days",
  "bestSeason": "When is best to do this and WHY, or 'Any time' with brief explanation",
  "detectedVehicle": "Vehicle make/model/year if visible in photo, otherwise null",
  "detectedMaterials": "Specific materials visible in photo if applicable, otherwise null",
  "assumptions": "List the key assumptions this estimate is based on (size, scope, materials, vehicle type, etc.)"
}

Rules:
- costBreakdown percentages must sum to 100
- Include exactly 5 tips and 3 red flags
- Each tier range must be tight (span no more than 40-50% of the low number)
- priceRange should match the midRange tier since that's what most people choose
- ALL prices must reflect ${city ? city + ', ' + state : 'US'} 2025-2026 market rates`;

        // Build Gemini API request parts
        const parts = [];

        // Add text prompt
        parts.push({ text: prompt });

        // Add primary photo if present
        if (photoData && photoData.startsWith('data:')) {
            const [meta, base64] = photoData.split(',');
            const mimeMatch = meta.match(/data:(.*?);/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64
                }
            });
        }

        // Add extra photos
        if (extraPhotos && Array.isArray(extraPhotos)) {
            for (const photo of extraPhotos.slice(0, 3)) {
                if (photo && photo.startsWith('data:')) {
                    const [meta, base64] = photo.split(',');
                    const mimeMatch = meta.match(/data:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                    parts.push({
                        inline_data: {
                            mime_type: mimeType,
                            data: base64
                        }
                    });
                }
            }
        }

        // Use gemini-2.5-flash for all requests (supports text + vision)
        const model = 'gemini-2.5-flash';

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                    thinkingConfig: { thinkingBudget: 0 }
                }
            })
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini API error:', geminiRes.status, errText);
            return res.status(502).json({ error: 'AI service error' });
        }

        const geminiData = await geminiRes.json();
        // Extract text from the last part (first parts may be "thinking" tokens)
        const parts_out = geminiData.candidates?.[0]?.content?.parts || [];
        const textContent = parts_out.filter(p => p.text).map(p => p.text).pop();

        if (!textContent) {
            console.error('No text in Gemini response:', JSON.stringify(geminiData).slice(0, 500));
            return res.status(502).json({ error: 'No response from AI' });
        }

        // Parse JSON from response (strip code fences if present)
        let estimate;
        try {
            let cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            // Try to extract JSON object if wrapped in extra text
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
            }
            estimate = JSON.parse(cleaned);
        } catch (e) {
            console.error('Failed to parse Gemini response:', textContent.slice(0, 500));
            return res.status(502).json({ error: 'Invalid AI response format' });
        }

        // Validate required fields
        if (!estimate.title || !estimate.priceRange || !estimate.tips) {
            return res.status(502).json({ error: 'Incomplete AI response' });
        }

        // ── Enrich with data-backed pricing metadata ──
        // Post-match: use AI's returned title for more accurate service matching
        let enrichment = {};
        try {
            const finalMatch = matchService(estimate.title, category) || prelimMatch;
            const effectiveCity = citySlug || '_national';
            if (finalMatch) {
                const dataPricing = calcDataEstimate(finalMatch.id, effectiveCity);
                if (dataPricing) {
                    // Detect luxury from description OR from Gemini's detected vehicle
                    const detectedLuxury = luxuryBrand || detectLuxury(estimate.detectedVehicle);

                    // If luxury, adjust data-backed tier numbers
                    if (detectedLuxury) {
                        for (const tier of Object.values(dataPricing.tiers)) {
                            tier.total_low = roundTo10(tier.total_low * 2.0);
                            tier.total_mid = roundTo10(tier.total_mid * 2.0);
                            tier.total_high = roundTo10(tier.total_high * 2.0);
                        }
                    }

                    enrichment = {
                        dataBackedPricing: dataPricing.tiers,
                        confidence: dataPricing.confidence,
                        dataSources: dataPricing.sources,
                        dataYear: dataPricing.dataYear,
                        localLaborRate: dataPricing.localLaborRate,
                        nationalLaborRate: dataPricing.nationalLaborRate,
                        cityComparison: dataPricing.cityComparison,
                        serviceName: dataPricing.serviceName,
                        socCode: dataPricing.socCode,
                        rpp: dataPricing.rpp
                    };

                    // Downgrade confidence for luxury vehicles
                    if (detectedLuxury && enrichment.confidence) {
                        enrichment.confidence.level = 'medium';
                        enrichment.confidence.label = 'Good Estimate (Luxury Vehicle)';
                        enrichment.confidence.message = `Luxury vehicles like ${detectedLuxury} typically cost 2-3x more. Pricing adjusted from standard vehicle data.`;
                        enrichment.confidence.score = Math.min(enrichment.confidence.score, 65);
                    }
                }
            }
            console.log('[PRICING] Enrichment:', Object.keys(enrichment).length > 0 ? Object.keys(enrichment).join(',') : 'EMPTY');
        } catch (e) {
            console.error('[PRICING] Enrich error:', e.message);
        }

        return res.status(200).json({ ...estimate, ...enrichment });

    } catch (err) {
        console.error('Estimate API error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
