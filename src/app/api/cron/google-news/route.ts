import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeGoogleNews } from "@/lib/scrapers/google-news";

/** GET /api/cron/google-news — All four region RSS feeds (HHI, Bluffton, Beaufort, Savannah). */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const googleNews = await scrapeGoogleNews(supabaseAdmin);
    return NextResponse.json({ scraped: { googleNews } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { googleNews: { error: String(err) } } },
      { status: 500 },
    );
  }
}
