import type { SupabaseClient } from "@supabase/supabase-js";

/** YYYY-MM-DD in America/New_York so past events drop off in local time. */
export function todayEasternYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Public events intended for /events and home: not clearly past (by date),
 * soonest first; ties fall back to newest ingest.
 */
export function upcomingEventsQuery(
  client: SupabaseClient,
  options?: { limit?: number },
) {
  const ymd = todayEasternYmd();
  let q = client
    .from("events")
    .select("*")
    .or(`start_at.is.null,start_at.gte.${ymd}`)
    .order("start_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (options?.limit != null) q = q.limit(options.limit);
  return q;
}
