// Vercel Serverless Function: /api/directory-search
// Proxies Google Places API (New) Text Search for the directory page
// Keeps the API key server-side only

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
    if (!PLACES_KEY) {
        return res.status(500).json({ error: 'Missing Google Places API key' });
    }

    try {
        const { query, lat, lng, radius } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Location required' });
        }

        // Google Places API (New) — Text Search
        const placesUrl = 'https://places.googleapis.com/v1/places:searchText';

        const placesRes = await fetch(placesUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': PLACES_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.currentOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.photos,places.businessStatus,places.types,places.location'
            },
            body: JSON.stringify({
                textQuery: query,
                locationBias: {
                    circle: {
                        center: { latitude: lat, longitude: lng },
                        radius: radius || 32000 // default ~20 miles
                    }
                },
                maxResultCount: 20,
                languageCode: 'en'
            })
        });

        if (!placesRes.ok) {
            const errText = await placesRes.text();
            console.error('Places API error:', placesRes.status, errText);
            return res.status(200).json({ places: [] });
        }

        const data = await placesRes.json();

        if (!data.places || data.places.length === 0) {
            return res.status(200).json({ places: [] });
        }

        // Transform results — keep API key server-side for photo URLs
        const places = data.places
            .filter(place => (place.businessStatus || 'OPERATIONAL') === 'OPERATIONAL')
            .map(place => {
                // Calculate distance using haversine
                const placeLat = place.location?.latitude;
                const placeLng = place.location?.longitude;
                let distance = null;
                if (placeLat && placeLng) {
                    const distKm = haversine(lat, lng, placeLat, placeLng);
                    distance = (distKm * 0.621371).toFixed(1); // Convert km to miles
                }

                // Generate photo URL server-side (key stays hidden in img src)
                let photoUrl = null;
                if (place.photos && place.photos.length > 0) {
                    const photoName = place.photos[0].name;
                    photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${PLACES_KEY}`;
                }

                // Open/closed status
                let isOpen = null;
                if (place.currentOpeningHours) {
                    isOpen = place.currentOpeningHours.openNow || false;
                }

                return {
                    name: place.displayName?.text || 'Unknown',
                    address: place.formattedAddress || '',
                    rating: place.rating || 0,
                    reviews: place.userRatingCount || 0,
                    phone: place.nationalPhoneNumber || '',
                    website: place.websiteUri || '',
                    mapsUrl: place.googleMapsUri || '',
                    isOpen,
                    photoUrl,
                    distance,
                    types: place.types || []
                };
            });

        return res.status(200).json({ places });

    } catch (err) {
        console.error('Directory search error:', err);
        return res.status(500).json({ error: 'Search failed', places: [] });
    }
}

// Haversine formula — returns distance in km
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
