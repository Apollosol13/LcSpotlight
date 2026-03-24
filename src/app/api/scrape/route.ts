import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { scrapeIslandNews } from "@/lib/scrapers/island-news";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";
import { scrapeGoogleNews } from "@/lib/scrapers/google-news";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    results.googleNews = await scrapeGoogleNews(supabaseAdmin);
  } catch (err) {
    results.googleNews = { error: String(err) };
  }

  return NextResponse.json({ scraped: results });
}
