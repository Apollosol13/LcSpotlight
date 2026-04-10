import type { SupabaseClient } from "@supabase/supabase-js";
import { scrapeEventOrganiserCalendar } from "./eventorganiser-scraper";

export async function scrapeBlufftonCalendarEvents(supabase: SupabaseClient) {
  return scrapeEventOrganiserCalendar(supabase, {
    ajaxUrl: "https://www.bluffton.com/wp-admin/admin-ajax.php",
    source: "eventorganiser:bluffton",
    defaultLocation: "Bluffton, SC",
    userAgentRef: "https://www.bluffton.com/event-calendar/",
  });
}
