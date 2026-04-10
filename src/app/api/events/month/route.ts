import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/events/month?year=2026&month=4
 * Returns all events whose start_at falls within the given calendar month view
 * (padded to full weeks so the grid is complete).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const year = parseInt(sp.get("year") ?? "", 10);
  const month = parseInt(sp.get("month") ?? "", 10);

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  const first = new Date(Date.UTC(year, month - 1, 1));
  const dayOfWeek = first.getUTCDay();
  const gridStart = new Date(first);
  gridStart.setUTCDate(gridStart.getUTCDate() - dayOfWeek);

  const last = new Date(Date.UTC(year, month, 0));
  const endDayOfWeek = last.getUTCDay();
  const gridEnd = new Date(last);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - endDayOfWeek));

  const startYmd = gridStart.toISOString().slice(0, 10);
  const endYmd = gridEnd.toISOString().slice(0, 10) + "T23:59:59";

  const { data, error } = await supabase
    .from("events")
    .select("id,name,day,month,time,location,category,price,bg,cta,source_url,image_url,start_at,source")
    .or(`start_at.gte.${startYmd},start_at.is.null`)
    .lte("start_at", endYmd)
    .order("start_at", { ascending: true, nullsFirst: false })
    .limit(2000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [], gridStart: startYmd, gridEnd: endYmd.slice(0, 10) });
}
