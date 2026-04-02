import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import {
  SERPAPI_LOCATION_SAVANNAH,
  scrapeSerpApiGoogleEventsForLocations,
} from "@/lib/scrapers/serpapi-google-events";

/** GET /api/cron/serpapi-events-savannah — SerpAPI Google Events for Savannah only (needs SERPAPI_KEY). */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const serpApiGoogleEvents = await scrapeSerpApiGoogleEventsForLocations(supabaseAdmin, [
      SERPAPI_LOCATION_SAVANNAH,
    ]);
    return NextResponse.json({ scraped: { serpApiGoogleEvents } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { serpApiGoogleEvents: { error: String(err) } } },
      { status: 500 },
    );
  }
}
