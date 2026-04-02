import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";

/** GET /api/cron/bluffton-events — Town of Bluffton calendar RSS only. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const blufftonEvents = await scrapeBlufftonEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { blufftonEvents } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { blufftonEvents: { error: String(err) } } },
      { status: 500 },
    );
  }
}
