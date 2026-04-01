"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { redfinPhotoUrlCandidates } from "@/lib/redfin-photo";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";

export type { RealEstateMarketKey };

export type RealEstateListingCard = {
  id: string;
  property_type: string | null;
  /** Raw USD for sort / filter */
  price_amount: number | null;
  price_display: string;
  address: string;
  detail: string;
  href: string | null;
  photo_url: string | null;
  /** Redfin listing id — used to try alternate CDN folder when primary image 404s */
  source_listing_id: string | null;
};

const EMPTY_LISTINGS: RealEstateListingCard[] = [];

export type RealEstateStatsCard = {
  median_price_display: string;
  median_dom_display: string;
  active_listings_display: string;
  avg_price_per_sqft_display: string;
  price_subtext: string;
  dom_subtext: string;
  listings_subtext: string;
  ratio_subtext: string;
};

type SortOrder = "high-low" | "low-high";

const statCards: {
  valueKey: keyof RealEstateStatsCard;
  subKey: keyof RealEstateStatsCard;
  label: string;
}[] = [
  { valueKey: "median_price_display", subKey: "price_subtext", label: "Median list price" },
  { valueKey: "median_dom_display", subKey: "dom_subtext", label: "Days on market" },
  { valueKey: "active_listings_display", subKey: "listings_subtext", label: "Active listings" },
  { valueKey: "avg_price_per_sqft_display", subKey: "ratio_subtext", label: "Avg. $/sqft" },
];

const emptyStats: RealEstateStatsCard = {
  median_price_display: "—",
  median_dom_display: "—",
  active_listings_display: "—",
  avg_price_per_sqft_display: "—",
  price_subtext: "Run scraper or wait for the next hourly sync",
  dom_subtext: "Median days on Redfin",
  listings_subtext: "Homes for sale (sample)",
  ratio_subtext: "Where sqft is available",
};

type Props = {
  markets: Record<RealEstateMarketKey, { stats: RealEstateStatsCard | null; listings: RealEstateListingCard[] }>;
  /** Hide on `/real-estate` where this section is the full page */
  showFullReportsLink?: boolean;
  /** Homepage: stats + tabs only; full listings on `/real-estate` */
  showListings?: boolean;
};

function parsePriceBound(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatUsdShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `$${Math.round(m)}M` : `$${m.toFixed(m >= 1 ? 1 : 2).replace(/\.?0+$/, "")}M`;
  }
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${Math.round(n)}`;
}

function formatPriceRangeLabel(minStr: string, maxStr: string): string {
  const minB = parsePriceBound(minStr);
  const maxB = parsePriceBound(maxStr);
  if (minB == null && maxB == null) return "Any price";
  if (minB != null && maxB != null) return `${formatUsdShort(minB)} – ${formatUsdShort(maxB)}`;
  if (minB != null) return `${formatUsdShort(minB)} and up`;
  return `Up to ${formatUsdShort(maxB!)}`;
}

/** Slider domain: $0 (no min) … $5M (no max). Step keeps thumbs aligned to round amounts. */
const PRICE_SLIDER_MAX = 5_000_000;
const PRICE_SLIDER_STEP = 25_000;

function minStrToSliderValue(minStr: string): number {
  const b = parsePriceBound(minStr);
  if (b == null) return 0;
  return Math.min(Math.max(0, b), PRICE_SLIDER_MAX);
}

function maxStrToSliderValue(maxStr: string): number {
  const b = parsePriceBound(maxStr);
  if (b == null) return PRICE_SLIDER_MAX;
  return Math.min(Math.max(0, b), PRICE_SLIDER_MAX);
}

function PriceRangeDualSlider({
  minStr,
  maxStr,
  onMinChange,
  onMaxChange,
}: {
  minStr: string;
  maxStr: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  const minVal = minStrToSliderValue(minStr);
  const maxVal = maxStrToSliderValue(maxStr);
  const minPct = (minVal / PRICE_SLIDER_MAX) * 100;
  const maxPct = (maxVal / PRICE_SLIDER_MAX) * 100;

  return (
    <div className="re-price-dual-slider">
      <div className="relative h-10">
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-spotlight-navy/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-spotlight-navy/40"
          style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={0}
          max={PRICE_SLIDER_MAX}
          step={PRICE_SLIDER_STEP}
          value={minVal}
          aria-label="Minimum price"
          className="absolute inset-x-0 top-0 z-10 h-10 w-full cursor-pointer"
          onChange={(e) => {
            const v = Number(e.target.value);
            const capMax = maxStrToSliderValue(maxStr);
            if (v > capMax) {
              onMaxChange(v >= PRICE_SLIDER_MAX ? "" : String(v));
            }
            onMinChange(v === 0 ? "" : String(v));
          }}
        />
        <input
          type="range"
          min={0}
          max={PRICE_SLIDER_MAX}
          step={PRICE_SLIDER_STEP}
          value={maxVal}
          aria-label="Maximum price"
          className="absolute inset-x-0 top-0 z-20 h-10 w-full cursor-pointer"
          onChange={(e) => {
            const v = Number(e.target.value);
            const floorMin = minStrToSliderValue(minStr);
            if (v < floorMin) {
              onMinChange(v === 0 ? "" : String(v));
            }
            onMaxChange(v >= PRICE_SLIDER_MAX ? "" : String(v));
          }}
        />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-[9px] font-medium uppercase tracking-[0.14em] text-spotlight-teal/55">
        <span>
          Min:{" "}
          {minStr === "" ? (
            <span className="font-normal text-spotlight-navy/50">No min</span>
          ) : (
            <span className="font-normal normal-case tracking-normal text-spotlight-navy">
              {formatUsdShort(minVal)}
            </span>
          )}
        </span>
        <span className="text-right">
          Max:{" "}
          {maxStr === "" ? (
            <span className="font-normal text-spotlight-navy/50">No max</span>
          ) : (
            <span className="font-normal normal-case tracking-normal text-spotlight-navy">
              {formatUsdShort(maxVal)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export function RealEstateSectionClient({
  markets,
  showFullReportsLink = true,
  showListings = true,
}: Props) {
  const tabs = REAL_ESTATE_MARKETS.map((m) => ({ key: m.key, label: m.label }));
  const [active, setActive] = useState<RealEstateMarketKey>("hhi");
  const [sortOrder, setSortOrder] = useState<SortOrder>("high-low");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [pricePanelOpen, setPricePanelOpen] = useState(false);
  const pricePanelRef = useRef<HTMLDivElement>(null);

  function selectMarket(key: RealEstateMarketKey) {
    setActive(key);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSortOrder("high-low");
    setPricePanelOpen(false);
  }

  useEffect(() => {
    if (!pricePanelOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (pricePanelRef.current && !pricePanelRef.current.contains(e.target as Node)) {
        setPricePanelOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [pricePanelOpen]);

  useEffect(() => {
    if (!pricePanelOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPricePanelOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pricePanelOpen]);

  const m = markets[active];
  const stats = m.stats ?? emptyStats;
  const listings = m.listings.length ? m.listings : EMPTY_LISTINGS;

  const visibleListings = useMemo(() => {
    if (!showListings) return [];
    if (!listings.length) return PLACEHOLDER_LISTINGS;

    let minB = parsePriceBound(minPriceInput);
    let maxB = parsePriceBound(maxPriceInput);
    if (minB != null && maxB != null && minB > maxB) {
      const t = minB;
      minB = maxB;
      maxB = t;
    }

    let out = listings.filter((l) => {
      if (l.price_amount == null) return false;
      if (minB != null && l.price_amount < minB) return false;
      if (maxB != null && l.price_amount > maxB) return false;
      return true;
    });

    out = [...out].sort((a, b) => {
      const pa = a.price_amount ?? 0;
      const pb = b.price_amount ?? 0;
      return sortOrder === "low-high" ? pa - pb : pb - pa;
    });

    return out;
  }, [showListings, listings, minPriceInput, maxPriceInput, sortOrder]);

  const hasPriceFilters =
    parsePriceBound(minPriceInput) != null || parsePriceBound(maxPriceInput) != null;
  const filterActive = hasPriceFilters || sortOrder !== "high-low";

  return (
    <section className="bg-spotlight-sand px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
              Market report ·{" "}
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
              Real estate <em className="font-normal italic text-spotlight-teal">Snapshot</em>
            </h2>
            <p className="mt-2 max-w-xl text-[11px] font-light leading-relaxed tracking-[0.03em] text-spotlight-text-muted">
              {showListings ? (
                <>
                  Listing sample and stats from Redfin (for-sale inventory). Figures update on a schedule and may
                  differ from official MLS.
                </>
              ) : (
                <>
                  Market snapshot from Redfin (for-sale sample). Browse sortable listings with photos on the full
                  report — figures may differ from official MLS.
                </>
              )}
            </p>
          </div>
          {showFullReportsLink ? (
            <Link
              href="/real-estate"
              className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
            >
              Full reports →
            </Link>
          ) : null}
        </div>

        <div className="mb-2 flex flex-wrap gap-0 border-b border-spotlight-navy/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectMarket(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-[10px] font-normal uppercase tracking-[0.14em] transition-colors min-[601px]:px-6 ${
                active === t.key
                  ? "border-spotlight-gold text-spotlight-navy"
                  : "border-transparent text-spotlight-teal/50 hover:text-spotlight-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mb-0.5 grid grid-cols-1 gap-0.5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-4">
          {statCards.map((s) => {
            const value = stats[s.valueKey];
            const sub = stats[s.subKey];
            return (
              <div
                key={s.label}
                className="cursor-pointer border-b-[3px] border-b-transparent bg-white px-6 py-7 transition-colors hover:border-b-spotlight-gold"
              >
                <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-teal/55">
                  {s.label}
                </p>
                <p className="mb-1.5 font-serif text-[40px] font-bold leading-none text-spotlight-navy">
                  {value}
                </p>
                <p className="text-[11px] font-light tracking-[0.04em] text-spotlight-text-muted">{sub}</p>
              </div>
            );
          })}
        </div>

        {!showListings && showFullReportsLink ? (
          <p className="mt-6 text-[12px] font-light leading-relaxed text-spotlight-text-mid">
            <Link
              href="/real-estate"
              className="border-b border-spotlight-gold-dark font-medium text-spotlight-navy no-underline hover:text-spotlight-teal"
            >
              Open the full real estate report
            </Link>{" "}
            for listings, filters, and Redfin links.
          </p>
        ) : null}

        {showListings && listings.length > 0 ? (
          <div className="mt-8 flex flex-col gap-5 border-t border-spotlight-navy/10 pt-6">
            <div className="flex flex-col gap-5 min-[601px]:flex-row min-[601px]:flex-wrap min-[601px]:items-end min-[601px]:gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-teal/55">
                  Sort by price
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSortOrder("high-low")}
                    className={`rounded-sm border px-3 py-2 text-[10px] font-normal uppercase tracking-[0.12em] transition-colors ${
                      sortOrder === "high-low"
                        ? "border-spotlight-navy bg-spotlight-navy text-white"
                        : "border-spotlight-navy/15 bg-white text-spotlight-navy hover:border-spotlight-gold"
                    }`}
                  >
                    High → Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder("low-high")}
                    className={`rounded-sm border px-3 py-2 text-[10px] font-normal uppercase tracking-[0.12em] transition-colors ${
                      sortOrder === "low-high"
                        ? "border-spotlight-navy bg-spotlight-navy text-white"
                        : "border-spotlight-navy/15 bg-white text-spotlight-navy hover:border-spotlight-gold"
                    }`}
                  >
                    Low → High
                  </button>
                </div>
              </div>

              <div ref={pricePanelRef} className="relative w-full min-[601px]:w-auto min-[601px]:shrink-0">
                <div className="flex flex-col gap-2">
                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-teal/55">
                    Price range
                  </p>
                  <button
                    type="button"
                    aria-expanded={pricePanelOpen}
                    aria-controls={`re-price-panel-${active}`}
                    id={`re-price-trigger-${active}`}
                    onClick={() => setPricePanelOpen((o) => !o)}
                    className={`inline-flex w-full min-[601px]:w-auto flex-col items-start gap-0.5 rounded-sm border border-spotlight-navy bg-spotlight-navy px-3 py-2 text-left text-white transition-colors hover:bg-spotlight-navy/90 ${
                      pricePanelOpen
                        ? "shadow-md ring-2 ring-spotlight-gold/60 ring-offset-2 ring-offset-spotlight-sand"
                        : hasPriceFilters
                          ? "shadow-sm"
                          : ""
                    }`}
                  >
                    <span className="text-[10px] font-normal uppercase tracking-[0.14em]">
                      Set price range
                    </span>
                    <span className="text-[11px] font-light text-white/80">
                      {formatPriceRangeLabel(minPriceInput, maxPriceInput)}
                    </span>
                  </button>
                </div>

                {pricePanelOpen ? (
                  <div
                    id={`re-price-panel-${active}`}
                    role="region"
                    aria-labelledby={`re-price-trigger-${active}`}
                    className="absolute left-0 right-0 top-full z-20 mt-2 min-[601px]:right-auto min-[601px]:w-[min(18rem,calc(100vw-2.5rem))] rounded-sm border border-spotlight-navy/10 bg-white p-4 shadow-[0_8px_28px_rgba(17,34,80,0.12)]"
                  >
                    <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.16em] text-spotlight-teal/55">
                      Drag to set min and max
                    </p>
                    <PriceRangeDualSlider
                      minStr={minPriceInput}
                      maxStr={maxPriceInput}
                      onMinChange={setMinPriceInput}
                      onMaxChange={setMaxPriceInput}
                    />
                    <p className="mt-2 text-[10px] font-light leading-snug text-spotlight-text-muted">
                      Range $0–{formatUsdShort(PRICE_SLIDER_MAX)}. Move either handle to the end for no min or no max.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-spotlight-navy/8 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setMinPriceInput("");
                          setMaxPriceInput("");
                        }}
                        className="text-[10px] font-normal uppercase tracking-[0.14em] text-spotlight-teal/80 underline-offset-2 hover:text-spotlight-navy hover:underline"
                      >
                        Clear price range
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricePanelOpen(false)}
                        className="rounded-sm border border-spotlight-navy/15 bg-spotlight-navy px-4 py-2 text-[10px] font-normal uppercase tracking-[0.12em] text-white hover:bg-spotlight-navy/90"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {filterActive ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput("");
                    setMaxPriceInput("");
                    setSortOrder("high-low");
                    setPricePanelOpen(false);
                  }}
                  className="border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.14em] text-spotlight-gold-dark"
                >
                  Reset all filters
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {showListings ? (
          <div className="mt-8 border-t border-spotlight-navy/10 pt-8">
            <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-spotlight-teal/55">
              Listings
            </p>
            <p className="mb-6 text-[13px] font-light text-spotlight-text-mid">
              {!listings.length
                ? "No listings loaded for this market yet. Run the scraper or wait for the next sync."
                : hasPriceFilters
                  ? `Showing ${visibleListings.length} of ${listings.length} homes that match your price range. Open a card for the full Redfin listing.`
                  : `${listings.length} homes in this sample — use sort and Set price range, then scroll to browse. Open a card for the full Redfin listing.`}
            </p>
            {!listings.length ? (
              <div className="flex flex-col gap-2">
                {PLACEHOLDER_LISTINGS.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            ) : visibleListings.length === 0 ? (
              <p className="rounded-sm border border-spotlight-navy/10 bg-white px-5 py-8 text-center text-[13px] font-light text-spotlight-text-mid">
                No homes match your price range. Try widening min/max or reset filters.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleListings.map((l) => (
                  <ListingCard
                    key={`${l.id}:${l.photo_url ?? ""}:${l.source_listing_id ?? ""}`}
                    listing={l}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ListingCard({ listing: l }: { listing: RealEstateListingCard }) {
  const photoCandidates = useMemo(
    () => redfinPhotoUrlCandidates(l.photo_url, l.source_listing_id),
    [l.photo_url, l.source_listing_id],
  );
  const [candidateIdx, setCandidateIdx] = useState(0);
  const activeSrc = photoCandidates[candidateIdx] ?? null;
  const showPhoto = Boolean(activeSrc);

  const photoPlaceholder = (
    <div className="flex h-full items-center justify-center px-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-teal/35">
      {l.href ? "Photo on Redfin" : "No photo"}
    </div>
  );

  const cardInner = (
    <div className="flex flex-col gap-4 min-[480px]:flex-row min-[480px]:items-stretch">
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[#e8e4dc] min-[480px]:h-44 min-[480px]:w-56">
        {showPhoto ? (
          <Image
            src={activeSrc!}
            key={activeSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 224px"
            unoptimized
            onError={() => {
              setCandidateIdx((i) => i + 1);
            }}
          />
        ) : (
          photoPlaceholder
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-0 min-[480px]:py-2">
        <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-teal/50">
          {l.property_type ?? "Listing"}
        </p>
        <p className="mb-1 font-serif text-[clamp(1.35rem,3.5vw,1.75rem)] font-bold leading-tight text-spotlight-navy">
          {l.price_display}
        </p>
        <p className="mb-1 text-[13px] font-light tracking-[0.02em] text-[#5a6880]">{l.address}</p>
        <p className="border-t border-spotlight-sand pt-2 text-[11px] font-light tracking-[0.04em] text-[#9aa0ab]">
          {l.detail}
        </p>
      </div>
    </div>
  );

  const cardClass =
    "block rounded-sm border border-spotlight-navy/[0.06] bg-white p-4 shadow-[0_1px_0_rgba(17,34,80,0.04)] transition-shadow hover:shadow-[0_8px_28px_rgba(17,34,80,0.07)] min-[480px]:p-5";

  if (l.href) {
    return (
      <a
        href={l.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClass} no-underline`}
      >
        {cardInner}
      </a>
    );
  }

  return <div className={cardClass}>{cardInner}</div>;
}

const PLACEHOLDER_LISTINGS: RealEstateListingCard[] = [
  {
    id: "placeholder-1",
    property_type: null,
    price_amount: null,
    price_display: "—",
    address: "No listings yet for this market",
    detail: "Trigger POST /api/scrape with your service key or wait for cron",
    href: null,
    photo_url: null,
    source_listing_id: null,
  },
];
