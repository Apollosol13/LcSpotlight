import Image from "next/image";
import Link from "next/link";

function editionLabel() {
  const d = new Date();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `Daily edition · ${month} ${year}`;
}

type HeroProps = {
  /** Hilton Head median list price display, e.g. "$612K" — from Supabase live stats */
  hhiMedianDisplay?: string | null;
  /** Active listing count for HHI */
  hhiActiveListingsDisplay?: string | null;
};

export function Hero({ hhiMedianDisplay, hhiActiveListingsDisplay }: HeroProps) {
  return (
    <section className="grid min-h-[min(88vh,920px)] grid-cols-1 lg:grid-cols-2">
      {/* Left — photo + neutral darken for text contrast (no navy cast) */}
      <div className="relative flex min-h-[min(50vh,520px)] flex-col justify-between overflow-hidden bg-black px-8 pb-12 pt-14 min-[601px]:min-h-0 min-[601px]:px-12 min-[601px]:pb-16 min-[601px]:pt-[4.5rem]">
        <Image
          src="/lc-spotlight-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1023px) 100vw, 50vw"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-black/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 z-[1] size-[200px] rounded-full border border-spotlight-gold/[0.08]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-[5rem] -right-[5rem] z-[1] size-[320px] rounded-full border border-spotlight-gold/[0.12]"
          aria-hidden
        />

        <p className="relative z-[2] inline-flex items-center gap-2.5 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-gold/70">
          <span className="h-px w-6 bg-spotlight-gold/40" aria-hidden />
          {editionLabel()}
        </p>

        <div className="relative z-[2] flex flex-1 flex-col justify-center py-10 min-[601px]:py-12">
          <h1 className="mb-8 min-[601px]:mb-8">
            <span className="block font-serif text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[0.92] tracking-[0.02em] text-white">
              Lowcountry
            </span>
            <span className="mt-2 block font-serif text-[clamp(2.15rem,6.5vw,3.5rem)] font-normal italic leading-[1.05] tracking-[0.02em] text-spotlight-gold min-[601px]:mt-3">
              Spotlight
            </span>
          </h1>
          <p className="mb-9 max-w-[360px] text-[13px] font-light leading-[1.8] tracking-[0.03em] text-spotlight-cream/50">
            Events, new openings, things to do, and what&apos;s happening across
            Hilton Head Island — all in one place, updated daily.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-block bg-spotlight-gold px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-spotlight-navy no-underline transition-colors hover:bg-spotlight-gold-dark"
            >
              Explore Events
            </Link>
            <a
              href="#weekly-digest"
              className="inline-block border border-spotlight-cream/15 px-7 py-3.5 text-[10px] font-normal uppercase tracking-[0.18em] text-spotlight-cream/60 no-underline transition-colors hover:border-spotlight-gold hover:text-spotlight-gold"
            >
              Newsletter
            </a>
          </div>
        </div>

        <p className="relative z-[2] flex flex-wrap gap-5 text-[9px] font-normal uppercase tracking-[0.2em] text-spotlight-gold">
          <span>Hilton Head</span>
          <span>Bluffton</span>
          <span>Beaufort</span>
          <span>Savannah</span>
        </p>
      </div>

      {/* Right — shell + stacked feature cards */}
      <div className="grid min-h-0 grid-rows-2 gap-0.5 bg-spotlight-sand">
        <Link
          href="/real-estate"
          className="group relative block h-full min-h-[220px] overflow-hidden no-underline lg:min-h-0"
        >
          <Image
            src="/hero-market-snapshot.jpg"
            alt="Screened porch overlooking Lowcountry water at sunset"
            fill
            className="object-cover transition-[filter,transform] duration-300 ease-out group-hover:brightness-[0.92]"
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/35 to-black/15"
            aria-hidden
          />
          <span className="absolute right-7 top-7 z-[2] text-lg font-light text-white/45 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70">
            →
          </span>
          <div className="absolute inset-x-0 bottom-0 z-[2] p-8 min-[601px]:p-8">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-spotlight-gold/90">
              Market snapshot
            </p>
            <p className="mb-3 font-serif text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.1] text-white">
              {hhiMedianDisplay ? (
                <>
                  Hilton Head median list price{" "}
                  <span className="text-spotlight-gold">{hhiMedianDisplay}</span>
                  {hhiActiveListingsDisplay ? (
                    <>
                      {" "}
                      · {hhiActiveListingsDisplay} active listings
                    </>
                  ) : null}
                  . From Redfin.
                </>
              ) : (
                <>
                  Market snapshot — median list price and active listings on{" "}
                  <span className="text-spotlight-gold">Real Estate</span>.
                </>
              )}
            </p>
            <p className="text-[11px] font-light tracking-[0.04em] text-white/65">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              · Real estate
            </p>
          </div>
        </Link>

        <Link
          href="/things-to-do"
          className="group relative block h-full min-h-[220px] overflow-hidden no-underline lg:min-h-0"
        >
          <Image
            src="/hero-featured-event.png"
            alt="Aerial view of a Lowcountry golf fairway at golden hour, with bunkers, water, and tree-lined holes"
            fill
            className="object-cover transition-[filter] duration-300 ease-out group-hover:brightness-[0.92]"
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/35 to-black/15"
            aria-hidden
          />
          <span className="absolute right-7 top-7 z-[2] text-lg font-light text-white/45 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70">
            →
          </span>
          <div className="absolute inset-x-0 bottom-0 z-[2] p-8 min-[601px]:p-8">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-spotlight-gold/90">
              Golf
            </p>
            <p className="mb-3 font-serif text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.1] text-white">
              Explore some of Hilton Head&apos;s Best Golf
            </p>
            <p className="text-[11px] font-light tracking-[0.04em] text-white/65">
              Resort courses, coastal views &amp; championship layouts
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
