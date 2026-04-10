import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeBeaufortCalendarEvents } from "@/lib/scrapers/beaufort-calendar-events";

/** GET /api/cron/beaufort-calendar-events — Beaufort.com Event Organiser calendar. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const beaufortCalendarEvents = await scrapeBeaufortCalendarEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { beaufortCalendarEvents } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err);
    return NextResponse.json(
      { scraped: { beaufortCalendarEvents: { error: message } } },
      { status: 500 },
    );
  }
}
