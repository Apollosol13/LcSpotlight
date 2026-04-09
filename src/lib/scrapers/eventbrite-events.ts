import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dedupeKeyFromIso,
  dedupeKeyFromDayMonth,
  insertEventIfNew,
} from "@/lib/events/insert-event";

const EVENTBRITE_BASE = "https://www.eventbriteapi.com/v3";

const LOCATIONS = [
  "Hilton Head Island, SC",
  "Bluffton, SC",
  "Beaufort, SC",
  "Savannah, GA",
] as const;

const SEARCH_RADIUS = "25mi";

type EBDatetime = { utc?: string; local?: string; timezone?: string };
type EBName = { text?: string; html?: string };
type EBLogo = { url?: string };
type EBVenueAddress = {
  address_1?: string;
  city?: string;
  region?: string;
  localized_address_display?: string;
};
type EBVenue = { name?: string; address?: EBVenueAddress };

type EBEvent = {
  id?: string;
  name?: EBName;
  url?: string;
  start?: EBDatetime;
  end?: EBDatetime;
  logo?: EBLogo;
  venue?: EBVenue;
  is_free?: boolean;
};

type EBPagination = {
  page_number?: number;
  page_count?: number;
  has_more_items?: boolean;
};

type EBSearchResponse = {
  pagination?: EBPagination;
  events?: EBEvent[];
  error?: string;
  error_description?: string;
  status_code?: number;
};

export type EventbriteResult = {
  total: number;
  inserted: number;
  skipped: number;
  locations: number;
  message?: string;
};

function parseStartAt(start: EBDatetime | undefined): string | null {
  if (!start) return null;
  const utc = start.utc;
  if (utc) {
    const d = new Date(utc);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const local = start.local;
  if (local) {
    const d = new Date(local);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function dayMonthFromIso(iso: string | null): { day: string; month: string } {
  if (!iso) return { day: "??", month: "???" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "??", month: "???" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-US", { month: "short" }),
  };
}

function extractTime(start: EBDatetime | undefined): string | null {
  const local = start?.local;
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}

function venueLine(venue: EBVenue | undefined): string | null {
  if (!venue) return null;
  const parts: string[] = [];
  if (venue.name) parts.push(venue.name);
  const addr = venue.address;
  if (addr?.localized_address_display) {
    parts.push(addr.localized_address_display);
  } else if (addr?.city) {
    parts.push([addr.city, addr.region].filter(Boolean).join(", "));
  }
  return parts.length ? parts.join(" — ") : null;
}

function imageUrl(ev: EBEvent): string | null {
  const url = ev.logo?.url?.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return null;
}

async function fetchPage(
  token: string,
  locationAddress: string,
  page: number,
): Promise<EBSearchResponse> {
  const url = new URL(`${EVENTBRITE_BASE}/events/search/`);
  url.searchParams.set("location.address", locationAddress);
  url.searchParams.set("location.within", SEARCH_RADIUS);
  url.searchParams.set("expand", "venue");
  url.searchParams.set("sort_by", "date");
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Eventbrite HTTP ${res.status} for "${locationAddress}" page ${page}: ${body.slice(0, 300)}`,
    );
  }

  return (await res.json()) as EBSearchResponse;
}

/** Max pages per location to avoid runaway pagination. */
const MAX_PAGES = 3;

export async function scrapeEventbriteEvents(
  supabase: SupabaseClient,
): Promise<EventbriteResult> {
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) {
    return {
      total: 0,
      inserted: 0,
      skipped: 0,
      locations: 0,
      message: "EVENTBRITE_TOKEN not set — skipping Eventbrite ingest",
    };
  }

  let total = 0;
  let inserted = 0;
  let skipped = 0;

  for (const location of LOCATIONS) {
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      const json = await fetchPage(token, location, page);

      if (json.error) {
        throw new Error(
          `Eventbrite: ${json.error} — ${json.error_description ?? ""}`,
        );
      }

      const items = json.events ?? [];

      for (const ev of items) {
        total++;
        const name = ev.name?.text?.trim();
        if (!name) {
          skipped++;
          continue;
        }

        const startAt = parseStartAt(ev.start);
        const { day, month } = dayMonthFromIso(startAt);
        const time = extractTime(ev.start);
        const loc = venueLine(ev.venue);
        const sourceUrl = ev.url?.trim() ?? null;
        const img = imageUrl(ev);

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
          price: ev.is_free ? "Free" : "See listing",
          bg: "#F05537",
          icon: null,
          cta: "Get tickets",
          source: "eventbrite",
          source_url: sourceUrl,
          image_url: img,
          start_at: startAt,
          dedupe_key,
        });

        if (did) inserted++;
        else skipped++;
      }

      hasMore = json.pagination?.has_more_items ?? false;
      page++;
    }
  }

  return { total, inserted, skipped, locations: LOCATIONS.length };
}
