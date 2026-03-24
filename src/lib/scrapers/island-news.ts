import { XMLParser } from "fast-xml-parser";
import { isContentClean } from "./content-filter";
import type { SupabaseClient } from "@supabase/supabase-js";

const FEED_URL = "https://yourislandnews.com/feed/";

interface RSSItem {
  title: string;
  link: string;
  "dc:creator"?: string;
  pubDate: string;
  category?: string | string[];
  description?: string;
  "content:encoded"?: string;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractDescription(html: string): string {
  const stripped = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const decoded = decodeEntities(stripped);
  return decoded.length > 300 ? decoded.slice(0, 300) + "..." : decoded;
}

function formatDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return pubDate;
  }
}

function getCategories(item: RSSItem): string[] {
  if (!item.category) return [];
  const raw = Array.isArray(item.category) ? item.category : [item.category];
  return raw.map((c) => (typeof c === "string" ? c : String(c)));
}

export async function scrapeIslandNews(supabase: SupabaseClient) {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Failed to fetch Island News RSS: ${res.status}`);

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const items: RSSItem[] = parsed?.rss?.channel?.item ?? [];

  let inserted = 0;
  let filtered = 0;
  let skipped = 0;

  for (const item of items) {
    const categories = getCategories(item);
    const description = item.description
      ? extractDescription(item.description)
      : item["content:encoded"]
        ? extractDescription(item["content:encoded"])
        : "";

    if (!isContentClean(item.title, description, categories)) {
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

    let publishedAt: string | undefined;
    try {
      publishedAt = new Date(item.pubDate).toISOString();
    } catch { /* fall back to auto */ }

    const { error } = await supabase.from("news").insert({
      title: decodeEntities(item.title),
      description,
      date: formatDate(item.pubDate),
      category: categories[0] ?? "Local",
      author: item["dc:creator"] ?? null,
      source: "rss:islandnews",
      source_url: item.link,
      icon: null,
      featured: false,
      ...(publishedAt ? { created_at: publishedAt } : {}),
    });

    if (!error) inserted++;
  }

  return { total: items.length, inserted, filtered, skipped };
}
