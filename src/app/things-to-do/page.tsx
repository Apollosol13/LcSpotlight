import { supabaseAdmin } from "@/lib/supabase-server";
import type { RealEstateMarketKey } from "@/lib/real-estate-markets";
import { ThingsToDoSectionClient } from "@/components/ThingsToDoSectionClient";
import { bucketKeyForThingsToDoRow } from "@/lib/things-to-do-bucket";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";

/** Fresh data after seed replace; avoids stale card links (see replace-things-to-do revalidatePath). */
export const dynamic = "force-dynamic";

/** Full page: show up to this many per market (adjust if needed). */
const PAGE_PER_MARKET = 120;

function emptyByMarket(): Record<RealEstateMarketKey, ThingsToDoRow[]> {
  return { hhi: [], bluffton: [], beaufort: [], savannah: [] };
}

export default async function ThingsToDoPage() {
  const { data: rows } = await supabaseAdmin
    .from("things_to_do")
    .select(
      "id, market_key, category, title, description, venue, website, image_url, google_photo_name, google_photo_names",
    )
    .order("created_at", { ascending: false });

  const by = emptyByMarket();
  for (const r of rows ?? []) {
    const key = bucketKeyForThingsToDoRow(r.market_key as string | null);
    if (by[key].length < PAGE_PER_MARKET) {
      by[key].push(r as ThingsToDoRow);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-16 min-[601px]:px-10">
      <ThingsToDoSectionClient dealsByMarket={by} variant="page" showAllLink={false} />
    </main>
  );
}
