import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";
import { FeaturedListingCard } from "./FeaturedListingCard";

type FeaturedRow = {
  id: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  redfin_path: string | null;
  photo_url: string | null;
  property_type: string | null;
  source_listing_id: string | null;
  market_key: string | null;
};

function formatPrice(n: number | null): string {
  if (n == null || n <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function specs(beds: number | null, baths: number | null, sqft: number | null): string {
  const p: string[] = [];
  if (beds != null) p.push(`${beds} bed`);
  if (baths != null) p.push(`${baths} bath`);
  if (sqft != null && sqft > 0) p.push(`${sqft.toLocaleString()} sqft`);
  return p.join(" · ");
}

function redfinUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://www.redfin.com${path.startsWith("/") ? path : `/${path}`}`;
}

function marketLabel(key: string | null): string | null {
  if (!key) return null;
  return REAL_ESTATE_MARKETS.find((m) => m.key === key)?.label ?? null;
}

export async function RealEstateFeatured() {
  const { data: rows } = await supabase
    .from("real_estate_listings")
    .select(
      "id, price, beds, baths, sqft, address_line, city, state, redfin_path, photo_url, property_type, source_listing_id, market_key",
    )
    .is("removed_at", null)
    .not("price", "is", null)
    .gt("price", 0)
    .not("photo_url", "is", null)
    .order("price", { ascending: false })
    .limit(6);

  const listings = (rows ?? []) as FeaturedRow[];

  const cards = listings.map((l) => ({
    id: l.id,
    price: formatPrice(l.price),
    address: [l.address_line, l.city, l.state].filter(Boolean).join(", ") || "Address on Redfin",
    specs: specs(l.beds, l.baths, l.sqft),
    href: redfinUrl(l.redfin_path),
    photoUrl: l.photo_url?.trim() ?? null,
    sourceListingId: l.source_listing_id,
    propertyType: l.property_type,
    area: marketLabel(l.market_key),
  }));

  return (
    <section className="overflow-hidden bg-spotlight-sand px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
              Featured homes
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
              Real Estate{" "}
              <em className="font-normal italic text-spotlight-teal">Spotlight</em>
            </h2>
            <p className="mt-2 max-w-md text-[11px] font-light leading-relaxed tracking-[0.03em] text-spotlight-text-muted">
              Featured listings from across the Lowcountry. Browse the full
              report for filters, stats, and Redfin links.
            </p>
          </div>
          <Link
            href="/real-estate"
            className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
          >
            Full report →
          </Link>
        </div>

        {/* Cards */}
        {cards.length === 0 ? (
          <p className="text-sm text-spotlight-text-muted">
            No listings available right now.
          </p>
        ) : (
          <div className="grid gap-4 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
            {cards.map((c) => (
              <FeaturedListingCard key={c.id} listing={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
