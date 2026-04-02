import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { syncRedfinListings } from "@/lib/sync/redfin-listings-sync";

/**
 * GET /api/cron/sync-listings
 * Authorization: Bearer CRON_SECRET
 *
 * Railway / cron-job.org: GET with Authorization header. Same CRON_SECRET as the app env.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

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
