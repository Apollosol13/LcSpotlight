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

export const SERPAPI_LOCATION_BEAUFORT = "Beaufort, South Carolina";
export const SERPAPI_LOCATION_SAVANNAH = "Savannah, Georgia";

function defaultLocations(): string[] {
  const raw = process.env.SERPAPI_EVENT_LOCATIONS;
  if (raw?.trim()) {
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [
    "Bluffton, South Carolina",
    "Hilton Head Island, South Carolina",
    "Beaufort, South Carolina",
    "Savannah, Georgia",
  ];
}

/** First 3 letters, ASCII — works for en + es month abbrevs (abr → apr slot 3). */
function monthKey(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .slice(0, 3);
}

/** 0–11 month index; supports English + Spanish short names. */
function monthIndexFromToken(token: string): number | null {
  const k = monthKey(token);
  const map: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    ene: 0,
    abr: 3,
    ago: 7,
    dic: 11,
  };
  const idx = map[k];
  return idx === undefined ? null : idx;
}

/** For recurring month/day without year: use this year if still upcoming, else next year. */
function inferYear(monthIndex: number, day: number): number {
  const now = new Date();
  const y = now.getFullYear();
  const candidate = new Date(y, monthIndex, day, 12, 0, 0, 0);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (candidate < startToday) return y + 1;
  return y;
}

function utcNoonIso(y: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(y, monthIndex, day, 12, 0, 0, 0)).toISOString();
}

/**
 * Parses SerpAPI / Google Events date objects (often localized: "abr 11", Spanish when strings).
 */
function parseStartAt(dateObj: SerpDate | undefined): string | null {
  if (!dateObj) return null;
  const sd = dateObj.start_date?.trim();
  const when = dateObj.when?.trim();

  if (sd && /^\d{4}-\d{2}-\d{2}/.test(sd)) {
    const d = new Date(sd);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  if (when) {
    const ymd = when.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b/);
    if (ymd) {
      const mm = Number(ymd[1]);
      const dd = Number(ymd[2]);
      const yy = Number(ymd[3]);
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && yy >= 2000)
        return utcNoonIso(yy, mm - 1, dd);
    }
    const dmAfterComma = when.match(
      /(?:^|,\s*|\s)(\d{1,2})\s+([a-zA-Záéíóúñ]+)\b/,
    );
    if (dmAfterComma) {
      const day = Number(dmAfterComma[1]);
      const mon = monthIndexFromToken(dmAfterComma[2]);
      if (mon !== null && day >= 1 && day <= 31) {
        const y = inferYear(mon, day);
        return utcNoonIso(y, mon, day);
      }
    }
  }

  if (sd) {
    const m1 = sd.match(/^(\d{1,2})\s+([a-zA-Záéíóúñ]+)/);
    const m2 = sd.match(/^([a-zA-Záéíóúñ]+)\s+(\d{1,2})/);
    let day: number | null = null;
    let mon: number | null = null;
    if (m1) {
      day = Number(m1[1]);
      mon = monthIndexFromToken(m1[2]);
    } else if (m2) {
      mon = monthIndexFromToken(m2[1]);
      day = Number(m2[2]);
    }
    if (mon !== null && day !== null && day >= 1 && day <= 31) {
      const y = inferYear(mon, day);
      return utcNoonIso(y, mon, day);
    }
    const d = new Date(sd);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 2020) return d.toISOString();
  }

  if (when) {
    const d = new Date(when);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 2020) return d.toISOString();
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

/**
 * Human-readable time for DB (column is NOT NULL). Handles EN/ES and ranges like "7:30 – 9:00 p.m."
 */
function eventTimeFromWhen(when: string | undefined): string {
  if (!when?.trim()) return "TBA";

  const w = when.replace(/\u2013|\u2014/g, "-"); // en/em dash → hyphen for matching

  const rangePm = w.match(
    /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)/i,
  );
  if (rangePm) {
    const mer = rangePm[3].replace(/\s+/g, "").replace(/\./g, "").toUpperCase();
    return `${rangePm[1]} – ${rangePm[2]} ${mer}`;
  }

  const singleMer = w.match(
    /(\d{1,2}:\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)/i,
  );
  if (singleMer) {
    const mer = singleMer[2].replace(/\s+/g, "").replace(/\./g, "").toUpperCase();
    return `${singleMer[1]} ${mer}`;
  }

  const twentyFour = w.match(/\b(\d{1,2}:\d{2})(?:\s|$|[,•])/);
  if (twentyFour) return twentyFour[1];

  const m = w.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (m) return m[1].trim();

  if (/\b(tomorrow|today|hoy|mañana)\b/i.test(w)) return "All day";

  return "TBA";
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
      const time = eventTimeFromWhen(ev.date?.when);
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
