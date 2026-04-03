import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { isValidGooglePhotoResourceName } from "@/lib/places-api";
import { enrichThingsToDoRow, type ThingsToDoEnrichRow } from "@/lib/things-to-do-enrich";

const BATCH = 20;
const DELAY_MS = 200;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * GET /api/cron/things-to-do-enrich — Backfill website, opening_hours_text, google_photo_name.
 * Requires GOOGLE_MAPS_API_KEY and Places API (New) enabled. Auth: Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from("things_to_do")
      .select(
        "id, title, venue, market_key, website, image_url, google_place_name, google_photo_name, opening_hours_text",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const list = (rows ?? []) as ThingsToDoEnrichRow[];
    const candidates = list
      .filter((r) => {
        const needWebsite = !r.website?.trim();
        const storedPhoto = r.google_photo_name?.trim();
        const hasValidPhoto = storedPhoto
          ? isValidGooglePhotoResourceName(storedPhoto)
          : false;
        const needImage = !r.image_url?.trim() && !hasValidPhoto;
        const needHours = !r.opening_hours_text?.trim();
        return needWebsite || needImage || needHours;
      })
      .slice(0, BATCH);

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
