import type { SupabaseClient } from "@supabase/supabase-js";

export type TicketListingRow = {
  id: string;
  created_at: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  day: string | null;
  month: string | null;
  location: string | null;
  price: string | null;
  ticket_url: string;
  cta: string | null;
  image_url: string | null;
  is_published: boolean;
};

export function publishedTicketListingsQuery(client: SupabaseClient) {
  return client
    .from("ticket_listings")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
}
