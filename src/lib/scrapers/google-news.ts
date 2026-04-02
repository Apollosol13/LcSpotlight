import { XMLParser } from "fast-xml-parser";
import { isContentClean } from "./content-filter";
import { fetchOgImage } from "./og-image";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GoogleNewsFeedDef = { url: string; region: string };

export const GOOGLE_NEWS_FEEDS: readonly GoogleNewsFeedDef[] = [
  { url: "https://news.google.com/rss/search?q=hilton+head+island&hl=en-US&gl=US&ceid=US:en", region: "Hilton Head" },
  { url: "https://news.google.com/rss/search?q=bluffton+south+carolina&hl=en-US&gl=US&ceid=US:en", region: "Bluffton" },
  { url: "https://news.google.com/rss/search?q=beaufort+south+carolina&hl=en-US&gl=US&ceid=US:en", region: "Beaufort" },
  { url: "https://news.google.com/rss/search?q=savannah+georgia&hl=en-US&gl=US&ceid=US:en", region: "Savannah" },
] as const;

interface GoogleNewsItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string | { "#text": string; "@_url"?: string };
  description?: string;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractSource(item: GoogleNewsItem): string | null {
  if (!item.source) return null;
  if (typeof item.source === "string") return item.source;
  return item.source["#text"] ?? null;
}

/** RSS &lt;source url="https://publisher.com"&gt; — use for og:image, not the Google News link. */
function extractPublisherUrl(item: GoogleNewsItem): string | null {
  const s = item.source;
  if (s && typeof s === "object" && "@_url" in s) {
    const url = (s as { "@_url"?: string })["@_url"];
    if (typeof url === "string" && /^https?:\/\//i.test(url)) return url;
  }
  return null;
}

function formatDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return pubDate;
  }
}

function extractDescription(html: string): string {
  const stripped = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const decoded = decodeEntities(stripped);
  return decoded.length > 300 ? decoded.slice(0, 300) + "..." : decoded;
}

export type GoogleNewsScrapeResult = {
  total: number;
  inserted: number;
  filtered: number;
  skipped: number;
  regions: Record<string, { total: number; inserted: number; filtered: number; skipped: number }>;
  message?: string;
};

/** Ingest Google News RSS for named regions only (e.g. `["Beaufort", "Savannah"]`). Case-insensitive. */
export async function scrapeGoogleNewsForRegions(
  supabase: SupabaseClient,
  regions: readonly string[],
): Promise<GoogleNewsScrapeResult> {
  const wanted = new Set(regions.map((r) => r.trim().toLowerCase()).filter(Boolean));
  const feeds = GOOGLE_NEWS_FEEDS.filter((f) => wanted.has(f.region.toLowerCase()));
  if (feeds.length === 0) {
    return {
      total: 0,
      inserted: 0,
      filtered: 0,
      skipped: 0,
      regions: {},
      message: "No matching regions — use Hilton Head, Bluffton, Beaufort, or Savannah",
    };
  }
  return scrapeGoogleNewsFeeds(supabase, feeds);
}

export async function scrapeGoogleNews(supabase: SupabaseClient): Promise<GoogleNewsScrapeResult> {
  return scrapeGoogleNewsFeeds(supabase, [...GOOGLE_NEWS_FEEDS]);
}

async function scrapeGoogleNewsFeeds(
  supabase: SupabaseClient,
  feeds: readonly GoogleNewsFeedDef[],
): Promise<GoogleNewsScrapeResult> {
  const parser = new XMLParser({ ignoreAttributes: false });
  let totalInserted = 0;
  let totalFiltered = 0;
  let totalSkipped = 0;
  let totalItems = 0;
  const regionResults: Record<string, { total: number; inserted: number; filtered: number; skipped: number }> = {};

  for (const feed of feeds) {
    let inserted = 0;
    let filtered = 0;
    let skipped = 0;

    try {
      const res = await fetch(feed.url);
      if (!res.ok) {
        regionResults[feed.region] = { total: 0, inserted: 0, filtered: 0, skipped: 0 };
        continue;
      }

      const xml = await res.text();
      const parsed = parser.parse(xml);
      const rawItems = parsed?.rss?.channel?.item;
      if (!rawItems) {
        regionResults[feed.region] = { total: 0, inserted: 0, filtered: 0, skipped: 0 };
        continue;
      }
      const items: GoogleNewsItem[] = Array.isArray(rawItems) ? rawItems : [rawItems];
      totalItems += items.length;

      for (const item of items) {
        const title = decodeEntities(item.title ?? "");
        const description = item.description ? extractDescription(item.description) : "";
        const source = extractSource(item);

        if (!isContentClean(title, description, [])) {
          filtered++;
          continue;
        }

        const { data: existing } = await supabase
          .from("news")
          .select("id")
          .eq("source_url", item.link)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        const { data: titleMatch } = await supabase
          .from("news")
          .select("id")
          .eq("title", title)
          .maybeSingle();

        if (titleMatch) {
          skipped++;
          continue;
        }

        let publishedAt: string | undefined;
        try {
          publishedAt = new Date(item.pubDate).toISOString();
        } catch {
          /* fall back to auto */
        }

        const publisherUrl = extractPublisherUrl(item);
        const ogImage = publisherUrl ? await fetchOgImage(publisherUrl) : null;

        const { error } = await supabase.from("news").insert({
          title,
          description,
          date: formatDate(item.pubDate),
          category: feed.region,
          author: source,
          source: `google:${feed.region.toLowerCase().replace(/\s/g, "")}`,
          source_url: item.link,
          icon: null,
          image_bg: ogImage,
          featured: false,
          ...(publishedAt ? { created_at: publishedAt } : {}),
        });

        if (!error) inserted++;
      }

      regionResults[feed.region] = { total: items.length, inserted, filtered, skipped };
    } catch {
      regionResults[feed.region] = { total: 0, inserted: 0, filtered: 0, skipped: 0 };
    }

    totalInserted += inserted;
    totalFiltered += filtered;
    totalSkipped += skipped;
  }

  return { total: totalItems, inserted: totalInserted, filtered: totalFiltered, skipped: totalSkipped, regions: regionResults };
}
