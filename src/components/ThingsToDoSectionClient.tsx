"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";
import type { ThingsToDoRow } from "@/lib/things-to-do-types";
import { thingsToDoImageSrc } from "@/lib/things-to-do-image";
import { websiteHref } from "@/lib/things-to-do-website";
import { THINGS_TO_DO_CATEGORY_PRESETS } from "@/lib/things-to-do-categories";

export type { ThingsToDoRow };

type Variant = "home" | "page";

type Props = {
  dealsByMarket: Record<RealEstateMarketKey, ThingsToDoRow[]>;
  variant: Variant;
  /** Optional link to full page (home only) */
  showAllLink?: boolean;
};

const ALL = "All";

export function ThingsToDoSectionClient({
  dealsByMarket,
  variant,
  showAllLink = true,
}: Props) {
  const tabs = REAL_ESTATE_MARKETS.map((m) => ({ key: m.key, label: m.label }));
  const [active, setActive] = useState<RealEstateMarketKey>("hhi");
  const [activeCategory, setActiveCategory] = useState(ALL);

  const deals = dealsByMarket[active] ?? [];

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(THINGS_TO_DO_CATEGORY_PRESETS);
    for (const d of deals) {
      const c = d.category?.trim();
      if (c) set.add(c);
    }
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [deals]);

  const visible = useMemo(() => {
    if (activeCategory === ALL) return deals;
    return deals.filter((d) => (d.category ?? "").trim() === activeCategory);
  }, [deals, activeCategory]);

  const selectMarket = (k: RealEstateMarketKey) => {
    setActive(k);
    setActiveCategory(ALL);
  };

  const cardClass =
    variant === "home"
      ? "group relative border border-spotlight-navy/[0.06] bg-white p-6 transition-colors hover:border-spotlight-teal/40 min-[601px]:p-6"
      : "group relative overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white p-6 transition-colors hover:border-spotlight-teal";

  return (
    <section
      className={
        variant === "home"
          ? "bg-spotlight-cream px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]"
          : ""
      }
    >
      <div className={variant === "home" ? "mx-auto max-w-[1200px]" : ""}>
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p
              className={
                variant === "home"
                  ? "mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55"
                  : "mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted"
              }
            >
              Local guide
            </p>
            {variant === "home" ? (
              <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
                Things <em className="font-normal italic text-spotlight-teal">To Do</em>
              </h2>
            ) : (
              <h1 className="font-serif text-3xl font-normal text-spotlight-navy">
                Things <em className="italic text-spotlight-gold">To Do</em>
              </h1>
            )}
            <p
              className={
                variant === "home"
                  ? "mt-2 max-w-xl text-[11px] font-light text-spotlight-text-muted"
                  : "mt-3 text-sm text-spotlight-text-mid"
              }
            >
              {variant === "home"
                ? "Activities and places by area — Hilton Head, Bluffton, Beaufort, and Savannah."
                : "A curated directory of things to do across the Lowcountry."}
            </p>
          </div>
          {variant === "home" && showAllLink ? (
            <Link
              href="/things-to-do"
              className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
            >
              See all →
            </Link>
          ) : null}
        </div>

        <div className="mb-6 flex flex-wrap gap-0 border-b border-spotlight-navy/10">
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

        <div className="mb-6 flex flex-wrap gap-2">
          {categoryOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeCategory === c
                  ? "border-spotlight-gold bg-spotlight-gold/15 text-spotlight-navy"
                  : "border-spotlight-navy/15 bg-white text-spotlight-teal/80 hover:border-spotlight-teal/40 hover:text-spotlight-navy"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {variant === "home" ? (
          <div className="grid grid-cols-1 gap-0.5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
            {visible.map((d) => {
              const thumb = thingsToDoImageSrc(d);
              return (
              <article key={d.id} className={cardClass}>
                <Link
                  href={`/things-to-do/${d.id}`}
                  className="block text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-spotlight-gold/50 focus-visible:ring-offset-2"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="-mx-6 -mt-6 mb-4 aspect-[16/9] w-[calc(100%+3rem)] max-w-none object-cover min-[601px]:w-[calc(100%+3rem)]"
                    />
                  ) : null}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    {d.category ? (
                      <span className="inline-flex max-w-[85%] items-center border border-spotlight-teal/20 bg-spotlight-teal/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-spotlight-teal">
                        {d.category}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                  <h3 className="mb-1.5 font-serif text-lg font-bold text-spotlight-navy">{d.title}</h3>
                  {d.description ? (
                    <p className="mb-3 text-[13px] font-light tracking-[0.03em] text-[#8a96a8]">{d.description}</p>
                  ) : null}
                  {d.venue ? (
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-spotlight-teal">{d.venue}</p>
                  ) : null}
                </Link>
                {websiteHref(d.website) ? (
                  <a
                    href={websiteHref(d.website)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 mt-3 inline-flex text-[11px] font-medium text-spotlight-gold-dark no-underline hover:underline"
                  >
                    Visit website →
                  </a>
                ) : null}
              </article>
            );
            })}
          </div>
        ) : (
          <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
            {visible.map((d) => {
              const thumb = thingsToDoImageSrc(d);
              return (
              <div key={d.id} className={cardClass}>
                <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-spotlight-teal transition-transform group-hover:scale-x-100" />
                <Link
                  href={`/things-to-do/${d.id}`}
                  className="block text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-spotlight-gold/50 focus-visible:ring-offset-2"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="-mx-6 -mt-6 mb-4 aspect-[16/9] w-[calc(100%+3rem)] max-w-none object-cover"
                    />
                  ) : null}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    {d.category ? (
                      <span className="inline-flex max-w-[90%] rounded-[2px] bg-[rgba(30,123,114,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-spotlight-teal">
                        {d.category}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mb-1.5 font-serif text-[17px] font-normal text-spotlight-navy">{d.title}</h2>
                  {d.description ? (
                    <p className="mb-3.5 text-[13px] font-light text-spotlight-text-muted">{d.description}</p>
                  ) : null}
                  {d.venue ? (
                    <p className="text-xs font-medium uppercase tracking-[0.5px] text-spotlight-text-mid">{d.venue}</p>
                  ) : null}
                </Link>
                {websiteHref(d.website) ? (
                  <a
                    href={websiteHref(d.website)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 mt-4 inline-flex text-xs font-medium text-spotlight-gold no-underline hover:underline"
                  >
                    Visit website →
                  </a>
                ) : null}
              </div>
            );
            })}
          </div>
        )}

        {visible.length === 0 ? (
          <p
            className={
              variant === "home"
                ? "py-10 text-center text-sm text-spotlight-text-muted"
                : "py-20 text-center text-sm text-spotlight-text-muted"
            }
          >
            No activities in this category yet. Try another filter or add items in admin.
          </p>
        ) : null}

        {variant === "page" ? (
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline hover:underline"
            >
              &larr; Back to Home
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
