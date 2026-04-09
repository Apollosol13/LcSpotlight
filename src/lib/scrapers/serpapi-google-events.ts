import type { SupabaseClient } from "@supabase/supabase-js";
import { dedupeKeyFromDayMonth, dedupeKeyFromIso, insertEventIfNew } from "@/lib/events/insert-event";

type SerpDate = {
  start_date?: string;
  when?: string;
};

type SerpEventResult = {
  title?: string;
  date?: SerpDate;
  address?: string[];
  link?: string;
  thumbnail?: string;
  venue?: { name?: string };
};

type SerpApiResponse = {
  events_results?: SerpEventResult[];
  error?: string;
};

export const SERPAPI_LOCATION_BEAUFORT = "Beaufort, SC, United States";
export const SERPAPI_LOCATION_SAVANNAH = "Savannah, GA, United States";

function defaultLocations(): string[] {
  const raw = process.env.SERPAPI_EVENT_LOCATIONS;
  if (raw?.trim()) {
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [
    "Bluffton, SC, United States",
    "Hilton Head Island, SC, United States",
    SERPAPI_LOCATION_BEAUFORT,
    SERPAPI_LOCATION_SAVANNAH,
  ];
}

function parseStartAt(dateObj: SerpDate | undefined): string | null {
  if (!dateObj) return null;
  const sd = dateObj.start_date;
  if (sd) {
    const d = new Date(sd);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const when = dateObj.when;
  if (when) {
    const d = new Date(when);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function dayMonthFromStartAt(iso: string | null): { day: string; month: string } {
  if (!iso) return { day: "??", month: "???" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "??", month: "???" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-US", { month: "short" }),
  };
}

function extractTimeFromWhen(when: string | undefined): string | null {
  if (!when) return null;
  const m = when.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  return m ? m[1] : null;
}

function locationLine(ev: SerpEventResult): string | null {
  if (ev.venue?.name) return ev.venue.name;
  if (ev.address?.length) return ev.address.filter(Boolean).join(", ");
  return null;
}

function safeImageUrl(thumbnail: string | undefined): string | null {
  if (!thumbnail?.trim()) return null;
  const t = thumbnail.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return null;
}

export async function scrapeSerpApiGoogleEvents(supabase: SupabaseClient) {
  return scrapeSerpApiGoogleEventsForLocations(supabase, defaultLocations());
}

export type SerpApiGoogleEventsResult = {
  total: number;
  inserted: number;
  skipped: number;
  /** Number of location queries run */
  locations?: number;
  message?: string;
};

export async function scrapeSerpApiGoogleEventsForLocations(
  supabase: SupabaseClient,
  locations: string[],
): Promise<SerpApiGoogleEventsResult> {
  const apiKey = process.env.SERPAPI_KEY?.trim();
  if (!apiKey) {
    return {
      total: 0,
      inserted: 0,
      skipped: 0,
      message: "SERPAPI_KEY not set — skipping Google Events ingest",
    };
  }

  if (locations.length === 0) {
    return {
      total: 0,
      inserted: 0,
      skipped: 0,
      locations: 0,
      message: "No locations provided",
    };
  }

  let total = 0;
  let inserted = 0;
  let skipped = 0;

  for (const location of locations) {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_events");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("location", location);
    url.searchParams.set("q", "Events");

    const res = await fetch(url.toString());
    const bodyText = await res.text();

    if (!res.ok) {
      let detail = bodyText.slice(0, 500);
      try {
        const errJson = JSON.parse(bodyText) as { error?: string };
        if (errJson.error) detail = errJson.error;
      } catch {
        /* use raw slice */
      }
      throw new Error(
        `SerpAPI HTTP ${res.status} for location ${location}: ${detail}`,
      );
    }

    const json = JSON.parse(bodyText) as SerpApiResponse;
    if (json.error) {
      throw new Error(`SerpAPI: ${json.error}`);
    }

    const items = json.events_results ?? [];
    for (const ev of items) {
      total++;
      const name = ev.title?.trim();
      if (!name) {
        skipped++;
        continue;
      }

      const startAt = parseStartAt(ev.date);
      const { day, month } = dayMonthFromStartAt(startAt);
      const time = extractTimeFromWhen(ev.date?.when) ?? null;
      const loc = locationLine(ev);
      const sourceUrl = ev.link?.trim() ?? null;
      const imageUrl = safeImageUrl(ev.thumbnail);

      const dedupe_key = startAt
        ? dedupeKeyFromIso(name, startAt, loc)
        : dedupeKeyFromDayMonth(name, day, month, loc);

      const { inserted: did } = await insertEventIfNew(supabase, {
        name,
        day,
        month,
        time,
        location: loc,
        category: "Events",
        price: "See listing",
        bg: "#3C507D",
        icon: null,
        cta: "More info",
        source: "serpapi:google_events",
        source_url: sourceUrl,
        image_url: imageUrl,
        start_at: startAt,
        dedupe_key,
      });

      if (did) inserted++;
      else skipped++;
    }
  }

  return { total, inserted, skipped, locations: locations.length };
}
