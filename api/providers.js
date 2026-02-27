// Vercel Serverless Function: /api/providers
// Finds nearby auto/home service providers using Google Places API (New)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
    if (!PLACES_KEY) {
        return res.status(500).json({ error: 'Missing Google Places API key' });
    }

    try {
        const { lat, lng, category } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Location required', providers: [] });
        }

        // Determine search types based on category
        const includedTypes = category === 'auto'
            ? ['car_repair']
            : ['general_contractor', 'plumber', 'electrician', 'roofing_contractor'];

        // Use Google Places API (New) — Nearby Search
        const placesUrl = 'https://places.googleapis.com/v1/places:searchNearby';

        const placesRes = await fetch(placesUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': PLACES_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri,places.nationalPhoneNumber,places.websiteUri,places.photos,places.currentOpeningHours,places.types,places.id'
            },
            body: JSON.stringify({
                includedTypes,
                locationRestriction: {
                    circle: {
                        center: { latitude: lat, longitude: lng },
                        radius: 16000.0
                    }
                },
                maxResultCount: 10
            })
        });

        if (!placesRes.ok) {
            const errText = await placesRes.text();
            console.error('Places API error:', placesRes.status, errText);
            return res.status(200).json({ providers: [], userLat: lat, userLng: lng });
        }

        const placesData = await placesRes.json();

        if (!placesData.places || placesData.places.length === 0) {
            return res.status(200).json({ providers: [], userLat: lat, userLng: lng });
        }

        // Transform results to match frontend expectations
        const providers = placesData.places.slice(0, 8).map(place => {
            // Calculate distance
            const placeLat = place.location?.latitude;
            const placeLng = place.location?.longitude;
            let distanceText = null;
            if (placeLat && placeLng) {
                const dist = haversine(lat, lng, placeLat, placeLng);
                const distMiles = (dist * 0.621371).toFixed(1);
                distanceText = `${distMiles} mi`;
            }

            // Get photo URL using new API format
            let photoUrl = null;
            if (place.photos && place.photos.length > 0) {
                const photoName = place.photos[0].name;
                photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${PLACES_KEY}`;
            }

            // Determine open/closed status
            let isOpen = null;
            if (place.currentOpeningHours) {
                isOpen = place.currentOpeningHours.openNow ? 'open' : 'closed';
            }

            // Extract service tags from types
            const serviceTags = [];
            if (place.types) {
                const tagMap = {
                    car_repair: 'Auto Repair',
                    car_dealer: 'Dealership',
                    car_wash: 'Car Wash',
                    gas_station: 'Gas Station',
                    general_contractor: 'General Contractor',
                    plumber: 'Plumber',
                    electrician: 'Electrician',
                    roofing_contractor: 'Roofing',
                    painter: 'Painting',
                    home_goods_store: 'Home Improvement',
                };
                for (const type of place.types) {
                    if (tagMap[type]) serviceTags.push(tagMap[type]);
                }
            }
            if (serviceTags.length === 0) {
                serviceTags.push(category === 'auto' ? 'Auto Service' : 'Home Service');
            }

            return {
                name: place.displayName?.text || 'Unknown',
                address: place.formattedAddress || '',
                phone: place.nationalPhoneNumber || null,
                website: place.websiteUri || null,
                rating: place.rating || null,
                reviews: place.userRatingCount || null,
                distanceText,
                photoUrl,
                isOpen,
                serviceTags,
                mapsUrl: place.googleMapsUri || null,
                lat: placeLat,
                lng: placeLng,
            };
        });

        // Sort by rating (descending), then by distance
        providers.sort((a, b) => {
            if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
            return parseFloat(a.distanceText || '999') - parseFloat(b.distanceText || '999');
        });

        return res.status(200).json({
            providers,
            userLat: lat,
            userLng: lng
        });

    } catch (err) {
        console.error('Providers API error:', err);
        return res.status(200).json({ providers: [] });
    }
}

// Haversine formula — returns distance in km
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
