import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BLOCKED_KEYWORDS = [
  "murder", "homicide", "killed", "killing", "fatal", "fatally",
  "shooting", "shot dead", "gunshot", "stabbing", "stabbed",
  "assault", "assaulted", "rape", "sexual assault",
  "suicide", "overdose", "drug bust",
  "arrest", "arrested", "charged with", "sentenced", "indicted",
  "manslaughter", "arson", "robbery", "burglary",
  "death toll", "dead body", "body found", "remains found",
  "obituary", "obituaries", "funeral",
  "accident", "crash", "wreck", "collision",
  "missing person", "amber alert",
  "abuse", "domestic violence",
  "fraud", "embezzlement", "theft",
  "inmate", "prison", "jail",
  "victim", "suspect", "perpetrator",
  "police chase", "standoff", "swat",
  "fire department", "structure fire", "house fire",
  "drowning", "drowned",
];

function isClean(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  for (const kw of BLOCKED_KEYWORDS) {
    if (text.includes(kw)) return false;
  }
  return true;
}

function decode(str) {
  return str
    .replace(/&#8212;/g, "\u2014").replace(/&#8211;/g, "\u2013")
    .replace(/&#8217;/g, "\u2019").replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C").replace(/&#8221;/g, "\u201D")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function extractDesc(html) {
  const s = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const d = decode(s);
  return d.length > 300 ? d.slice(0, 300) + "..." : d;
}

function formatDate(pubDate) {
  try { return new Date(pubDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
  catch { return pubDate; }
}

function getSource(item) {
  if (!item.source) return null;
  if (typeof item.source === "string") return item.source;
  return item.source["#text"] ?? null;
}

const FEEDS = [
  { url: "https://news.google.com/rss/search?q=hilton+head+island&hl=en-US&gl=US&ceid=US:en", region: "Hilton Head" },
  { url: "https://news.google.com/rss/search?q=bluffton+south+carolina&hl=en-US&gl=US&ceid=US:en", region: "Bluffton" },
  { url: "https://news.google.com/rss/search?q=beaufort+south+carolina&hl=en-US&gl=US&ceid=US:en", region: "Beaufort" },
  { url: "https://news.google.com/rss/search?q=savannah+georgia&hl=en-US&gl=US&ceid=US:en", region: "Savannah" },
];

const parser = new XMLParser({ ignoreAttributes: false });

for (const feed of FEEDS) {
  console.log(`\n=== ${feed.region} ===`);
  
  const res = await fetch(feed.url);
  if (!res.ok) { console.log(`  FAILED: ${res.status}`); continue; }
  
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  if (!rawItems) { console.log("  No items"); continue; }
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  
  let inserted = 0, filtered = 0, skipped = 0;

  for (const item of items) {
    const title = decode(item.title ?? "");
    const desc = item.description ? extractDesc(item.description) : "";
    const source = getSource(item);

    if (!isClean(title, desc)) {
      console.log(`  FILTERED: ${title.slice(0, 60)}...`);
      filtered++;
      continue;
    }

    const { data: e1 } = await supabase.from("news").select("id").eq("source_url", item.link).maybeSingle();
    if (e1) { skipped++; continue; }

    const { data: e2 } = await supabase.from("news").select("id").eq("title", title).maybeSingle();
    if (e2) { skipped++; continue; }

    const { error } = await supabase.from("news").insert({
      title,
      description: desc,
      date: formatDate(item.pubDate),
      category: feed.region,
      author: source,
      source: `google:${feed.region.toLowerCase().replace(/\s/g, "")}`,
      source_url: item.link,
      icon: null,
      featured: false,
    });

    if (error) { console.log(`  ERROR: ${error.message}`); }
    else { console.log(`  ADDED: ${title.slice(0, 70)}`); inserted++; }
  }

  console.log(`${feed.region}: ${items.length} total, ${inserted} added, ${filtered} filtered, ${skipped} skipped`);
}

console.log("\nDone!");
