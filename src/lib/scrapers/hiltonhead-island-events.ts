import type { SupabaseClient } from "@supabase/supabase-js";
import { scrapeEventOrganiserCalendar } from "./eventorganiser-scraper";

export async function scrapeHiltonHeadIslandEvents(supabase: SupabaseClient) {
  return scrapeEventOrganiserCalendar(supabase, {
    ajaxUrl: "https://www.hiltonheadisland.com/wp-admin/admin-ajax.php",
    source: "eventorganiser:hiltonheadisland",
    defaultLocation: "Hilton Head Island, SC",
    userAgentRef: "https://www.hiltonheadisland.com/event-calendar/",
  });
}
