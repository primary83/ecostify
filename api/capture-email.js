// Vercel Serverless Function: /api/capture-email
// Stores email leads from estimate results page
// Currently logs to Vercel function logs — can be extended to send to a CRM, database, or email service
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, category, title, priceRange, description, timestamp } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }

        // Log the lead (visible in Vercel function logs)
        console.log('EMAIL_LEAD:', JSON.stringify({
            email,
            category: category || 'unknown',
            title: title || 'N/A',
            priceRange: priceRange || 'N/A',
            description: (description || '').slice(0, 200),
            timestamp: timestamp || new Date().toISOString(),
            capturedAt: new Date().toISOString()
        }));

        // TODO: Integrate with email service (SendGrid, Resend, etc.) or database
        // Example: await sendToResend(email, title, priceRange);
        // Example: await saveToDatabase(leadData);

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Email capture error:', err);
        return res.status(200).json({ success: false });
    }
}
