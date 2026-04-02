import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";
import { scrapeGoogleNews } from "@/lib/scrapers/google-news";

/** GET /api/cron/events — Bluffton RSS + all Google News regions (runs both in parallel). */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  const results: Record<string, unknown> = {};

  const [blufftonRes, googleRes] = await Promise.allSettled([
    scrapeBlufftonEvents(supabaseAdmin),
    scrapeGoogleNews(supabaseAdmin),
  ]);

  results.blufftonEvents =
    blufftonRes.status === "fulfilled" ? blufftonRes.value : { error: String(blufftonRes.reason) };
  results.googleNews =
    googleRes.status === "fulfilled" ? googleRes.value : { error: String(googleRes.reason) };

  return NextResponse.json({ scraped: results });
}
