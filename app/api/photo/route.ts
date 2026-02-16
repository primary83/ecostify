import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  const maxWidth = searchParams.get("maxWidth") || "400";
  const maxHeight = searchParams.get("maxHeight") || "300";

  if (!ref || !ref.startsWith("places/")) {
    return NextResponse.json(
      { error: "Invalid photo reference" },
      { status: 400 }
    );
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const photoUrl = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(photoUrl, {
      next: { revalidate: 86400 }, // 24-hour cache
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Photo proxy error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
