import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { scrapeIslandNews } from "@/lib/scrapers/island-news";

/** GET /api/cron/island-news — Island Packet / local news only. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const islandNews = await scrapeIslandNews(supabaseAdmin);
    return NextResponse.json({ scraped: { islandNews } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { islandNews: { error: String(err) } } },
      { status: 500 },
    );
  }
}
