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

const BLOCKED_CATEGORIES = [
  "crime", "police", "courts", "obituaries", "obituary",
  "public safety", "police blotter", "arrests",
  "crime & public safety", "breaking news",
];

function isContentClean(title, description, categories) {
  const text = `${title} ${description}`.toLowerCase();
  for (const kw of BLOCKED_KEYWORDS) {
    if (text.includes(kw)) return false;
  }
  for (const cat of categories) {
    const lower = cat.toLowerCase().trim();
    if (BLOCKED_CATEGORIES.some((bc) => lower.includes(bc))) return false;
  }
  return true;
}

function extractDescription(html) {
  const stripped = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return stripped.length > 300 ? stripped.slice(0, 300) + "..." : stripped;
}

function formatDate(pubDate) {
  try {
    const d = new Date(pubDate);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return pubDate;
  }
}

// --- Island News ---
console.log("=== Scraping Island News ===");
const newsRes = await fetch("https://yourislandnews.com/feed/");
const newsXml = await newsRes.text();
const newsParser = new XMLParser({ ignoreAttributes: false });
const newsParsed = newsParser.parse(newsXml);
const newsItems = newsParsed?.rss?.channel?.item ?? [];

let newsInserted = 0, newsFiltered = 0, newsSkipped = 0;

for (const item of newsItems) {
  const rawCats = Array.isArray(item.category) ? item.category : item.category ? [item.category] : [];
  const categories = rawCats.map((c) => typeof c === "string" ? c : String(c));
  const desc = item.description ? extractDescription(item.description) : "";

  if (!isContentClean(item.title, desc, categories)) {
    console.log(`  FILTERED: ${item.title}`);
    newsFiltered++;
    continue;
  }

  const { data: existing } = await supabase
    .from("news")
    .select("id")
    .eq("source_url", item.link)
    .maybeSingle();

  if (existing) { newsSkipped++; continue; }

  const { error } = await supabase.from("news").insert({
    title: item.title,
    description: desc,
    date: formatDate(item.pubDate),
    category: categories[0] ?? "Local",
    author: item["dc:creator"] ?? null,
    source: "rss:islandnews",
    source_url: item.link,
    icon: null,
    featured: false,
  });

  if (error) { console.log(`  ERROR: ${error.message}`); }
  else { console.log(`  ADDED: ${item.title}`); newsInserted++; }
}

console.log(`\nIsland News: ${newsItems.length} total, ${newsInserted} added, ${newsFiltered} filtered, ${newsSkipped} skipped\n`);

// --- Bluffton Events ---
console.log("=== Scraping Bluffton Events ===");
const eventsRes = await fetch("https://www.townofbluffton.sc.gov/RSSFeed.aspx?ModID=58&CID=All-0");
const eventsXml = await eventsRes.text();
const eventsParsed = newsParser.parse(eventsXml);
const rawItems = eventsParsed?.rss?.channel?.item;
const eventItems = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];

let eventsInserted = 0, eventsSkipped = 0;

for (const item of eventItems) {
  if (item.title.toLowerCase().includes("cancelled")) { console.log(`  SKIPPED (cancelled): ${item.title}`); continue; }

  const { data: existing } = await supabase.from("events").select("id").eq("name", item.title).maybeSingle();
  if (existing) { eventsSkipped++; continue; }

  const eventDates = item["calendarEvent:EventDates"] ?? "";
  const eventTimes = item["calendarEvent:EventTimes"] ?? "";
  const location = item["calendarEvent:Location"] ?? "Bluffton, SC";

  let day = "??", month = "???";
  try {
    const d = new Date(eventDates.trim());
    day = String(d.getDate()).padStart(2, "0");
    month = d.toLocaleDateString("en-US", { month: "short" });
  } catch {}

  const time = eventTimes.trim().split(" - ")[0]?.trim() ?? eventTimes.trim();

  const { error } = await supabase.from("events").insert({
    name: item.title,
    day, month, time,
    location: location || "Bluffton, SC",
    category: "Community",
    bg: "#1A3A2A",
    icon: null,
    price: "Free",
    cta: "Learn More",
    source: "rss:bluffton",
  });

  if (error) { console.log(`  ERROR: ${error.message}`); }
  else { console.log(`  ADDED: ${item.title}`); eventsInserted++; }
}

console.log(`\nBluffton Events: ${eventItems.length} total, ${eventsInserted} added, ${eventsSkipped} skipped`);
console.log("\nDone!");
