import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThingsToDoDetail } from "@/components/ThingsToDoDetail";
import { supabase } from "@/lib/supabase";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";

export const revalidate = 300;

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
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

  const { data, error } = await supabase
    .from("things_to_do")
    .select(
      "id, market_key, category, title, description, venue, website, image_url, google_photo_name, google_place_name, place_enriched_at, opening_hours_text",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <ThingsToDoDetail row={data as ThingsToDoRow} />;
}
