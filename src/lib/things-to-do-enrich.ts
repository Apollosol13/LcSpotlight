import type { SupabaseClient } from "@supabase/supabase-js";
import { isPlacesConfigured, placesGetDetails, placesTextSearchFirst } from "@/lib/places-api";

export type ThingsToDoEnrichRow = {
  id: string;
  title: string | null;
  venue: string | null;
  market_key: string | null;
  website: string | null;
  image_url: string | null;
  google_place_name: string | null;
  google_photo_name: string | null;
};

function needsEnrichment(row: ThingsToDoEnrichRow): boolean {
  const needWebsite = !row.website?.trim();
  const needImage = !row.image_url?.trim() && !row.google_photo_name?.trim();
  return needWebsite || needImage;
}

/**
 * Fills missing website and/or Google photo from Places API (New).
 * Saves `google_place_name` for future runs; sets `place_enriched_at` on success.
 */
export async function enrichThingsToDoRow(
  supabase: SupabaseClient,
  row: ThingsToDoEnrichRow,
): Promise<{ ok: true; updated: string[] } | { ok: false; error: string }> {
  if (!isPlacesConfigured()) {
    return { ok: false, error: "GOOGLE_MAPS_API_KEY not set" };
  }

  if (!needsEnrichment(row)) {
    return { ok: true, updated: [] };
  }

  const needWebsite = !row.website?.trim();
  const needImage = !row.image_url?.trim() && !row.google_photo_name?.trim();

  try {
    let placeName = row.google_place_name?.trim() ?? null;

    if (!placeName) {
      const q = [row.title, row.venue].filter(Boolean).join(" ").trim();
      if (!q) {
        return { ok: false, error: "No title/venue for search" };
      }
      const hit = await placesTextSearchFirst(q, row.market_key);
      if (!hit?.name) {
        return { ok: false, error: "No Places search results" };
      }
      placeName = hit.name;
    }

    const { websiteUri, firstPhotoName } = await placesGetDetails(placeName);

    const patch: Record<string, unknown> = {
      google_place_name: placeName,
      place_enriched_at: new Date().toISOString(),
    };
    const updated: string[] = [];

    if (needWebsite && websiteUri) {
      patch.website = websiteUri;
      updated.push("website");
    }
    if (needImage && firstPhotoName) {
      patch.google_photo_name = firstPhotoName;
      updated.push("google_photo_name");
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
