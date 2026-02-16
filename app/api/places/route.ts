import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const query = searchParams.get("query") || "service provider";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Places API key not configured" },
      { status: 500 }
    );
  }

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.businessStatus,places.currentOpeningHours,places.nationalPhoneNumber,places.photos,places.priceLevel,places.shortFormattedAddress",
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              },
              radius: 40000,
            },
          },
          maxResultCount: Math.min(limit, 20),
        }),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Places API error:", err);
      return NextResponse.json(
        { error: "Places API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const places = data.places || [];

    const providers = places
      .filter(
        (p: Record<string, unknown>) => p.businessStatus === "OPERATIONAL"
      )
      .map((p: Record<string, unknown>) => {
        const loc = p.location as { latitude: number; longitude: number };
        const displayName = p.displayName as { text: string };
        const photos = p.photos as { name: string }[] | undefined;

        // Calculate distance
        const R = 6371;
        const dLat = ((loc.latitude - parseFloat(latitude!)) * Math.PI) / 180;
        const dLon =
          ((loc.longitude - parseFloat(longitude!)) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((parseFloat(latitude!) * Math.PI) / 180) *
            Math.cos((loc.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = parseFloat((R * c * 0.621371).toFixed(1)); // miles

        return {
          id: p.id,
          name: displayName?.text || "Unknown",
          address:
            (p.shortFormattedAddress as string) ||
            (p.formattedAddress as string) ||
            "",
          rating: (p.rating as number) || 0,
          reviewCount: (p.userRatingCount as number) || 0,
          phone: (p.nationalPhoneNumber as string) || undefined,
          photoRef: photos?.[0]?.name || undefined,
          types: (p.types as string[]) || [],
          isOpen:
            (
              p.currentOpeningHours as { openNow?: boolean } | undefined
            )?.openNow ?? undefined,
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance,
          priceLevel: (p.priceLevel as number) || undefined,
        };
      });

    return NextResponse.json({ providers });
  } catch (err) {
    console.error("Places search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
