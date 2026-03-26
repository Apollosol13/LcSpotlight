import { supabase } from "@/lib/supabase";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";
import { ThingsToDoSectionClient } from "@/components/ThingsToDoSectionClient";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";

export const revalidate = 300;

const MARKET_KEYS = REAL_ESTATE_MARKETS.map((m) => m.key);

/** Full page: show up to this many per market (adjust if needed). */
const PAGE_PER_MARKET = 120;

function emptyByMarket(): Record<RealEstateMarketKey, ThingsToDoRow[]> {
  return { hhi: [], bluffton: [], beaufort: [], savannah: [] };
}

export default async function ThingsToDoPage() {
  const { data: rows } = await supabase
    .from("things_to_do")
    .select("id, market_key, category, title, description, venue, website")
    .in("market_key", MARKET_KEYS)
    .order("created_at", { ascending: false });

  const by = emptyByMarket();
  for (const r of rows ?? []) {
    const k = (r.market_key as string) || "hhi";
    const key = (MARKET_KEYS as readonly string[]).includes(k) ? (k as RealEstateMarketKey) : "hhi";
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
