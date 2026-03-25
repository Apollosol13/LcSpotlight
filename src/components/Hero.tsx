import Link from "next/link";

function editionLabel() {
  const d = new Date();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `Daily edition · ${month} ${year}`;
}

export function Hero() {
  return (
    <section className="grid min-h-[min(88vh,920px)] grid-cols-1 lg:grid-cols-2">
      {/* Left — royal panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-spotlight-navy px-8 pb-12 pt-14 min-[601px]:px-12 min-[601px]:pb-16 min-[601px]:pt-[4.5rem]">
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 size-[200px] rounded-full border border-spotlight-gold/[0.08]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-[5rem] -right-[5rem] size-[320px] rounded-full border border-spotlight-gold/[0.12]"
          aria-hidden
        />

        <p className="relative z-[1] inline-flex items-center gap-2.5 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-gold/70">
          <span className="h-px w-6 bg-spotlight-gold/40" aria-hidden />
          {editionLabel()}
        </p>

        <div className="relative z-[1] flex flex-1 flex-col justify-center py-10 min-[601px]:py-12">
          <h1 className="mb-8 font-serif text-[clamp(3rem,12vw,5.125rem)] font-black uppercase leading-[0.92] tracking-[-0.02em] text-spotlight-cream min-[601px]:mb-8">
            <span className="block">Low</span>
            <span className="block">coun</span>
            <em className="block text-[clamp(2.75rem,10vw,4.5rem)] font-normal italic normal-case tracking-[0.01em] text-spotlight-gold">
              try
            </em>
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

        <p className="relative z-[1] flex flex-wrap gap-5 text-[9px] font-normal uppercase tracking-[0.2em] text-spotlight-cream/25">
          <span>Hilton Head</span>
          <span>Bluffton</span>
          <span>Beaufort</span>
          <span>Savannah</span>
        </p>
      </div>

      {/* Right — shell + stacked feature cards */}
      <div className="grid grid-rows-2 gap-0.5 bg-spotlight-sand">
        <Link
          href="/real-estate"
          className="group relative flex flex-col justify-end overflow-hidden bg-spotlight-teal p-8 no-underline transition-colors hover:bg-[#2a3d66] min-[601px]:p-8"
        >
          <span className="absolute right-7 top-7 text-xl text-spotlight-gold/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
            ↗
          </span>
          <div>
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-spotlight-gold/75">
              Market snapshot
            </p>
            <p className="mb-3 font-serif text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.1] text-spotlight-cream">
              HHI median hits{" "}
              <span className="text-spotlight-gold">$748K</span> — up 4.2%
              year over year.
            </p>
            <p className="text-[11px] font-light tracking-[0.04em] text-spotlight-cream/50">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              · Real estate
            </p>
          </div>
        </Link>

        <Link
          href="/events"
          className="group relative flex flex-col justify-end overflow-hidden bg-white p-8 no-underline transition-colors hover:bg-spotlight-cream min-[601px]:p-8"
        >
          <span className="absolute right-7 top-7 text-xl text-spotlight-teal/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
            ↗
          </span>
          <div>
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-spotlight-teal">
              Featured event
            </p>
            <p className="mb-3 font-serif text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.1] text-spotlight-navy">
              Jazz &amp; Wine Festival returns to Shelter Cove Marina.
            </p>
            <p className="text-[11px] font-light tracking-[0.04em] text-spotlight-teal/60">
              April 5 · From $45
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
