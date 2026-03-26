import { XMLParser } from "fast-xml-parser";
import type { SupabaseClient } from "@supabase/supabase-js";

const FEED_URL = "https://www.townofbluffton.sc.gov/RSSFeed.aspx?ModID=58&CID=All-0";

interface CalendarItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  "calendarEvent:EventDates"?: string;
  "calendarEvent:EventTimes"?: string;
  "calendarEvent:Location"?: string;
}

function parseEventDate(dateStr: string): { day: string; month: string } {
  try {
    const cleaned = dateStr.trim();
    const d = new Date(cleaned);
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  } catch {
    return { day: "??", month: "???" };
  }
}

function extractTime(timeStr: string): string {
  const parts = timeStr.trim().split(" - ");
  return parts[0]?.trim() ?? timeStr.trim();
}

export async function scrapeBlufftonEvents(supabase: SupabaseClient) {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Failed to fetch Bluffton events RSS: ${res.status}`);

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);

  const rawItems = parsed?.rss?.channel?.item;
  if (!rawItems) return { total: 0, inserted: 0, skipped: 0 };
  const items: CalendarItem[] = Array.isArray(rawItems) ? rawItems : [rawItems];

  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    if (item.title.toLowerCase().includes("cancelled")) continue;

    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("name", item.title)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const eventDates = item["calendarEvent:EventDates"] ?? "";
    const eventTimes = item["calendarEvent:EventTimes"] ?? "";
    const location = item["calendarEvent:Location"] ?? "Bluffton, SC";
    const { day, month } = parseEventDate(eventDates);
    const time = extractTime(eventTimes);

    const { error } = await supabase.from("events").insert({
      name: item.title,
      day,
      month,
      time,
      location: location || "Bluffton, SC",
      category: "Community",
      bg: "#1A3A2A",
      icon: null,
      price: "Free",
      cta: "Learn More",
      source: "rss:bluffton",
    });

    if (!error) inserted++;
  }

  return { total: items.length, inserted, skipped };
}
