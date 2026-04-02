import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeSerpApiGoogleEvents } from "@/lib/scrapers/serpapi-google-events";

/** GET /api/cron/serpapi-events — Google Events via SerpAPI for all configured locations. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const serpApiGoogleEvents = await scrapeSerpApiGoogleEvents(supabaseAdmin);
    return NextResponse.json({ scraped: { serpApiGoogleEvents } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { serpApiGoogleEvents: { error: String(err) } } },
      { status: 500 },
    );
  }
}
