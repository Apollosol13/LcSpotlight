import type { Metadata } from "next";
import Link from "next/link";
import { SITE_SEARCH_TYPE_LABEL, siteSearch, type SiteSearchHitType } from "@/lib/site-search";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | Lowcountry Spotlight",
  description: "Search events, news, things to do, deals, and more across LC Spotlight.",
};

const TYPE_ORDER: SiteSearchHitType[] = [
  "event",
  "news",
  "things_to_do",
  "deal",
  "ticket",
  "opening",
];

function groupHits(hits: Awaited<ReturnType<typeof siteSearch>>) {
  const map = new Map<SiteSearchHitType, typeof hits>();
  for (const t of TYPE_ORDER) map.set(t, []);
  for (const h of hits) {
    map.get(h.type)?.push(h);
  }
  return TYPE_ORDER.filter((t) => (map.get(t)?.length ?? 0) > 0).map((t) => ({
    type: t,
    label: SITE_SEARCH_TYPE_LABEL[t],
    items: map.get(t)!,
  }));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const qRaw = typeof sp.q === "string" ? sp.q : Array.isArray(sp.q) ? sp.q[0] : "";
  const q = qRaw?.trim() ?? "";
  const hits = await siteSearch(supabase, q);
  const grouped = groupHits(hits);
  const tooShort = q.length > 0 && q.length < 2;

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-12 min-[601px]:px-10 min-[601px]:py-16">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
        LC Spotlight
      </p>
      <h1 className="font-serif text-3xl font-normal text-spotlight-navy">Search</h1>
      <p className="mt-2 text-sm text-spotlight-text-mid">
        Events, news, things to do, deals, tickets, and new openings.
      </p>

      <form
        action="/search"
        method="get"
        className="mt-8 flex w-full gap-0 border border-spotlight-sand bg-white shadow-sm"
        role="search"
      >
        <label htmlFor="site-search-q" className="sr-only">
          Search keywords
        </label>
        <input
          id="site-search-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search the Lowcountry…"
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm text-spotlight-navy outline-none placeholder:text-spotlight-text-muted"
        />
        <button
          type="submit"
          className="shrink-0 bg-spotlight-navy px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-gold transition-colors hover:bg-spotlight-teal"
        >
          Search
        </button>
      </form>

      {tooShort && (
        <p className="mt-6 text-sm text-spotlight-text-muted">
          Enter at least two characters to search.
        </p>
      )}

      {!tooShort && q.length >= 2 && hits.length === 0 && (
        <p className="mt-10 text-sm text-spotlight-text-muted">
          No results for &ldquo;{q}&rdquo;. Try another keyword or browse the{" "}
          <Link href="/things-to-do" className="text-spotlight-teal underline-offset-2 hover:underline">
            directory
          </Link>
          .
        </p>
      )}

      {!tooShort && q.length >= 2 && hits.length > 0 && (
        <div className="mt-10 space-y-10">
          <p className="text-xs text-spotlight-text-muted">
            {hits.length} result{hits.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          </p>
          {grouped.map((section) => (
            <section key={section.type} aria-labelledby={`search-${section.type}`}>
              <h2
                id={`search-${section.type}`}
                className="mb-3 border-b border-spotlight-sand pb-2 font-serif text-lg font-normal text-spotlight-navy"
              >
                {section.label}
              </h2>
              <ul className="m-0 list-none space-y-3 p-0">
                {section.items.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg border border-[rgba(12,27,51,0.08)] bg-white px-4 py-3 no-underline transition hover:border-spotlight-gold/35 hover:shadow-[0_6px_24px_rgba(12,27,51,0.06)]"
                      >
                        <span className="font-medium text-spotlight-navy group-hover:text-spotlight-teal">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="mt-1 block line-clamp-2 text-xs text-spotlight-text-muted">
                            {item.subtitle}
                          </span>
                        ) : null}
                        <span className="mt-2 block text-[10px] uppercase tracking-[0.12em] text-spotlight-gold-dark">
                          Open link →
                        </span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="group block rounded-lg border border-[rgba(12,27,51,0.08)] bg-white px-4 py-3 no-underline transition hover:border-spotlight-gold/35 hover:shadow-[0_6px_24px_rgba(12,27,51,0.06)]"
                      >
                        <span className="font-medium text-spotlight-navy group-hover:text-spotlight-teal">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="mt-1 block line-clamp-2 text-xs text-spotlight-text-muted">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
