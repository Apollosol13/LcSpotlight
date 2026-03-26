import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { scrapeIslandNews } from "@/lib/scrapers/island-news";
import { runEventIngest } from "@/lib/events/run-ingest";
import { scrapeGoogleNews } from "@/lib/scrapers/google-news";
import { scrapeRedfinToSupabase } from "@/lib/scrapers/redfin";
import { thingsToDoSeedData } from "@/lib/seed-data/things-to-do";

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
    results.eventsIngest = await runEventIngest(supabaseAdmin);
  } catch (err) {
    results.eventsIngest = { error: String(err) };
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
    const { error: tdErr } = await supabaseAdmin
      .from("things_to_do")
      .upsert(thingsToDoSeedData, { onConflict: "title" });
    results.thingsToDo = tdErr
      ? { error: tdErr.message }
      : { upserted: thingsToDoSeedData.length };
  } catch (err) {
    results.thingsToDo = { error: String(err) };
  }

  return NextResponse.json({ scraped: results });
}
