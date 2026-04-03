import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies Google Places photo media so we don't store API keys in public HTML.
 * Query: n = photo resource name from Place Details (photos[].name).
 */
export async function GET(req: NextRequest) {
  const n = req.nextUrl.searchParams.get("n");
  if (!n?.trim()) {
    return NextResponse.json({ error: "Missing n" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const photoName = n.trim();
  if (photoName.length > 2048 || !photoName.startsWith("places/")) {
    return NextResponse.json({ error: "Invalid n" }, { status: 400 });
  }

  const url = `https://places.googleapis.com/v1/${encodeURIComponent(photoName)}/media?maxHeightPx=1200&maxWidthPx=1200`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "X-Goog-Api-Key": key },
    redirect: "follow",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Upstream photo error" }, { status: res.status });
  }

  const buf = await res.arrayBuffer();
  const ct = res.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(buf, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
