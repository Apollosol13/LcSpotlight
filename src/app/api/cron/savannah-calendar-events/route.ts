import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeSavannahCalendarEvents } from "@/lib/scrapers/savannah-calendar-events";

/** GET /api/cron/savannah-calendar-events — Savannah.com Event Organiser calendar. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const savannahCalendarEvents = await scrapeSavannahCalendarEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { savannahCalendarEvents } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err);
    return NextResponse.json(
      { scraped: { savannahCalendarEvents: { error: message } } },
      { status: 500 },
    );
  }
}
