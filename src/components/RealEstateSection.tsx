import { supabase } from "@/lib/supabase";
import { buildLiveMarketStatsMap } from "@/lib/real-estate/live-stats";
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
  const statsByKey = await buildLiveMarketStatsMap();

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
        .is("removed_at", null)
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
