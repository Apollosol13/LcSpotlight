import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeGoogleNewsForRegions } from "@/lib/scrapers/google-news";

/** GET /api/cron/google-news-hilton-head — Hilton Head Google News RSS only. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const googleNews = await scrapeGoogleNewsForRegions(supabaseAdmin, ["Hilton Head"]);
    return NextResponse.json({ scraped: { googleNews } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { googleNews: { error: String(err) } } },
      { status: 500 },
    );
  }
}
