import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPlacesConfigured,
  isValidGooglePhotoResourceName,
  marketKeyToRegionSuffix,
  placesGetDetails,
  placesTextSearchFirstEnriched,
} from "@/lib/places-api";

export type ThingsToDoEnrichRow = {
  id: string;
  title: string | null;
  venue: string | null;
  market_key: string | null;
  website: string | null;
  image_url: string | null;
  google_place_name: string | null;
  google_photo_name: string | null;
  google_photo_names?: string[] | null;
  opening_hours_text: string | null;
  place_formatted_address?: string | null;
  place_international_phone?: string | null;
  place_google_maps_uri?: string | null;
  place_editorial_summary?: string | null;
  google_rating?: number | null;
  google_user_rating_count?: number | null;
  /** Set by enrich; used for cron fetch ordering */
  place_enriched_at?: string | null;
  created_at?: string | null;
};

export type EnrichThingsToDoOptions = {
  /** When true, logs raw JSON for first 3 places from searchText (Railway logs). */
  logSearchSamples?: boolean;
};

/** Single source of truth for “what is still missing” on a row. */
export function getThingsToDoEnrichmentNeeds(row: ThingsToDoEnrichRow): {
  needWebsite: boolean;
  needImage: boolean;
  needHours: boolean;
  needPlacesExtras: boolean;
} {
  const needWebsite = !row.website?.trim();
  const storedPhoto = row.google_photo_name?.trim();
  const hasValidPhoto = storedPhoto
    ? isValidGooglePhotoResourceName(storedPhoto)
    : false;
  const names = row.google_photo_names;
  const hasArrayPhoto =
    Array.isArray(names) &&
    names.some((n) => {
      const t = n?.trim();
      return t ? isValidGooglePhotoResourceName(t) : false;
    });
  const needImage = !row.image_url?.trim() && !hasValidPhoto && !hasArrayPhoto;
  const needHours = !row.opening_hours_text?.trim();
  const hasPhotoList =
    Array.isArray(row.google_photo_names) && row.google_photo_names.some((n) => n?.trim());
  const hasPlacesMetadata =
    Boolean(row.place_formatted_address?.trim()) ||
    Boolean(row.place_google_maps_uri?.trim()) ||
    Boolean(row.place_international_phone?.trim()) ||
    Boolean(row.place_editorial_summary?.trim()) ||
    row.google_rating != null ||
    hasPhotoList;
  const needPlacesExtras = !hasPlacesMetadata;
  return { needWebsite, needImage, needHours, needPlacesExtras };
}

export function thingsToDoNeedsEnrichment(row: ThingsToDoEnrichRow): boolean {
  const n = getThingsToDoEnrichmentNeeds(row);
  return n.needWebsite || n.needImage || n.needHours || n.needPlacesExtras;
}

/**
 * Higher score = run sooner: never enriched first, then rows with more missing fields.
 * Used by the enrich cron so sparse rows aren’t stuck behind partial rows.
 */
export function thingsToDoEnrichmentQueueScore(row: ThingsToDoEnrichRow): number {
  if (!thingsToDoNeedsEnrichment(row)) return -1;
  const n = getThingsToDoEnrichmentNeeds(row);
  const gapCount =
    Number(n.needWebsite) +
    Number(n.needImage) +
    Number(n.needHours) +
    Number(n.needPlacesExtras);
  const neverEnriched = !row.place_enriched_at?.trim();
  return (neverEnriched ? 10_000 : 0) + gapCount * 100;
}


function buildTextQuery(row: ThingsToDoEnrichRow): string {
  const region = marketKeyToRegionSuffix(row.market_key);
  return [row.title, row.venue, region].filter(Boolean).join(" ").trim();
}

/**
 * Fills website, opening_hours_text, Google photos, and extended Place Details (address, phone, rating, maps URI, editorial summary).
 */
export async function enrichThingsToDoRow(
  supabase: SupabaseClient,
  row: ThingsToDoEnrichRow,
  options: EnrichThingsToDoOptions = {},
): Promise<{ ok: true; updated: string[] } | { ok: false; error: string }> {
  if (!isPlacesConfigured()) {
    return { ok: false, error: "GOOGLE_MAPS_API_KEY not set" };
  }

  if (!thingsToDoNeedsEnrichment(row)) {
    return { ok: true, updated: [] };
  }

  const {
    needWebsite,
    needImage,
    needHours,
    needPlacesExtras,
  } = getThingsToDoEnrichmentNeeds(row);
  const storedPhoto = row.google_photo_name?.trim();

  try {
    let placeName = row.google_place_name?.trim() ?? null;
    let websiteUri: string | null = null;
    let weekdayDescriptions: string[] | null = null;

    if (!placeName) {
      const q = buildTextQuery(row);
      if (!q) {
        return { ok: false, error: "No title/venue for search" };
      }
      const hit = await placesTextSearchFirstEnriched(q, Boolean(options.logSearchSamples));
      if (!hit) {
        return { ok: false, error: "No Places search results" };
      }
      placeName = hit.placeName;
      websiteUri = hit.websiteUri;
      weekdayDescriptions = hit.weekdayDescriptions;
    }

    const patch: Record<string, unknown> = {
      google_place_name: placeName,
      place_enriched_at: new Date().toISOString(),
    };
    const updated: string[] = [];

    const needsDetails =
      needImage ||
      (needWebsite && !websiteUri) ||
      (needHours && (!weekdayDescriptions || weekdayDescriptions.length === 0)) ||
      needPlacesExtras;

    let firstPhotoName: string | null = null;
    let detailPhotoNames: string[] = [];

    if (needsDetails && placeName) {
      const d = await placesGetDetails(placeName);
      if (needWebsite && !websiteUri && d.websiteUri) {
        websiteUri = d.websiteUri;
      }
      if (needHours && (!weekdayDescriptions?.length) && d.weekdayDescriptions?.length) {
        weekdayDescriptions = d.weekdayDescriptions;
      }
      if (d.photoNames.length > 0) {
        detailPhotoNames = d.photoNames;
        firstPhotoName = d.firstPhotoName;
      } else if (needImage && d.firstPhotoName) {
        firstPhotoName = d.firstPhotoName;
        detailPhotoNames = d.firstPhotoName ? [d.firstPhotoName] : [];
      }
      if (d.formattedAddress) {
        patch.place_formatted_address = d.formattedAddress;
        updated.push("place_formatted_address");
      }
      if (d.internationalPhoneNumber) {
        patch.place_international_phone = d.internationalPhoneNumber;
        updated.push("place_international_phone");
      }
      if (d.googleMapsUri) {
        patch.place_google_maps_uri = d.googleMapsUri;
        updated.push("place_google_maps_uri");
      }
      if (d.editorialSummary) {
        patch.place_editorial_summary = d.editorialSummary;
        updated.push("place_editorial_summary");
      }
      if (d.rating != null) {
        patch.google_rating = d.rating;
        updated.push("google_rating");
      }
      if (d.userRatingCount != null) {
        patch.google_user_rating_count = d.userRatingCount;
        updated.push("google_user_rating_count");
      }
    }

    if (needWebsite && websiteUri) {
      patch.website = websiteUri;
      updated.push("website");
    }
    if (detailPhotoNames.length > 0) {
      patch.google_photo_names = detailPhotoNames;
      updated.push("google_photo_names");
      const primary = detailPhotoNames[0];
      if (primary && isValidGooglePhotoResourceName(primary)) {
        patch.google_photo_name = primary;
        updated.push("google_photo_name");
      }
    } else if (needImage) {
      if (firstPhotoName && isValidGooglePhotoResourceName(firstPhotoName)) {
        patch.google_photo_name = firstPhotoName;
        updated.push("google_photo_name");
      } else if (storedPhoto && !isValidGooglePhotoResourceName(storedPhoto)) {
        patch.google_photo_name = null;
        updated.push("google_photo_name");
      }
    }
    if (needHours && weekdayDescriptions && weekdayDescriptions.length > 0) {
      patch.opening_hours_text = weekdayDescriptions.join("\n");
      updated.push("opening_hours_text");
    }

    const { error } = await supabase.from("things_to_do").update(patch).eq("id", row.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, updated: [...new Set(updated)] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
