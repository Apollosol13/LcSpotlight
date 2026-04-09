import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeEventbriteEvents } from "@/lib/scrapers/eventbrite-events";

/** GET /api/cron/eventbrite-events — Eventbrite events for all 4 Lowcountry areas. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const eventbriteEvents = await scrapeEventbriteEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { eventbriteEvents } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json(
      { scraped: { eventbriteEvents: { error: msg } } },
      { status: 500 },
    );
  }
}
