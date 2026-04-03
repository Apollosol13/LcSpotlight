import type { RealEstateMarketKey } from "@/lib/real-estate-markets";

const PLACES_BASE = "https://places.googleapis.com/v1";

/** Approximate centers for biasing Text Search (meters). */
const MARKET_LOCATION_BIAS: Record<
  RealEstateMarketKey,
  { latitude: number; longitude: number; radiusMeters: number }
> = {
  hhi: { latitude: 32.1789, longitude: -80.7512, radiusMeters: 45_000 },
  bluffton: { latitude: 32.1271, longitude: -80.8604, radiusMeters: 40_000 },
  beaufort: { latitude: 32.4316, longitude: -80.6698, radiusMeters: 45_000 },
  savannah: { latitude: 32.0809, longitude: -81.0912, radiusMeters: 50_000 },
};

function getApiKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || null;
}

export type PlacesTextSearchHit = {
  name: string;
  id?: string;
};

type SearchTextResponse = {
  places?: Array<{ name?: string; id?: string }>;
};

type PlaceDetailsResponse = {
  name?: string;
  websiteUri?: string;
  photos?: Array<{ name?: string }>;
};

/**
 * Text Search (New). Returns first candidate place resource name, or null.
 */
export async function placesTextSearchFirst(
  textQuery: string,
  marketKey: string | null | undefined,
): Promise<PlacesTextSearchHit | null> {
  const key = getApiKey();
  if (!key || !textQuery.trim()) return null;

  const mk = (marketKey ?? "hhi") as RealEstateMarketKey;
  const bias = MARKET_LOCATION_BIAS[mk] ?? MARKET_LOCATION_BIAS.hhi;

  const body = {
    textQuery: textQuery.trim(),
    locationBias: {
      circle: {
        center: { latitude: bias.latitude, longitude: bias.longitude },
        radius: bias.radiusMeters,
      },
    },
  };

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.name",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`places:searchText ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as SearchTextResponse;
  const first = data.places?.[0];
  const name = first?.name?.trim();
  if (!name) return null;
  return { name, id: first?.id };
}

/**
 * Place Details (New) by resource name, e.g. places/ChIJ...
 */
export async function placesGetDetails(placeName: string): Promise<{
  websiteUri: string | null;
  firstPhotoName: string | null;
}> {
  const key = getApiKey();
  if (!key || !placeName.trim()) {
    return { websiteUri: null, firstPhotoName: null };
  }

  const id = placeName.replace(/^places\//, "").trim();
  if (!id) {
    return { websiteUri: null, firstPhotoName: null };
  }

  const url = `${PLACES_BASE}/places/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "websiteUri,photos",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`places.get ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as PlaceDetailsResponse;
  const websiteUri = data.websiteUri?.trim() || null;
  const firstPhotoName = data.photos?.[0]?.name?.trim() || null;
  return { websiteUri, firstPhotoName };
}

export function isPlacesConfigured(): boolean {
  return Boolean(getApiKey());
}
