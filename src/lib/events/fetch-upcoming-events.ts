import type { SupabaseClient } from "@supabase/supabase-js";

/** YYYY-MM-DD in UTC — safe for PostgREST `start_at.gte` filters. */
export function todayUtcYmd(): string {
  const n = new Date();
  const y = n.getUTCFullYear();
  const m = String(n.getUTCMonth() + 1).padStart(2, "0");
  const d = String(n.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Public events intended for /events and home: not clearly past (by date),
 * soonest first; ties fall back to newest ingest.
 */
export function upcomingEventsQuery(
  client: SupabaseClient,
  options?: { limit?: number },
) {
  const ymd = todayUtcYmd();
  let q = client
    .from("events")
    .select("*")
    .or(`start_at.is.null,start_at.gte.${ymd}`)
    .order("start_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (options?.limit != null) q = q.limit(options.limit);
  return q;
}
