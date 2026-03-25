import { supabase } from "@/lib/supabase";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";
import { ThingsToDoSectionClient, type ThingsToDoRow } from "./ThingsToDoSectionClient";

const MARKET_KEYS = REAL_ESTATE_MARKETS.map((m) => m.key);

/** Max cards per market on the homepage */
const HOME_PER_MARKET = 24;

function emptyByMarket(): Record<RealEstateMarketKey, ThingsToDoRow[]> {
  return {
    hhi: [],
    bluffton: [],
    beaufort: [],
    savannah: [],
  };
}

export async function ThingsToDoSection() {
  const { data: rows } = await supabase
    .from("things_to_do")
    .select("id, market_key, badge, title, description, venue, expires")
    .in("market_key", MARKET_KEYS)
    .order("created_at", { ascending: false });

  const by = emptyByMarket();
  for (const r of rows ?? []) {
    const k = (r.market_key as string) || "hhi";
    const key = (MARKET_KEYS as readonly string[]).includes(k) ? (k as RealEstateMarketKey) : "hhi";
    if (by[key].length < HOME_PER_MARKET) {
      by[key].push(r as ThingsToDoRow);
    }
  }

  return <ThingsToDoSectionClient dealsByMarket={by} variant="home" showAllLink />;
}
