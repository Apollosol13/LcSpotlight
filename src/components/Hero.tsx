import Link from "next/link";

function editionLabel() {
  const d = new Date();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `Daily edition · ${month} ${year}`.toUpperCase();
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-spotlight-navy px-5 pb-16 pt-[4.5rem] min-[601px]:px-10 min-[601px]:pb-20 min-[601px]:pt-24">
      <div
        className="pointer-events-none absolute -bottom-20 -right-12 hidden size-[min(72vw,320px)] rounded-full border border-white/[0.06] min-[901px]:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-6 right-10 hidden size-[200px] rounded-full border border-white/[0.045] min-[901px]:block"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[1200px] gap-12 min-[901px]:grid-cols-[1fr_min(380px,100%)] min-[901px]:items-start min-[901px]:gap-14">
        <div>
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.22em] text-spotlight-gold">
            {editionLabel()}
          </p>
          <h1 className="text-balance">
            <span className="block font-serif text-[clamp(2.35rem,6.2vw,3.85rem)] font-semibold uppercase tracking-[0.05em] leading-[1.02] text-white">
              Lowcountry
            </span>
            <span className="mt-2 block font-serif text-[clamp(1.85rem,4.8vw,3rem)] font-normal italic leading-[1.08] text-spotlight-gold min-[601px]:mt-3">
              Spotlight
            </span>
          </h1>
          <p className="mb-10 mt-8 max-w-[28rem] text-[15px] font-light leading-[1.75] text-[#9cb0c4]">
            Events, new openings, things to do, and what&apos;s happening across
            Hilton Head Island — all in one place, updated daily.
          </p>
          <div className="mb-12 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-block rounded-[2px] bg-spotlight-gold px-7 py-[13px] text-[13px] font-medium uppercase tracking-[0.5px] text-spotlight-navy transition-colors hover:bg-spotlight-gold-light"
            >
              Explore Events
            </Link>
            <button
              type="button"
              className="rounded-[2px] border border-white/25 bg-transparent px-7 py-[13px] text-[13px] font-normal uppercase tracking-[0.5px] text-white/85 transition-colors hover:border-spotlight-gold hover:text-spotlight-gold"
            >
              Get the Newsletter
            </button>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/35">
            Hilton Head · Bluffton · Beaufort · Savannah
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/real-estate"
            className="group relative overflow-hidden rounded border border-white/10 bg-spotlight-teal p-7 no-underline transition hover:border-spotlight-gold/35 min-[901px]:p-8"
          >
            <span className="absolute right-5 top-5 text-lg leading-none text-white/30 transition group-hover:text-spotlight-gold">
              ↗
            </span>
            <p className="mb-4 pr-10 text-[10px] font-medium uppercase tracking-[0.2em] text-spotlight-gold">
              Market snapshot
            </p>
            <p className="font-serif text-[1.35rem] font-normal leading-snug text-white min-[901px]:text-[1.5rem]">
              HHI median hits{" "}
              <span className="text-spotlight-gold">$748K</span> — up 4.2%
              year over year.
            </p>
            <p className="mt-4 text-xs font-light text-white/50">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              · Real estate
            </p>
          </Link>

          <Link
            href="/events"
            className="group relative rounded border border-[rgba(17,34,80,0.12)] bg-white p-7 no-underline shadow-[0_1px_0_rgba(17,34,80,0.04)] transition hover:border-spotlight-gold/35 min-[901px]:p-8"
          >
            <span className="absolute right-5 top-5 text-lg leading-none text-spotlight-text-muted transition group-hover:text-spotlight-gold">
              ↗
            </span>
            <p className="mb-3 pr-10 text-[10px] font-medium uppercase tracking-[0.2em] text-spotlight-text-muted">
              Featured event
            </p>
            <p className="font-serif text-[1.35rem] font-normal leading-snug text-spotlight-navy min-[901px]:text-[1.45rem]">
              Jazz &amp; Wine Festival returns to Shelter Cove Marina.
            </p>
            <p className="mt-3 text-xs text-spotlight-text-muted">
              April 5 · From $45
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
