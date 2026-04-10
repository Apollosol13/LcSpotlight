import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeIslandNews } from "@/lib/scrapers/island-news";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";
import { scrapeBlufftonCalendarEvents } from "@/lib/scrapers/bluffton-calendar-events";
import { scrapeHiltonHeadIslandEvents } from "@/lib/scrapers/hiltonhead-island-events";
import { scrapeGoogleNews } from "@/lib/scrapers/google-news";
import { scrapeRedfinToSupabase } from "@/lib/scrapers/redfin";
import { replaceThingsToDoFromSeed } from "@/lib/seed-data/replace-things-to-do";

/**
 * GET /api/cron/scrape-all — full batch (may exceed cron-job.org ~30s timeout).
 * Prefer separate jobs: /api/cron/island-news, /api/cron/bluffton-events, /api/cron/bluffton-calendar-events, /api/cron/hiltonhead-island-events, /api/cron/google-news,
 * /api/cron/google-news-beaufort, /api/cron/google-news-savannah, /api/cron/google-news-hilton-head,
 * /api/cron/google-news-bluffton, /api/cron/sync-listings,
 * /api/cron/things-to-do, /api/cron/things-to-do-enrich
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  const results: Record<string, unknown> = {};

  try {
    results.islandNews = await scrapeIslandNews(supabaseAdmin);
  } catch (err) {
    results.islandNews = { error: String(err) };
  }

  try {
    results.blufftonEvents = await scrapeBlufftonEvents(supabaseAdmin);
  } catch (err) {
    results.blufftonEvents = { error: String(err) };
  }

  try {
    results.blufftonCalendarEvents = await scrapeBlufftonCalendarEvents(supabaseAdmin);
  } catch (err) {
    results.blufftonCalendarEvents = { error: String(err) };
  }

  try {
    results.hiltonHeadIslandEvents = await scrapeHiltonHeadIslandEvents(supabaseAdmin);
  } catch (err) {
    results.hiltonHeadIslandEvents = { error: String(err) };
  }

  try {
    results.googleNews = await scrapeGoogleNews(supabaseAdmin);
  } catch (err) {
    results.googleNews = { error: String(err) };
  }

  try {
    results.redfin = await scrapeRedfinToSupabase(supabaseAdmin);
  } catch (err) {
    results.redfin = { error: String(err) };
  }

  try {
    const tdRes = await replaceThingsToDoFromSeed(supabaseAdmin);
    results.thingsToDo = tdRes.ok
      ? {
          replaced: true,
          deleted: tdRes.deleted,
          inserted: tdRes.inserted,
          verifiedCount: tdRes.verifiedCount,
        }
      : { stage: tdRes.stage, error: tdRes.error };
  } catch (err) {
    results.thingsToDo = { error: String(err) };
  }

  return NextResponse.json({ scraped: results });
}
