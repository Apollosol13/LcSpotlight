import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeHiltonHeadIslandEvents } from "@/lib/scrapers/hiltonhead-island-events";

/** GET /api/cron/hiltonhead-island-events — HiltonHeadIsland.com Event Organiser calendar. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const hiltonHeadIslandEvents = await scrapeHiltonHeadIslandEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { hiltonHeadIslandEvents } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err);
    return NextResponse.json(
      { scraped: { hiltonHeadIslandEvents: { error: message } } },
      { status: 500 },
    );
  }
}
