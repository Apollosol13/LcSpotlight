import type { SupabaseClient } from "@supabase/supabase-js";
import { insertEventIfNew } from "@/lib/events/insert-event";
import { buildDedupeKey } from "@/lib/events/dedupe";

const AJAX_URL = "https://www.hiltonheadisland.com/wp-admin/admin-ajax.php";
const SOURCE = "eventorganiser:hiltonheadisland";
const WINDOW_DAYS = 60;

const TZ = "America/New_York";

interface FullCalEvent {
  title?: string;
  url?: string;
  allDay?: boolean;
  start?: string;
  end?: string;
  venue_slug?: string;
  category?: string[];
}

/** Parses `YYYY-MM-DDTHH:mm:ss` as America/New_York wall time → UTC. */
function easternWallTimeToUtc(wallNaive: string): Date {
  const re = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;
  const m = re.exec(wallNaive);
  if (!m) return new Date(NaN);
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const h = +m[4];
  const mi = +m[5];
  const s = +m[6];
  const wantKey =
    y * 1_000_000_000 + mo * 10_000_000 + d * 100_000 + h * 1_000 + mi * 10 + s;

  let lo = Date.UTC(y, mo - 1, d, h, mi, s) - 14 * 3600 * 1000;
  let hi = Date.UTC(y, mo - 1, d, h, mi, s) + 14 * 3600 * 1000;

  function zoneKey(utcMs: number): number {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(utcMs));
    const o: Record<string, number> = {};
    for (const x of p) {
      if (x.type !== "literal") o[x.type] = +x.value;
    }
    return (
      o.year * 1_000_000_000 +
      o.month * 10_000_000 +
      o.day * 100_000 +
      o.hour * 1_000 +
      o.minute * 10 +
      o.second
    );
  }

  for (let i = 0; i < 64; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const g = zoneKey(mid);
    if (g === wantKey) return new Date(mid);
    if (g < wantKey) lo = mid + 1;
    else hi = mid - 1;
  }
  return new Date(Math.floor((lo + hi) / 2));
}

function easternYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pickCategory(categories: string[] | undefined): string | null {
  if (!categories?.length) return null;
  const skip = new Set(["show-on-calendar"]);
  const c = categories.find((x) => !skip.has(x));
  if (!c) return null;
  return humanizeSlug(c);
}

function dayMonthFromUtcInEastern(d: Date): { day: string; month: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
  }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value ?? "??";
  const month = parts.find((p) => p.type === "month")?.value ?? "???";
  return { day, month };
}

function formatTimeRange(startUtc: Date, endUtc: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  };
  const a = new Intl.DateTimeFormat("en-US", opts).format(startUtc);
  const b = new Intl.DateTimeFormat("en-US", opts).format(endUtc);
  return `${a} – ${b}`;
}

function buildFullCalUrl(startYmd: string, endYmd: string): string {
  const u = new URL(AJAX_URL);
  u.searchParams.set("action", "eventorganiser-fullcal");
  u.searchParams.set("start", startYmd);
  u.searchParams.set("end", endYmd);
  u.searchParams.set("timeformat", "g:i a");
  u.searchParams.set("category", "show-on-calendar");
  return u.toString();
}

export async function scrapeHiltonHeadIslandEvents(supabase: SupabaseClient) {
  const now = new Date();
  const startYmd = easternYmd(now);
  const endYmd = easternYmd(new Date(now.getTime() + WINDOW_DAYS * 86400000));

  const url = buildFullCalUrl(startYmd, endYmd);
  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/javascript, */*;q=0.01",
      "User-Agent":
        "LcSpotlightEventsBot/1.0 (+https://www.hiltonheadisland.com/event-calendar/)",
    },
  });
  if (!res.ok) throw new Error(`Hilton Head calendar fetch failed: ${res.status}`);

  const raw = await res.text();
  let items: FullCalEvent[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("not an array");
    items = parsed as FullCalEvent[];
  } catch {
    throw new Error(`Hilton Head calendar: invalid JSON (${raw.slice(0, 120)}…)`);
  }

  let inserted = 0;
  let skipped = 0;
  const nowMs = Date.now();

  for (const item of items) {
    const title = item.title?.trim();
    const link = item.url?.trim();
    const startRaw = item.start?.trim();
    const endRaw = item.end?.trim();
    if (!title || !link || !startRaw || !endRaw) {
      skipped++;
      continue;
    }

    const endUtc = easternWallTimeToUtc(endRaw);
    if (Number.isNaN(endUtc.getTime()) || endUtc.getTime() < nowMs) {
      skipped++;
      continue;
    }

    const startUtc = easternWallTimeToUtc(startRaw);
    if (Number.isNaN(startUtc.getTime())) {
      skipped++;
      continue;
    }

    const venue =
      item.venue_slug && item.venue_slug.length > 0
        ? humanizeSlug(item.venue_slug)
        : "Hilton Head Island, SC";

    const dateKey = startRaw.slice(0, 10);
    const dedupe_key = buildDedupeKey(title, dateKey, venue);

    const { day, month } = dayMonthFromUtcInEastern(startUtc);
    const time = item.allDay ? "All day" : formatTimeRange(startUtc, endUtc);
    const category = pickCategory(item.category) ?? "Community";

    const { inserted: didInsert } = await insertEventIfNew(
      supabase,
      {
        name: title,
        day,
        month,
        time,
        location: venue,
        category,
        price: null,
        bg: "#1E3A5F",
        icon: null,
        cta: "More info",
        source: SOURCE,
        source_url: link,
        start_at: startUtc.toISOString(),
        dedupe_key,
      },
      { dedupeBySourceUrl: false },
    );

    if (didInsert) inserted++;
    else skipped++;
  }

  return { total: items.length, inserted, skipped };
}
