import type { SupabaseClient } from "@supabase/supabase-js";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";
import { scrapeBlufftonCalendarEvents } from "@/lib/scrapers/bluffton-calendar-events";
import { scrapeBeaufortCalendarEvents } from "@/lib/scrapers/beaufort-calendar-events";
import { scrapeHiltonHeadIslandEvents } from "@/lib/scrapers/hiltonhead-island-events";
import { scrapeSavannahCalendarEvents } from "@/lib/scrapers/savannah-calendar-events";

export async function runEventIngest(supabase: SupabaseClient) {
  const results: Record<string, unknown> = {};

  try {
    results.blufftonEvents = await scrapeBlufftonEvents(supabase);
  } catch (err) {
    results.blufftonEvents = { error: String(err) };
  }

  try {
    results.blufftonCalendarEvents = await scrapeBlufftonCalendarEvents(supabase);
  } catch (err) {
    results.blufftonCalendarEvents = { error: String(err) };
  }

  try {
    results.beaufortCalendarEvents = await scrapeBeaufortCalendarEvents(supabase);
  } catch (err) {
    results.beaufortCalendarEvents = { error: String(err) };
  }

  try {
    results.hiltonHeadIslandEvents = await scrapeHiltonHeadIslandEvents(supabase);
  } catch (err) {
    results.hiltonHeadIslandEvents = { error: String(err) };
  }

  try {
    results.savannahCalendarEvents = await scrapeSavannahCalendarEvents(supabase);
  } catch (err) {
    results.savannahCalendarEvents = { error: String(err) };
  }

  return results;
}
