import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns the UTC ISO timestamp for midnight today in America/New_York.
 * e.g. April 10 00:00 Eastern (EDT) = April 10 04:00:00Z
 * This ensures PostgREST compares against the right UTC instant.
 */
export function todayEasternMidnightUtc(): string {
  const eastern = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const midnightEastern = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(new Date(eastern + "T00:00:00"))
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") p[part.type] = part.value;
  }

  const todayStr = `${p.year}-${p.month}-${p.day}`;
  const guessUtc = new Date(todayStr + "T04:00:00Z");
  const check = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(guessUtc);

  if (check === todayStr) {
    return guessUtc.toISOString();
  }
  return new Date(todayStr + "T05:00:00Z").toISOString();
}

/**
 * Public events intended for /events and home: not clearly past (by date),
 * soonest first; ties fall back to newest ingest.
 */
export function upcomingEventsQuery(
  client: SupabaseClient,
  options?: { limit?: number },
) {
  const cutoff = todayEasternMidnightUtc();
  let q = client
    .from("events")
    .select("*")
    .or(`start_at.is.null,start_at.gte.${cutoff}`)
    .order("start_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (options?.limit != null) q = q.limit(options.limit);
  return q;
}
