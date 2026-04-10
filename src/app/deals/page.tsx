import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { REAL_ESTATE_MARKETS, type RealEstateMarketKey } from "@/lib/real-estate-markets";
import { Paywall } from "@/components/Paywall";

export const revalidate = 300;

export const metadata = {
  title: "Local deals | Lowcountry Spotlight",
  description: "Discounts and offers from businesses across Hilton Head, Bluffton, Beaufort, and Savannah.",
};

type DiscountRow = {
  id: string;
  market_key: string;
  title: string;
  description: string | null;
  terms: string | null;
  redeem_url: string | null;
  expires_on: string | null;
  image_url: string | null;
};

const marketLabel = (key: string) =>
  REAL_ESTATE_MARKETS.find((m) => m.key === key)?.label ?? key;

export default async function DealsPage() {
  const supabase = await createSupabaseServer();
  const { data: rows } = await supabase
    .from("business_discounts")
    .select("id, market_key, title, description, terms, redeem_url, expires_on, image_url")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const list = (rows ?? []) as DiscountRow[];

  const byMarket: Record<RealEstateMarketKey, DiscountRow[]> = {
    hhi: [],
    bluffton: [],
    beaufort: [],
    savannah: [],
  };

  for (const row of list) {
    const k = row.market_key as RealEstateMarketKey;
    if (k in byMarket) byMarket[k].push(row);
  }

  return (
    <Paywall feature="local deals and discounts">
    <div className="bg-spotlight-cream px-5 py-14 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
          Directory
        </p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
          Local <em className="font-normal italic text-spotlight-teal">deals</em>
        </h1>
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-spotlight-text-mid">
          Offers from partner businesses. Terms apply; confirm details with the venue before you go.
        </p>

        <p className="mt-10 text-sm text-spotlight-text-muted">
          List your business?{" "}
          <Link href="/login" className="text-spotlight-teal no-underline hover:underline">
            Partner sign-in
          </Link>
        </p>

        <div className="mt-12 space-y-14">
          {REAL_ESTATE_MARKETS.map((m) => {
            const deals = byMarket[m.key];
            if (!deals.length) return null;
            return (
              <section key={m.key}>
                <h2 className="mb-6 border-b border-spotlight-sand pb-2 font-serif text-xl text-spotlight-navy">
                  {m.label}
                </h2>
                <ul className="space-y-6">
                  {deals.map((d) => (
                    <li
                      key={d.id}
                      className="rounded border border-spotlight-navy/[0.08] bg-white/80 p-6 shadow-sm"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-text-muted">
                        {marketLabel(d.market_key)}
                      </p>
                      {d.image_url?.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.image_url.trim()}
                          alt=""
                          className="mt-3 max-h-52 w-full rounded object-cover"
                        />
                      ) : null}
                      <h3 className="mt-3 font-serif text-xl text-spotlight-navy">{d.title}</h3>
                      {d.description ? (
                        <p className="mt-3 text-sm leading-relaxed text-spotlight-text-mid">
                          {d.description}
                        </p>
                      ) : null}
                      {d.terms ? (
                        <p className="mt-3 text-xs leading-relaxed text-spotlight-text-muted">
                          {d.terms}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-spotlight-text-muted">
                        {d.expires_on ? (
                          <span>
                            Expires{" "}
                            {new Date(d.expires_on + "T12:00:00").toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : null}
                        {d.redeem_url ? (
                          <a
                            href={d.redeem_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-sm bg-spotlight-navy px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-spotlight-gold no-underline transition hover:bg-spotlight-teal"
                          >
                            Redeem
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {list.length === 0 ? (
          <p className="mt-16 text-center text-sm text-spotlight-text-muted">
            No active deals right now. Check back soon.
          </p>
        ) : null}
      </div>
    </div>
    </Paywall>
  );
}
