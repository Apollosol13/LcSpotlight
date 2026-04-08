import Link from "next/link";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";
import { websiteHref } from "@/lib/things-to-do-website";
import { ThingsToDoDetailActions } from "@/components/ThingsToDoDetailActions";
import { googleMapsPlaceEmbedUrl } from "@/lib/google-maps-embed";
import { thingsToDoGalleryImageSrcs, thingsToDoImageSrc } from "@/lib/things-to-do-image";

function marketLabel(marketKey: string | null | undefined): string {
  const k = (marketKey ?? "").trim();
  const m = REAL_ESTATE_MARKETS.find((x) => x.key === k);
  return m?.label ?? "Lowcountry";
}

function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Only when the admin stored multiple lines — avoids duplicating the About paragraph. */
function newlineBullets(description: string | null | undefined): string[] {
  if (!description?.trim()) return [];
  const parts = description
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length >= 2 ? parts : [];
}

type Props = {
  row: ThingsToDoRow;
};

export function ThingsToDoDetail({ row }: Props) {
  const title = row.title?.trim() || "Listing";
  const site = websiteHref(row.website, { category: row.category });
  const area = marketLabel(row.market_key);
  const venue = row.venue?.trim() ?? "";
  const bullets = newlineBullets(row.description);
  const img = thingsToDoImageSrc(row);
  const gallerySrcs = thingsToDoGalleryImageSrcs(row);
  const mapQuery = row.place_formatted_address?.trim() || venue;
  const mapEmbedSrc = mapQuery ? googleMapsPlaceEmbedUrl(mapQuery) : null;
  const mapsOutHref =
    row.place_google_maps_uri?.trim() || (mapQuery ? mapsSearchUrl(mapQuery) : null);
  const rating =
    row.google_rating != null && !Number.isNaN(row.google_rating)
      ? row.google_rating
      : null;
  const reviewCount = row.google_user_rating_count;

  return (
    <div className="bg-spotlight-cream pb-16 pt-0">
      {/* Hero */}
      <section className="relative min-h-[min(52vh,420px)] w-full overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-spotlight-navy via-spotlight-navy-mid to-spotlight-teal/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
        <div className="relative z-10 flex min-h-[min(52vh,420px)] flex-col px-5 pb-10 pt-6 min-[601px]:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Link
              href="/things-to-do"
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Things to Do
            </Link>
            <ThingsToDoDetailActions shareTitle={title} websiteHref={site} />
          </div>
          <div className="mt-auto max-w-3xl">
            {row.category?.trim() ? (
              <span className="mb-3 inline-block rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                {row.category.trim()}
              </span>
            ) : null}
            <h1 className="font-serif text-[clamp(1.75rem,5vw,2.75rem)] font-normal leading-tight text-white">
              {title}
            </h1>
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-white/90 min-[601px]:flex-row min-[601px]:flex-wrap min-[601px]:items-center min-[601px]:gap-6">
              {venue ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="size-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {venue}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <svg className="size-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {area}
              </span>
              {rating != null ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="size-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>
                    {rating.toFixed(1)}
                    {reviewCount != null && reviewCount > 0
                      ? ` · ${reviewCount.toLocaleString()} reviews`
                      : null}{" "}
                    <span className="text-white/70">(Google)</span>
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="size-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Hours vary — check the venue&apos;s site
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 min-[601px]:px-10">
        <div className="-mt-6 grid gap-8 lg:grid-cols-[1fr_min(340px,100%)] lg:items-start lg:gap-10">
          {/* Main column */}
          <div className="space-y-6 pt-2">
            <section className="rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-sm min-[601px]:p-8">
              <h2 className="mb-4 font-serif text-xl font-normal text-spotlight-navy">About this listing</h2>
              {row.place_editorial_summary?.trim() ? (
                <p className="mb-4 text-[15px] font-light leading-relaxed tracking-[0.02em] text-spotlight-text-mid">
                  {row.place_editorial_summary.trim()}
                </p>
              ) : null}
              {row.description?.trim() ? (
                <p className="text-[15px] font-light leading-relaxed tracking-[0.02em] text-spotlight-text-mid">
                  {row.description.trim()}
                </p>
              ) : !row.place_editorial_summary?.trim() ? (
                <p className="text-sm text-spotlight-text-muted">No description yet.</p>
              ) : null}
              <div className="mt-6 grid gap-3 min-[480px]:grid-cols-2">
                <div className="rounded-lg border border-spotlight-navy/10 bg-spotlight-cream/80 px-4 py-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-spotlight-text-muted">
                    Area
                  </p>
                  <p className="font-serif text-base text-spotlight-navy">{area}</p>
                </div>
                <div className="rounded-lg border border-spotlight-navy/10 bg-spotlight-cream/80 px-4 py-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-spotlight-text-muted">
                    Category
                  </p>
                  <p className="font-serif text-base text-spotlight-navy">
                    {row.category?.trim() ?? "—"}
                  </p>
                </div>
              </div>
            </section>

            {bullets.length > 1 ? (
              <section className="rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-sm min-[601px]:p-8">
                <h2 className="mb-4 font-serif text-xl font-normal text-spotlight-navy">Highlights</h2>
                <ul className="space-y-2.5">
                  {bullets.map((line) => (
                    <li key={line} className="flex gap-2.5 text-[14px] text-spotlight-text-mid">
                      <span className="mt-0.5 text-spotlight-teal" aria-hidden>
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {gallerySrcs.length > 0 ? (
              <section className="rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-sm min-[601px]:p-8">
                <h2 className="mb-4 font-serif text-xl font-normal text-spotlight-navy">Gallery</h2>
                <div
                  className={
                    gallerySrcs.length === 1
                      ? "grid grid-cols-1"
                      : "grid grid-cols-2 gap-2 min-[601px]:grid-cols-3"
                  }
                >
                  {gallerySrcs.map((src) => (
                    <div key={src}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-sm min-[601px]:p-8">
              <h2 className="mb-4 font-serif text-xl font-normal text-spotlight-navy">Hours &amp; contact</h2>
              <div className="grid gap-6 min-[601px]:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-spotlight-text-muted">
                    Hours
                  </p>
                  {row.opening_hours_text?.trim() ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-spotlight-text-mid">
                      {row.opening_hours_text.trim()}
                    </p>
                  ) : (
                    <p className="text-sm leading-relaxed text-spotlight-text-mid">
                      Visit the official website for current hours, special events, and closures.
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  {row.place_international_phone?.trim() ? (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-spotlight-text-muted">
                        Phone
                      </p>
                      <a
                        href={`tel:${row.place_international_phone.replace(/\s+/g, "")}`}
                        className="text-sm font-medium text-spotlight-navy no-underline hover:underline"
                      >
                        {row.place_international_phone.trim()}
                      </a>
                    </div>
                  ) : null}
                  {site ? (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-spotlight-text-muted">
                        Website
                      </p>
                      <a
                        href={site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-spotlight-navy/12 bg-spotlight-cream/60 px-3 py-2.5 text-sm font-medium text-spotlight-navy no-underline transition-colors hover:border-spotlight-teal/40"
                      >
                        {site.replace(/^https?:\/\//i, "")}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-spotlight-text-muted">No website on file.</p>
                  )}
                </div>
              </div>
            </section>

            {venue || row.place_formatted_address?.trim() ? (
              <section className="rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-sm min-[601px]:p-8">
                <h2 className="mb-3 font-serif text-xl font-normal text-spotlight-navy">Location</h2>
                <div className="mb-4 space-y-1">
                  {venue ? <p className="text-sm font-medium text-spotlight-navy">{venue}</p> : null}
                  {row.place_formatted_address?.trim() ? (
                    <p className="text-sm text-spotlight-text-mid">{row.place_formatted_address.trim()}</p>
                  ) : null}
                </div>
                <div className="overflow-hidden rounded-lg border border-spotlight-navy/10 bg-[#e8eaee]">
                  {mapEmbedSrc ? (
                    <iframe
                      title={`Map: ${mapQuery || title}`}
                      src={mapEmbedSrc}
                      className="aspect-[16/10] min-h-[240px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-4 py-10">
                      <svg
                        className="size-12 text-spotlight-navy/25"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <a
                        href={mapQuery ? mapsSearchUrl(mapQuery) : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-spotlight-navy px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white no-underline transition-opacity hover:opacity-90"
                      >
                        Get directions
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-[12px] font-medium">
                  {mapsOutHref ? (
                    <a
                      href={mapsOutHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-spotlight-teal no-underline hover:underline"
                    >
                      View on Google Maps
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-[rgba(12,27,51,0.1)] bg-white p-6 shadow-[0_8px_30px_rgba(12,27,51,0.08)]">
              <div className="mb-4 flex items-start justify-between gap-2">
                <h2 className="font-serif text-lg font-normal text-spotlight-navy">Plan your visit</h2>
                <span className="shrink-0 rounded-full bg-spotlight-coral/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-spotlight-coral">
                  {area}
                </span>
              </div>
              {venue ? (
                <p className="mb-1 flex items-start gap-2 text-[13px] text-spotlight-text-mid">
                  <svg className="mt-0.5 size-4 shrink-0 text-spotlight-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {venue}
                </p>
              ) : null}
              <p className="mb-6 text-[12px] text-spotlight-text-muted">
                Confirm hours and offerings on the venue&apos;s official site before you go.
              </p>
              {site ? (
                <a
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-lg bg-spotlight-navy py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-white no-underline transition-opacity hover:opacity-90"
                >
                  Visit official website
                </a>
              ) : (
                <p className="text-center text-sm text-spotlight-text-muted">No website link for this listing.</p>
              )}
              <p className="mt-3 text-center text-[11px] text-spotlight-text-muted">
                Listing information may change — always verify with the business.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
