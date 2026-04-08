import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import {
  enrichThingsToDoRow,
  thingsToDoNeedsEnrichment,
  type ThingsToDoEnrichRow,
} from "@/lib/things-to-do-enrich";

const BATCH = 20;
const DELAY_MS = 200;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * GET /api/cron/things-to-do-enrich — Backfill website, hours, Google photos, and Place Details (address, phone, rating, maps URI, editorial summary).
 * Requires GOOGLE_MAPS_API_KEY and Places API (New) enabled. Auth: Bearer CRON_SECRET.
 *
 * Rows are ordered with `place_enriched_at` NULLS FIRST so never-enriched listings are
 * processed before recently touched rows (fairer across markets than `created_at` alone).
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from("things_to_do")
      .select(
        "id, title, venue, market_key, website, image_url, google_place_name, google_photo_name, google_photo_names, opening_hours_text, place_formatted_address, place_international_phone, place_google_maps_uri, place_editorial_summary, google_rating, google_user_rating_count, place_enriched_at, created_at",
      )
      .order("place_enriched_at", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false })
      .limit(500);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const list = (rows ?? []) as ThingsToDoEnrichRow[];
    const candidates = list.filter(thingsToDoNeedsEnrichment).slice(0, BATCH);

    const results: Array<{ id: string; ok: boolean; updated?: string[]; error?: string }> = [];

    for (let i = 0; i < candidates.length; i++) {
      const row = candidates[i];
      const out = await enrichThingsToDoRow(supabaseAdmin, row, {
        logSearchSamples: i === 0,
      });
      if (out.ok) {
        results.push({ id: row.id, ok: true, updated: out.updated });
      } else {
        results.push({ id: row.id, ok: false, error: out.error });
      }
      await sleep(DELAY_MS);
    }

    if (results.some((r) => r.ok && r.updated && r.updated.length > 0)) {
      revalidatePath("/");
      revalidatePath("/things-to-do");
    }

    return NextResponse.json({
      batch: BATCH,
      processed: results.length,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
