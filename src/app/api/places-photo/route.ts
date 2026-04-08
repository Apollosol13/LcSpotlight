import { NextRequest, NextResponse } from "next/server";
import {
  buildPlacesPhotoMediaUrl,
  isValidGooglePhotoResourceName,
} from "@/lib/places-api";

/**
 * Proxies Google Places photo media so we don't store API keys in public HTML.
 * Query: n = photo resource name from Place Details (photos[].name).
 */
export async function GET(req: NextRequest) {
  const noStoreJson = (body: object, status: number) =>
    NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

  const n = req.nextUrl.searchParams.get("n");
  if (!n?.trim()) {
    return noStoreJson({ error: "Missing n" }, 400);
  }

  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return noStoreJson({ error: "Not configured" }, 503);
  }

  const photoName = n.trim();
  if (
    photoName.length > 2048 ||
    !isValidGooglePhotoResourceName(photoName)
  ) {
    return noStoreJson({ error: "Invalid n" }, 400);
  }

  const url = buildPlacesPhotoMediaUrl(photoName);

  const res = await fetch(url, {
    method: "GET",
    headers: { "X-Goog-Api-Key": key },
    redirect: "follow",
  });

  if (!res.ok) {
    return noStoreJson({ error: "Upstream photo error" }, res.status);
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
