import type { SupabaseClient } from "@supabase/supabase-js";

export type SiteSearchHitType =
  | "event"
  | "news"
  | "things_to_do"
  | "opening"
  | "deal"
  | "ticket";

export type SiteSearchHit = {
  type: SiteSearchHitType;
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  external: boolean;
};

const MIN_QUERY_LEN = 2;
const LIMIT_EACH = 12;

/** Safe fragment for PostgREST `.or(...ilike...)` filters. */
export function sanitizeSearchQuery(raw: string): string {
  return raw
    .trim()
    .replace(/[%_,*'"]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function ilikePattern(sanitized: string): string | null {
  if (sanitized.length < MIN_QUERY_LEN) return null;
  return `%${sanitized}%`;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Full-text-ish search across public tables (anon key + RLS).
 * Returns a flat list; UI may group by `type`.
 */
export async function siteSearch(
  supabase: SupabaseClient,
  rawQuery: string,
): Promise<SiteSearchHit[]> {
  const sanitized = sanitizeSearchQuery(rawQuery);
  const pattern = ilikePattern(sanitized);
  if (!pattern) return [];

  const orEvents = `name.ilike.${pattern},location.ilike.${pattern},category.ilike.${pattern}`;
  const orNews = `title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`;
  const orTtd = `title.ilike.${pattern},venue.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`;
  const orOpenings = `name.ilike.${pattern},location.ilike.${pattern},type.ilike.${pattern}`;
  const orDeals = `title.ilike.${pattern},description.ilike.${pattern}`;
  const orTickets = `title.ilike.${pattern},subtitle.ilike.${pattern},location.ilike.${pattern},description.ilike.${pattern}`;

  const [
    { data: eventRows, error: eEv },
    { data: newsRows, error: eNews },
    { data: ttdRows, error: eTtd },
    { data: openingRows, error: eOp },
    { data: dealRows, error: eDeal },
    { data: ticketRows, error: eTix },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id,name,location,category,source_url")
      .or(orEvents)
      .order("start_at", { ascending: true, nullsFirst: false })
      .limit(LIMIT_EACH),
    supabase
      .from("news")
      .select("id,title,description,category,source_url")
      .or(orNews)
      .order("created_at", { ascending: false })
      .limit(LIMIT_EACH),
    supabase
      .from("things_to_do")
      .select("id,title,venue,category,description")
      .or(orTtd)
      .order("created_at", { ascending: false })
      .limit(LIMIT_EACH),
    supabase
      .from("openings")
      .select("id,name,location,type")
      .or(orOpenings)
      .order("created_at", { ascending: false })
      .limit(LIMIT_EACH),
    supabase
      .from("business_discounts")
      .select("id,title,description,redeem_url")
      .eq("is_active", true)
      .or(orDeals)
      .order("created_at", { ascending: false })
      .limit(LIMIT_EACH),
    supabase
      .from("ticket_listings")
      .select("id,title,subtitle,ticket_url")
      .eq("is_published", true)
      .or(orTickets)
      .order("created_at", { ascending: false })
      .limit(LIMIT_EACH),
  ]);

  if (eEv) console.error("[site-search] events:", eEv.message);
  if (eNews) console.error("[site-search] news:", eNews.message);
  if (eTtd) console.error("[site-search] things_to_do:", eTtd.message);
  if (eOp) console.error("[site-search] openings:", eOp.message);
  if (eDeal) console.error("[site-search] business_discounts:", eDeal.message);
  if (eTix) console.error("[site-search] ticket_listings:", eTix.message);

  const hits: SiteSearchHit[] = [];

  for (const r of eventRows ?? []) {
    const row = r as {
      id: string;
      name: string;
      location: string | null;
      category: string | null;
      source_url: string | null;
    };
    const href = row.source_url?.trim() || "/events";
    hits.push({
      type: "event",
      id: row.id,
      title: row.name,
      subtitle: [row.category, row.location].filter(Boolean).join(" · ") || null,
      href,
      external: isExternalHref(href),
    });
  }

  for (const r of newsRows ?? []) {
    const row = r as {
      id: string;
      title: string;
      description: string | null;
      category: string | null;
      source_url: string | null;
    };
    const href = row.source_url?.trim() || "/news";
    hits.push({
      type: "news",
      id: row.id,
      title: row.title,
      subtitle: row.category || (row.description ? row.description.slice(0, 120) : null),
      href,
      external: isExternalHref(href),
    });
  }

  for (const r of ttdRows ?? []) {
    const row = r as {
      id: string;
      title: string;
      venue: string | null;
      category: string | null;
      description: string | null;
    };
    hits.push({
      type: "things_to_do",
      id: row.id,
      title: row.title,
      subtitle: [row.category, row.venue].filter(Boolean).join(" · ") || null,
      href: `/things-to-do/${row.id}`,
      external: false,
    });
  }

  for (const r of openingRows ?? []) {
    const row = r as { id: string; name: string; location: string | null; type: string | null };
    hits.push({
      type: "opening",
      id: row.id,
      title: row.name,
      subtitle: [row.type, row.location].filter(Boolean).join(" · ") || null,
      href: "/openings",
      external: false,
    });
  }

  for (const r of dealRows ?? []) {
    const row = r as { id: string; title: string; description: string | null; redeem_url: string | null };
    const href = row.redeem_url?.trim() || "/deals";
    hits.push({
      type: "deal",
      id: row.id,
      title: row.title,
      subtitle: row.description ? row.description.slice(0, 140) : null,
      href,
      external: isExternalHref(href),
    });
  }

  for (const r of ticketRows ?? []) {
    const row = r as { id: string; title: string; subtitle: string | null; ticket_url: string | null };
    const href = row.ticket_url?.trim() || "/ticketing";
    hits.push({
      type: "ticket",
      id: row.id,
      title: row.title,
      subtitle: row.subtitle?.trim() || null,
      href,
      external: isExternalHref(href),
    });
  }

  return hits;
}

export const SITE_SEARCH_TYPE_LABEL: Record<SiteSearchHitType, string> = {
  event: "Events",
  news: "News",
  things_to_do: "Things to do",
  opening: "New openings",
  deal: "Deals",
  ticket: "Tickets",
};
