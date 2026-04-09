import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dedupeKeyFromIso,
  dedupeKeyFromDayMonth,
  insertEventIfNew,
} from "@/lib/events/insert-event";

const LOCATIONS: { slug: string; label: string }[] = [
  { slug: "sc--hilton-head-island", label: "Hilton Head Island, SC" },
  { slug: "sc--bluffton", label: "Bluffton, SC" },
  { slug: "sc--beaufort", label: "Beaufort, SC" },
  { slug: "ga--savannah", label: "Savannah, GA" },
];

type JsonLdAddress = {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
};

type JsonLdLocation = {
  name?: string;
  address?: JsonLdAddress;
};

type JsonLdEvent = {
  name?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  image?: string;
  description?: string;
  location?: JsonLdLocation;
  eventAttendanceMode?: string;
};

type JsonLdListItem = {
  item?: JsonLdEvent;
};

type JsonLdList = {
  itemListElement?: JsonLdListItem[];
};

export type EventbriteResult = {
  total: number;
  inserted: number;
  skipped: number;
  locations: number;
  message?: string;
};

function parseStartAt(dateStr: string | undefined): string | null {
  if (!dateStr?.trim()) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
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

function venueLine(loc: JsonLdLocation | undefined): string | null {
  if (!loc) return null;
  const parts: string[] = [];
  if (loc.name) parts.push(loc.name);
  const addr = loc.address;
  if (addr) {
    const city = [addr.addressLocality, addr.addressRegion]
      .filter(Boolean)
      .join(", ");
    if (city) parts.push(city);
  }
  return parts.length ? parts.join(" — ") : null;
}

function safeImageUrl(url: string | undefined): string | null {
  const u = url?.trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return null;
}

function isInPersonEvent(ev: JsonLdEvent): boolean {
  return (
    !ev.eventAttendanceMode ||
    ev.eventAttendanceMode.includes("OfflineEventAttendanceMode") ||
    ev.eventAttendanceMode.includes("MixedEventAttendanceMode")
  );
}

const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;

function extractEvents(html: string): JsonLdEvent[] {
  const match = html.match(JSON_LD_RE);
  if (!match?.[1]) return [];
  try {
    const data = JSON.parse(match[1]) as JsonLdList;
    return (
      data.itemListElement
        ?.map((li) => li.item)
        .filter((item): item is JsonLdEvent => !!item) ?? []
    );
  } catch {
    return [];
  }
}

async function fetchLocationPage(slug: string): Promise<string> {
  const url = `https://www.eventbrite.com/d/${slug}/events/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
  });
  if (!res.ok) {
    throw new Error(`Eventbrite HTTP ${res.status} for ${slug}`);
  }
  return res.text();
}

export async function scrapeEventbriteEvents(
  supabase: SupabaseClient,
): Promise<EventbriteResult> {
  let total = 0;
  let inserted = 0;
  let skipped = 0;

  for (const { slug, label } of LOCATIONS) {
    const html = await fetchLocationPage(slug);
    const events = extractEvents(html);

    for (const ev of events) {
      if (!isInPersonEvent(ev)) {
        skipped++;
        total++;
        continue;
      }

      const name = ev.name?.trim();
      if (!name) {
        skipped++;
        total++;
        continue;
      }

      total++;

      const startAt = parseStartAt(ev.startDate);
      const { day, month } = dayMonthFromIso(startAt);
      const loc = venueLine(ev.location) ?? label;
      const sourceUrl = ev.url?.trim() ?? null;
      const img = safeImageUrl(ev.image);

      const dedupe_key = startAt
        ? dedupeKeyFromIso(name, startAt, loc)
        : dedupeKeyFromDayMonth(name, day, month, loc);

      const { inserted: did } = await insertEventIfNew(supabase, {
        name,
        day,
        month,
        time: null,
        location: loc,
        category: "Events",
        price: "See listing",
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
  }

  return { total, inserted, skipped, locations: LOCATIONS.length };
}
