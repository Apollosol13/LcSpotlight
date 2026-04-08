import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThingsToDoDetail } from "@/components/ThingsToDoDetail";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";

/** Always resolve at request time so we never cache a stale `notFound()` after seed replaces (new UUIDs). */
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("things_to_do")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  const row = data as { title: string | null; description: string | null } | null;
  const title = row?.title?.trim() || "Things to Do";
  const desc = row?.description?.trim();

  return {
    title: `${title} | Lowcountry Spotlight`,
    description: desc ?? "Things to do in the Lowcountry.",
  };
}

export default async function ThingsToDoDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("things_to_do")
    .select(
      "id, market_key, category, title, description, venue, website, image_url, google_photo_name, google_photo_names, google_place_name, place_enriched_at, opening_hours_text, google_rating, google_user_rating_count, place_formatted_address, place_international_phone, place_google_maps_uri, place_editorial_summary",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <ThingsToDoDetail row={data as ThingsToDoRow} />;
}
