import type { SupabaseClient } from "@supabase/supabase-js";
import { scrapeEventOrganiserCalendar } from "./eventorganiser-scraper";

export async function scrapeBeaufortCalendarEvents(supabase: SupabaseClient) {
  return scrapeEventOrganiserCalendar(supabase, {
    ajaxUrl: "https://www.beaufort.com/wp-admin/admin-ajax.php",
    source: "eventorganiser:beaufort",
    defaultLocation: "Beaufort, SC",
    userAgentRef: "https://www.beaufort.com/event-calendar/",
  });
}
