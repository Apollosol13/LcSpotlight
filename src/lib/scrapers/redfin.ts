/**
 * Re-exports GIS helpers + legacy scrape entrypoint (calls sync pipeline).
 * Respect Redfin’s Terms of Use; endpoints can change or block datacenter IPs.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { syncRedfinListings } from "@/lib/sync/redfin-listings-sync";

export type { RedfinHome } from "@/lib/redfin-gis";
export {
  parseStingrayJson,
  pickLatLong,
  pickNum,
  pickStr,
  redfinThumbnailUrl,
  uiPropertyLabel,
} from "@/lib/redfin-gis";

/** @deprecated Prefer syncRedfinListings; kept for /api/scrape and legacy cron routes. */
export async function scrapeRedfinToSupabase(supabase: SupabaseClient): Promise<{
  markets: { key: string; inserted: number; markedRemoved?: number; error?: string }[];
}> {
  const { markets } = await syncRedfinListings(supabase);
  return {
    markets: markets.map((m) => ({
      key: m.key,
      inserted: m.upserted,
      markedRemoved: m.markedRemoved,
      error: m.error,
    })),
  };
}
