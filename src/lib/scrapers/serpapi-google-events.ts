import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dedupeKeyFromIso,
  insertEventIfNew,
  type EventInsert,
} from "@/lib/events/insert-event";

type SerpEventItem = {
  title?: string;
  date?: string;
  link?: string;
  thumbnail?: string;
  venue?: string;
  address?: string | string[];
  ticket_info?: { source?: string; link?: string }[];
};

function parseSerpEventDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d;
  const withYear = `${dateStr} ${new Date().getFullYear()}`;
  const d2 = new Date(withYear);
  if (!Number.isNaN(d2.getTime())) return d2;
  return null;
}

function formatAddress(addr: string | string[] | undefined): string | null {
  if (!addr) return null;
  if (Array.isArray(addr)) return addr.filter(Boolean).join(", ") || null;
  return addr;
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/\b(jazz|music|concert|band|symphony)\b/.test(t)) return "Music";
  if (/\b(wine|food|tasting|restaurant|dinner|brunch)\b/.test(t)) return "Food & Drink";
  if (/\b(art|gallery|theatre|theater|play|musical)\b/.test(t)) return "Arts";
  if (/\b(run|race|5k|marathon|yoga|fitness)\b/.test(t)) return "Wellness";
  if (/\b(market|fair|festival)\b/.test(t)) return "Community";
  return "Community";
}

function serpItemToInsert(item: SerpEventItem, sourceTag: string): EventInsert | null {
  const name = item.title?.trim();
  if (!name) return null;

  const link =
    item.link?.trim() ||
    item.ticket_info?.find((t) => t.link)?.link?.trim() ||
    null;
  const start = parseSerpEventDate(item.date);
  const startIso = start ? start.toISOString() : null;

  let day = "??";
  let month = "???";
  if (start) {
    day = String(start.getDate()).padStart(2, "0");
    month = start.toLocaleDateString("en-US", { month: "short" });
  }

  const venue = item.venue ?? formatAddress(item.address);
  const location = venue ?? "Lowcountry, SC";

  const time =
    start && item.date && /(\d{1,2}:\d{2}|am|pm)/i.test(item.date)
      ? start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : null;

  const dedupe_key = dedupeKeyFromIso(name, startIso, location);

  return {
    name,
    day,
    month,
    time,
    location,
    category: guessCategory(name),
    price: "See listing",
    bg: "#112250",
    icon: null,
    cta: "More info",
    source: sourceTag,
    source_url: link ?? null,
    image_url: item.thumbnail?.trim() ?? null,
    start_at: startIso,
    dedupe_key,
  };
}

/**
 * Ingests Google Events results via SerpApi (google_events engine).
 * Set SERPAPI_KEY. Optional: SERPAPI_EVENT_LOCATIONS pipe-separated, e.g.
 * `Bluffton, SC, United States|Hilton Head Island, SC, United States`
 */
export async function scrapeSerpApiGoogleEvents(supabase: SupabaseClient) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return {
      skipped: true as const,
      reason: "SERPAPI_KEY not set",
      inserted: 0,
      attempted: 0,
    };
  }

  const locations =
    process.env.SERPAPI_EVENT_LOCATIONS?.split("|")
      .map((s) => s.trim())
      .filter(Boolean) ??
    ["Bluffton, SC, United States", "Hilton Head Island, SC, United States"];

  let inserted = 0;
  let skipped = 0;
  let attempted = 0;

  for (const location of locations) {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_events");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("q", "Events");
    url.searchParams.set("location", location);
    url.searchParams.set("hl", "en");
    url.searchParams.set("gl", "us");

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`SerpApi HTTP ${res.status} for ${location}`);
    }

    const json = (await res.json()) as {
      events_results?: SerpEventItem[];
      error?: string;
    };

    if (json.error) {
      throw new Error(`SerpApi: ${json.error}`);
    }

    const items = json.events_results ?? [];
    for (const item of items) {
      attempted++;
      const row = serpItemToInsert(item, "serpapi:google_events");
      if (!row) {
        skipped++;
        continue;
      }
      const r = await insertEventIfNew(supabase, row);
      if (r.inserted) inserted++;
      else skipped++;
    }
  }

  return { inserted, skipped, attempted, locations: locations.length };
}
