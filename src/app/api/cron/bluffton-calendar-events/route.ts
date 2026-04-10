import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeBlufftonCalendarEvents } from "@/lib/scrapers/bluffton-calendar-events";

/** GET /api/cron/bluffton-calendar-events — Bluffton.com Event Organiser calendar. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const blufftonCalendarEvents = await scrapeBlufftonCalendarEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { blufftonCalendarEvents } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err);
    return NextResponse.json(
      { scraped: { blufftonCalendarEvents: { error: message } } },
      { status: 500 },
    );
  }
}
