import type { RealEstateMarketKey } from "@/lib/real-estate-markets";

const PLACES_BASE = "https://places.googleapis.com/v1";

/**
 * X-Goog-FieldMask for POST places:searchText — must be a header, never a body field.
 */
export const PLACES_SEARCH_TEXT_FIELD_MASK =
  "places.id,places.displayName,places.regularOpeningHours,places.websiteUri,places.rating,places.userRatingCount";

const LOG_PREFIX = "[places:searchText]";

function getApiKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || null;
}

/** Appends region so textQuery reads like "Business Name City State". */
export function marketKeyToRegionSuffix(marketKey: string | null | undefined): string {
  const k = (marketKey ?? "hhi").toString().trim().toLowerCase();
  switch (k as RealEstateMarketKey) {
    case "bluffton":
      return "Bluffton SC";
    case "beaufort":
      return "Beaufort SC";
    case "savannah":
      return "Savannah GA";
    case "hhi":
    default:
      return "Hilton Head Island SC";
  }
}

export type PlacesSearchPlace = {
  id?: string;
  /** Present only if requested in field mask; search mask above omits it — derive from id. */
  name?: string;
  displayName?: { text?: string };
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
};

type SearchTextResponse = {
  places?: PlacesSearchPlace[];
};

export type PlacesTextSearchEnrichedFirst = {
  placeName: string;
  websiteUri: string | null;
  weekdayDescriptions: string[] | null;
  /** Search response does not include photos with our field mask; filled via placesGetDetails. */
  firstPhotoName: null;
  rating?: number;
  userRatingCount?: number;
};

function placeResourceName(place: PlacesSearchPlace): string | null {
  const n = place.name?.trim();
  if (n) return n;
  const id = place.id?.trim();
  if (!id) return null;
  return id.startsWith("places/") ? id : `places/${id}`;
}

/**
 * Text Search (New): POST body is only `{ textQuery }`. Field mask only in X-Goog-FieldMask header.
 */
export async function placesTextSearchFirstEnriched(
  textQuery: string,
  logRawFirstThree: boolean,
): Promise<PlacesTextSearchEnrichedFirst | null> {
  const key = getApiKey();
  if (!key || !textQuery.trim()) return null;

  const body = { textQuery: textQuery.trim() };

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": PLACES_SEARCH_TEXT_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`places:searchText ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as SearchTextResponse;

  if (logRawFirstThree && data.places && data.places.length > 0) {
    console.log(
      `${LOG_PREFIX} first 3 raw:`,
      JSON.stringify(data.places.slice(0, 3), null, 2),
    );
  }

  const first = data.places?.[0];
  if (!first) return null;

  const placeName = placeResourceName(first);
  if (!placeName) return null;

  const websiteUri = first.websiteUri?.trim() || null;
  const weekdayDescriptions =
    first.regularOpeningHours?.weekdayDescriptions &&
    first.regularOpeningHours.weekdayDescriptions.length > 0
      ? [...first.regularOpeningHours.weekdayDescriptions]
      : null;

  return {
    placeName,
    websiteUri,
    weekdayDescriptions,
    firstPhotoName: null,
    rating: first.rating,
    userRatingCount: first.userRatingCount,
  };
}

type PlaceDetailsResponse = {
  name?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  photos?: Array<{ name?: string }>;
};

/**
 * Google Places photo media URLs require a photo resource name like
 * `places/ChIJ…/photos/AW…`, not the place resource alone (`places/ChIJ…`).
 */
export function isValidGooglePhotoResourceName(name: string): boolean {
  const n = name.trim();
  return n.startsWith("places/") && n.includes("/photos/");
}

/**
 * Build GET URL for Place Photo media (New API). Each path segment must be
 * percent-encoded; naive string concat breaks when IDs contain reserved chars.
 */
export function buildPlacesPhotoMediaUrl(
  photoResourceName: string,
  maxHeightPx = 1200,
  maxWidthPx = 1200,
): string {
  const trimmed = photoResourceName.trim();
  const segments = trimmed.split("/").filter(Boolean);
  const encodedPath = segments.map((s) => encodeURIComponent(s)).join("/");
  const u = new URL(`https://places.googleapis.com/v1/${encodedPath}/media`);
  u.searchParams.set("maxHeightPx", String(maxHeightPx));
  u.searchParams.set("maxWidthPx", String(maxWidthPx));
  return u.toString();
}

/**
 * Place Details (New) by place id segment (with or without places/ prefix).
 */
export async function placesGetDetails(placeName: string): Promise<{
  websiteUri: string | null;
  firstPhotoName: string | null;
  weekdayDescriptions: string[] | null;
}> {
  const key = getApiKey();
  if (!key || !placeName.trim()) {
    return { websiteUri: null, firstPhotoName: null, weekdayDescriptions: null };
  }

  const id = placeName.replace(/^places\//, "").trim();
  if (!id) {
    return { websiteUri: null, firstPhotoName: null, weekdayDescriptions: null };
  }

  const url = `${PLACES_BASE}/places/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "websiteUri,photos,regularOpeningHours",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`places.get ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as PlaceDetailsResponse;
  const websiteUri = data.websiteUri?.trim() || null;
  let firstPhotoName: string | null = null;
  for (const p of data.photos ?? []) {
    const candidate = p.name?.trim();
    if (candidate && isValidGooglePhotoResourceName(candidate)) {
      firstPhotoName = candidate;
      break;
    }
  }
  const weekdayDescriptions =
    data.regularOpeningHours?.weekdayDescriptions &&
    data.regularOpeningHours.weekdayDescriptions.length > 0
      ? [...data.regularOpeningHours.weekdayDescriptions]
      : null;
  return { websiteUri, firstPhotoName, weekdayDescriptions };
}

export function isPlacesConfigured(): boolean {
  return Boolean(getApiKey());
}
