import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";
import { scrapeGoogleNews } from "@/lib/scrapers/google-news";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

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
