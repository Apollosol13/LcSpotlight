import { supabase } from "@/lib/supabase";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";
import { pickThingsToDoSpotlight } from "@/lib/things-to-do-spotlight";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";
import { ThingsToDoSectionClient } from "./ThingsToDoSectionClient";

const MARKET_KEYS = REAL_ESTATE_MARKETS.map((m) => m.key);

/** Spotlight cards per market on the homepage */
const HOME_SPOTLIGHT_COUNT = 7;

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
    .select("id, market_key, category, title, description, venue, website")
    .in("market_key", MARKET_KEYS)
    .order("created_at", { ascending: false });

  const by = emptyByMarket();
  for (const r of rows ?? []) {
    const k = (r.market_key as string) || "hhi";
    const key = (MARKET_KEYS as readonly string[]).includes(k) ? (k as RealEstateMarketKey) : "hhi";
    by[key].push(r as ThingsToDoRow);
  }

  const spotlight = emptyByMarket();
  for (const mk of MARKET_KEYS) {
    spotlight[mk] = pickThingsToDoSpotlight(by[mk], HOME_SPOTLIGHT_COUNT);
  }

  return <ThingsToDoSectionClient dealsByMarket={spotlight} variant="home" showAllLink />;
}
