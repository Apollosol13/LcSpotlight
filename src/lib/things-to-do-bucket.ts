import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";

const MARKET_KEYS = REAL_ESTATE_MARKETS.map((m) => m.key);

/**
 * Maps DB `market_key` to a tab bucket. Lowercases so "Bluffton" / "BLUFFTON" still match.
 * Unknown values fall back to `hhi` (same as previous behavior).
 */
export function bucketKeyForThingsToDoRow(market_key: string | null | undefined): RealEstateMarketKey {
  const raw = (market_key ?? "hhi").toString().trim().toLowerCase();
  if ((MARKET_KEYS as readonly string[]).includes(raw)) {
    return raw as RealEstateMarketKey;
  }
  return "hhi";
}
