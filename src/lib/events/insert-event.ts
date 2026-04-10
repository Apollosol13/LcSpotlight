import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDedupeKey, dateKeyFromDayMonth, dateKeyFromIso } from "./dedupe";

export type EventInsert = {
  name: string;
  day: string;
  month: string;
  time: string | null;
  location: string | null;
  category: string | null;
  price: string | null;
  bg: string | null;
  icon: string | null;
  cta: string;
  source: string;
  source_url?: string | null;
  image_url?: string | null;
  start_at?: string | null;
  dedupe_key: string;
};

export type InsertEventOptions = {
  /**
   * When false, only `dedupe_key` (and DB unique constraints) prevent duplicates.
   * Use for feeds where the same listing URL repeats on many calendar days.
   */
  dedupeBySourceUrl?: boolean;
};

/**
 * Inserts one event if not already present (dedupe_key or same source_url).
 * Requires sql/20260107_events_enrichment.sql applied for full behavior.
 */
export async function insertEventIfNew(
  supabase: SupabaseClient,
  row: EventInsert,
  options?: InsertEventOptions,
): Promise<{ inserted: boolean; reason?: string }> {
  const dedupeUrl = options?.dedupeBySourceUrl !== false;
  if (dedupeUrl && row.source_url) {
    const { data: byUrl } = await supabase
      .from("events")
      .select("id")
      .eq("source_url", row.source_url)
      .maybeSingle();
    if (byUrl) {
      return { inserted: false, reason: "source_url" };
    }
  }

  const { data: byKey } = await supabase
    .from("events")
    .select("id")
    .eq("dedupe_key", row.dedupe_key)
    .maybeSingle();

  if (byKey) {
    return { inserted: false, reason: "dedupe_key" };
  }

  const payload: Record<string, unknown> = {
    name: row.name,
    day: row.day,
    month: row.month,
    time: row.time,
    location: row.location,
    category: row.category,
    price: row.price,
    bg: row.bg,
    icon: row.icon,
    cta: row.cta,
    source: row.source,
    dedupe_key: row.dedupe_key,
  };

  if (row.source_url) payload.source_url = row.source_url;
  if (row.image_url) payload.image_url = row.image_url;
  if (row.start_at) payload.start_at = row.start_at;

  const { error } = await supabase.from("events").insert(payload);

  if (error) {
    if (error.code === "23505" || /duplicate key/i.test(error.message)) {
      return { inserted: false, reason: "unique_violation" };
    }
    throw error;
  }

  return { inserted: true };
}

export function dedupeKeyFromIso(
  name: string,
  startIso: string | null,
  location: string | null,
): string {
  const dk = dateKeyFromIso(startIso) ?? "unknown";
  return buildDedupeKey(name, dk, location);
}

export function dedupeKeyFromDayMonth(
  name: string,
  day: string,
  month: string,
  location: string | null,
): string {
  const dk = dateKeyFromDayMonth(day, month);
  return buildDedupeKey(name, dk, location);
}
