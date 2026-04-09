import type { SupabaseClient } from "@supabase/supabase-js";
import { scrapeBlufftonEvents } from "@/lib/scrapers/bluffton-events";
import { scrapeSerpApiGoogleEvents } from "@/lib/scrapers/serpapi-google-events";
import { scrapeEventbriteEvents } from "@/lib/scrapers/eventbrite-events";

export async function runEventIngest(supabase: SupabaseClient) {
  const results: Record<string, unknown> = {};

  try {
    results.blufftonEvents = await scrapeBlufftonEvents(supabase);
  } catch (err) {
    results.blufftonEvents = { error: String(err) };
  }

  try {
    results.serpApiGoogleEvents = await scrapeSerpApiGoogleEvents(supabase);
  } catch (err) {
    results.serpApiGoogleEvents = { error: String(err) };
  }

  try {
    results.eventbriteEvents = await scrapeEventbriteEvents(supabase);
  } catch (err) {
    results.eventbriteEvents = { error: String(err) };
  }

  return results;
}
