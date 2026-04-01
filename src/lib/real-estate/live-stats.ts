import { supabase } from "@/lib/supabase";
import type { RealEstateStatsCard } from "@/components/RealEstateSectionClient";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";

function medianSorted(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
}

function formatPrice(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    if (v >= 10) return `$${Math.round(v)}M`;
    const s = v.toFixed(2).replace(/\.?0+$/, "");
    return `$${s}M`;
  }
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

/**
 * Median list price, median DOM, active count, avg $/sqft from live rows (removed_at IS NULL).
 */
export async function buildLiveMarketStatsMap(): Promise<Map<string, RealEstateStatsCard>> {
  const keys = REAL_ESTATE_MARKETS.map((m) => m.key);
  const { data: rows, error } = await supabase
    .from("real_estate_listings")
    .select("market_key, price, dom, sqft")
    .in("market_key", keys)
    .is("removed_at", null);

  if (error) {
    if (error.code !== "42703") {
      console.error("buildLiveMarketStatsMap", error);
    }
    return new Map();
  }

  const out = new Map<string, RealEstateStatsCard>();

  for (const m of REAL_ESTATE_MARKETS) {
    const marketRows = (rows ?? []).filter((r) => r.market_key === m.key);
    const prices: number[] = [];
    const doms: number[] = [];
    const pps: number[] = [];

    for (const r of marketRows) {
      const p = typeof r.price === "number" ? r.price : null;
      const d = typeof r.dom === "number" ? r.dom : null;
      const sq = typeof r.sqft === "number" ? r.sqft : null;
      if (p != null && p > 0) prices.push(p);
      if (d != null && d >= 0) doms.push(d);
      if (p != null && p > 0 && sq != null && sq > 0) pps.push(Math.round(p / sq));
    }

    const medianPrice = medianSorted(prices);
    const medianDom = medianSorted(doms);
    const avgPps = pps.length ? Math.round(pps.reduce((a, b) => a + b, 0) / pps.length) : 0;

    out.set(m.key, {
      median_price_display: prices.length ? formatPrice(medianPrice) : "—",
      median_dom_display: doms.length ? String(medianDom) : "—",
      active_listings_display: String(marketRows.length),
      avg_price_per_sqft_display: avgPps ? `$${avgPps}` : "—",
      price_subtext: "Median · active listings",
      dom_subtext: "Median days on Redfin",
      listings_subtext: "Active listings (Redfin sync)",
      ratio_subtext: "Avg $/sqft",
    });
  }

  return out;
}

export async function getHeroHhiRealEstateSnapshot(): Promise<{
  medianDisplay: string | null;
  activeCountDisplay: string | null;
}> {
  const map = await buildLiveMarketStatsMap();
  const card = map.get("hhi");
  if (!card) return { medianDisplay: null, activeCountDisplay: null };
  return {
    medianDisplay: card.median_price_display !== "—" ? card.median_price_display : null,
    activeCountDisplay:
      card.active_listings_display !== "—" && card.active_listings_display !== "0"
        ? card.active_listings_display
        : null,
  };
}
