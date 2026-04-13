import { NextRequest, NextResponse } from "next/server";
import { siteSearch } from "@/lib/site-search";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=… — JSON results for programmatic use (min2 chars).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const hits = await siteSearch(supabase, q);
  return NextResponse.json({
    query: q.trim(),
    hits,
    count: hits.length,
  });
}
