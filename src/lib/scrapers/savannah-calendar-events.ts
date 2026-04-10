import type { SupabaseClient } from "@supabase/supabase-js";
import { scrapeEventOrganiserCalendar } from "./eventorganiser-scraper";

export async function scrapeSavannahCalendarEvents(supabase: SupabaseClient) {
  return scrapeEventOrganiserCalendar(supabase, {
    ajaxUrl: "https://www.savannah.com/wp-admin/admin-ajax.php",
    source: "eventorganiser:savannah",
    defaultLocation: "Savannah, GA",
    userAgentRef: "https://www.savannah.com/event-calendar/",
  });
}
