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
  opening_hours_text: string | null;
};

export type EnrichThingsToDoOptions = {
  /** When true, logs raw JSON for first 3 places from searchText (Railway logs). */
  logSearchSamples?: boolean;
};

function needsEnrichment(row: ThingsToDoEnrichRow): boolean {
  const needWebsite = !row.website?.trim();
  const storedPhoto = row.google_photo_name?.trim();
  const hasValidPhoto = storedPhoto
    ? isValidGooglePhotoResourceName(storedPhoto)
    : false;
  const needImage = !row.image_url?.trim() && !hasValidPhoto;
  const needHours = !row.opening_hours_text?.trim();
  return needWebsite || needImage || needHours;
}

function buildTextQuery(row: ThingsToDoEnrichRow): string {
  const region = marketKeyToRegionSuffix(row.market_key);
  return [row.title, row.venue, region].filter(Boolean).join(" ").trim();
}

/**
 * Fills website, opening_hours_text (weekdayDescriptions), and/or Google photo from Places API (New).
 */
export async function enrichThingsToDoRow(
  supabase: SupabaseClient,
  row: ThingsToDoEnrichRow,
  options: EnrichThingsToDoOptions = {},
): Promise<{ ok: true; updated: string[] } | { ok: false; error: string }> {
  if (!isPlacesConfigured()) {
    return { ok: false, error: "GOOGLE_MAPS_API_KEY not set" };
  }

  if (!needsEnrichment(row)) {
    return { ok: true, updated: [] };
  }

  const needWebsite = !row.website?.trim();
  const storedPhoto = row.google_photo_name?.trim();
  const hasValidPhoto = storedPhoto
    ? isValidGooglePhotoResourceName(storedPhoto)
    : false;
  const needImage = !row.image_url?.trim() && !hasValidPhoto;
  const needHours = !row.opening_hours_text?.trim();

  try {
    let placeName = row.google_place_name?.trim() ?? null;
    let websiteUri: string | null = null;
    let weekdayDescriptions: string[] | null = null;
    let firstPhotoName: string | null = null;

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
      (needHours && (!weekdayDescriptions || weekdayDescriptions.length === 0));

    if (needsDetails && placeName) {
      const d = await placesGetDetails(placeName);
      if (needWebsite && !websiteUri && d.websiteUri) {
        websiteUri = d.websiteUri;
      }
      if (needImage && d.firstPhotoName) {
        firstPhotoName = d.firstPhotoName;
      }
      if (needHours && (!weekdayDescriptions?.length) && d.weekdayDescriptions?.length) {
        weekdayDescriptions = d.weekdayDescriptions;
      }
    }

    if (needWebsite && websiteUri) {
      patch.website = websiteUri;
      updated.push("website");
    }
    if (needImage) {
      if (firstPhotoName && isValidGooglePhotoResourceName(firstPhotoName)) {
        patch.google_photo_name = firstPhotoName;
        updated.push("google_photo_name");
      } else if (
        storedPhoto &&
        !isValidGooglePhotoResourceName(storedPhoto)
      ) {
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

    return { ok: true, updated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
