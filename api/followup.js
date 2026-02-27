// Vercel Serverless Function: /api/followup
// Handles follow-up questions about an existing estimate using Gemini
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
        return res.status(500).json({ error: 'Missing Gemini API key' });
    }

    try {
        const { question, category, originalEstimate, city, state } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question required' });
        }

        let locationCtx = '';
        if (city && state) {
            locationCtx = `The user is located in ${city}, ${state}. Reference local pricing when relevant.`;
        }

        const estimateCtx = originalEstimate
            ? `The original estimate was for "${originalEstimate.title}" with a price range of ${originalEstimate.priceRange}. Description: ${originalEstimate.description || 'N/A'}`
            : '';

        const prompt = `You are a helpful ${category === 'auto' ? 'automotive' : 'home service'} cost estimation assistant.

${locationCtx}

${estimateCtx}

The user has a follow-up question: "${question}"

Provide a helpful, concise answer. Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "answer": "Your detailed answer here (2-4 sentences, can include <strong> tags for emphasis)",
  "updatedRange": "$X — $Y or null if the original range still applies",
  "quickTip": "A brief actionable tip related to their question, or null if not applicable"
}

Important:
- Be specific and practical
- If the question would change the price range, provide updatedRange
- Keep the answer concise but informative`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json',
                    thinkingConfig: { thinkingBudget: 0 }
                }
            })
        });

        if (!geminiRes.ok) {
            console.error('Gemini followup error:', geminiRes.status);
            return res.status(200).json({ answer: 'Sorry, I could not process that question right now. Please try again.' });
        }

        const geminiData = await geminiRes.json();
        const parts_out = geminiData.candidates?.[0]?.content?.parts || [];
        const textContent = parts_out.filter(p => p.text).map(p => p.text).pop();

        if (!textContent) {
            return res.status(200).json({ answer: 'Sorry, I could not generate a response.' });
        }

        let result;
        try {
            const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            result = JSON.parse(cleaned);
        } catch (e) {
            // If JSON parse fails, use the raw text as the answer
            return res.status(200).json({ answer: textContent.trim() });
        }

        return res.status(200).json({
            answer: result.answer || 'Sorry, I could not process that question.',
            updatedRange: result.updatedRange || null,
            quickTip: result.quickTip || null
        });

    } catch (err) {
        console.error('Followup API error:', err);
        return res.status(200).json({ answer: 'Sorry, something went wrong. Please try again.' });
    }
}
