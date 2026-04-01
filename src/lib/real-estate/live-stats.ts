import { supabase } from "@/lib/supabase";
import type { RealEstateStatsCard } from "@/components/RealEstateSectionClient";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";

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

function emptyStatsCard(): RealEstateStatsCard {
  return {
    median_price_display: "—",
    median_dom_display: "—",
    active_listings_display: "—",
    avg_price_per_sqft_display: "—",
    price_subtext: "Median · active listings",
    dom_subtext: "Median days on Redfin",
    listings_subtext: "Active listings (Redfin sync)",
    ratio_subtext: "Avg $/sqft",
  };
}

type MarketStatRow = {
  market_key: string;
  active_count: number;
  median_price: number | string | null;
  median_dom: number | string | null;
  avg_price_per_sqft: number | string | null;
};

/**
 * Median list price, median DOM, active count, avg $/sqft via Postgres aggregates
 * (see migration `get_real_estate_market_stats`). No client row cap.
 */
export async function buildLiveMarketStatsMap(): Promise<Map<string, RealEstateStatsCard>> {
  const { data, error } = await supabase.rpc("get_real_estate_market_stats");

  if (error) {
    if (error.code !== "PGRST202") {
      console.error("get_real_estate_market_stats", error);
    }
    const fallback = new Map<string, RealEstateStatsCard>();
    for (const m of REAL_ESTATE_MARKETS) {
      fallback.set(m.key, emptyStatsCard());
    }
    return fallback;
  }

  const byKey = new Map<string, MarketStatRow>();
  for (const r of (data ?? []) as MarketStatRow[]) {
    if (r?.market_key) byKey.set(r.market_key, r);
  }

  const out = new Map<string, RealEstateStatsCard>();

  for (const m of REAL_ESTATE_MARKETS) {
    const row = byKey.get(m.key);
    if (!row) {
      out.set(m.key, emptyStatsCard());
      continue;
    }

    const medPrice =
      row.median_price != null ? Number(row.median_price) : NaN;
    const medDom =
      row.median_dom != null ? Number(row.median_dom) : NaN;
    const avgPps =
      row.avg_price_per_sqft != null ? Number(row.avg_price_per_sqft) : NaN;
    const active =
      row.active_count != null ? Number(row.active_count) : 0;

    out.set(m.key, {
      median_price_display:
        Number.isFinite(medPrice) && medPrice > 0 ? formatPrice(medPrice) : "—",
      median_dom_display:
        Number.isFinite(medDom) && medDom >= 0 ? String(Math.round(medDom)) : "—",
      active_listings_display: String(active),
      avg_price_per_sqft_display:
        Number.isFinite(avgPps) && avgPps > 0 ? `$${Math.round(avgPps)}` : "—",
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
