import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { syncRedfinListings } from "@/lib/sync/redfin-listings-sync";

/**
 * GET /api/cron/sync-listings
 * Authorization: Bearer CRON_SECRET
 *
 * Railway: add a Cron job (every 6 hours) and run curl with Authorization header
 * pointing at this path. Use the same CRON_SECRET as env on the app service.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncRedfinListings(supabaseAdmin);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
