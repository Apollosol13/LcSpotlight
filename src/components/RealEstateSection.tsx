import { supabase } from "@/lib/supabase";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";
import {
  RealEstateSectionClient,
  type RealEstateListingCard,
  type RealEstateStatsCard,
} from "./RealEstateSectionClient";

function formatMoney(n: number | null): string {
  if (n == null || n <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function listingDetail(beds: number | null, baths: number | null, sqft: number | null): string {
  const parts: string[] = [];
  if (beds != null) parts.push(`${beds} bed`);
  if (baths != null) parts.push(`${baths} bath`);
  if (sqft != null && sqft > 0) parts.push(`${sqft.toLocaleString()} sqft`);
  return parts.length ? parts.join(" · ") : "Details on Redfin";
}

function redfinUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://www.redfin.com${path.startsWith("/") ? path : `/${path}`}`;
}

function rowToStats(row: Record<string, unknown>): RealEstateStatsCard {
  const s = (k: string, fallback: string) =>
    typeof row[k] === "string" && (row[k] as string).length ? (row[k] as string) : fallback;
  return {
    median_price_display: s("median_price_display", "—"),
    median_dom_display: s("median_dom_display", "—"),
    active_listings_display: s("active_listings_display", "—"),
    avg_price_per_sqft_display: s("avg_price_per_sqft_display", "—"),
    price_subtext: s("price_subtext", "Median · sample"),
    dom_subtext: s("dom_subtext", "Median days on Redfin"),
    listings_subtext: s("listings_subtext", "Homes for sale (sample)"),
    ratio_subtext: s("ratio_subtext", "Avg $/sqft"),
  };
}

type RealEstateSectionProps = {
  showFullReportsLink?: boolean;
  /** Cap rows loaded per market (scraper stores up to ~350 each). Only used when showListings is true. */
  maxListingsPerMarket?: number;
  /** Homepage: stats only. Full listings on `/real-estate`. */
  showListings?: boolean;
};

export async function RealEstateSection({
  showFullReportsLink = true,
  maxListingsPerMarket = 48,
  showListings = true,
}: RealEstateSectionProps = {}) {
  const keys = REAL_ESTATE_MARKETS.map((m) => m.key);
  const { data: statRows } = await supabase.from("real_estate_stats").select("*").in("market_key", keys);

  const statsByKey = new Map<string, RealEstateStatsCard>();
  for (const row of statRows ?? []) {
    const mk = row.market_key as string;
    if ((keys as string[]).includes(mk)) {
      statsByKey.set(mk, rowToStats(row as Record<string, unknown>));
    }
  }

  const markets = {} as Record<
    RealEstateMarketKey,
    { stats: RealEstateStatsCard | null; listings: RealEstateListingCard[] }
  >;

  for (const m of REAL_ESTATE_MARKETS) {
    let listings: RealEstateListingCard[] = [];
    if (showListings) {
      const { data: listingRows } = await supabase
        .from("real_estate_listings")
        .select(
          "id, property_type, price, beds, baths, sqft, address_line, city, state, redfin_path, photo_url, source_listing_id",
        )
        .eq("market_key", m.key)
        .not("price", "is", null)
        .gt("price", 0)
        .order("price", { ascending: false })
        .limit(maxListingsPerMarket);

      listings = (listingRows ?? []).map((r) => {
        const addr =
          [r.address_line, r.city, r.state].filter(Boolean).join(", ") || "Address on Redfin";
        const rawPhoto =
          typeof r.photo_url === "string" ? r.photo_url.trim() : "";
        return {
          id: r.id,
          property_type: r.property_type,
          price_amount: typeof r.price === "number" ? r.price : null,
          price_display: formatMoney(r.price),
          address: addr,
          detail: listingDetail(r.beds, r.baths, r.sqft),
          href: redfinUrl(r.redfin_path),
          photo_url: rawPhoto.startsWith("http") ? rawPhoto : null,
          source_listing_id:
            typeof r.source_listing_id === "string" && r.source_listing_id.trim()
              ? r.source_listing_id.trim()
              : null,
        };
      });
    }

    markets[m.key] = {
      stats: statsByKey.get(m.key) ?? null,
      listings,
    };
  }

  return (
    <RealEstateSectionClient
      markets={markets}
      showFullReportsLink={showFullReportsLink}
      showListings={showListings}
    />
  );
}
