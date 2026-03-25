import Link from "next/link";

const stats = [
  { label: "HHI Median Price", value: "$748K", change: "+4.2%", up: true },
  { label: "Bluffton Median", value: "$465K", change: "+2.8%", up: true },
  { label: "Days on Market", value: "38", change: "−5", up: false },
  { label: "New Listings (HHI)", value: "142", change: "+12", up: true },
];

export function Hero() {
  return (
    <section className="overflow-hidden bg-spotlight-navy px-5 pb-[70px] pt-20 min-[601px]:px-10">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 min-[901px]:grid-cols-[1fr_380px] min-[901px]:gap-[60px]">
        {/* Left */}
        <div>
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[3px] text-spotlight-gold">
            Hilton Head Island · Bluffton · Beaufort · Savannah
          </p>
          <h1 className="mb-5 font-serif text-[40px] font-normal leading-[1.1] text-white min-[601px]:text-[64px]">
            Your <em className="italic text-spotlight-gold">local guide</em>
            <br />
            to the Lowcountry
          </h1>
          <p className="mb-9 max-w-[480px] text-base font-light leading-[1.7] text-white/60">
            Events, new openings, things to do, and what&apos;s happening across
            the Lowcountry — all in one place, updated daily.
          </p>
          <div className="flex gap-3">
            <Link
              href="/events"
              className="inline-block rounded-[2px] bg-spotlight-gold px-7 py-[13px] text-[13px] font-medium uppercase tracking-[0.5px] text-spotlight-navy transition-colors hover:bg-spotlight-gold-light"
            >
              Explore Events
            </Link>
            <button
              type="button"
              className="rounded-[2px] border border-white/20 bg-transparent px-7 py-[13px] text-[13px] font-normal uppercase tracking-[0.5px] text-white/80 transition-colors hover:border-spotlight-gold hover:text-spotlight-gold"
            >
              Get the Newsletter
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden rounded border border-spotlight-gold/25 bg-white/5 p-8 min-[901px]:block">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[2px] text-spotlight-gold">
            Market Snapshot — March 2026
          </p>
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between border-b border-white/[0.06] py-3.5 last:border-b-0"
            >
              <span className="text-[13px] font-light text-white/60">
                {s.label}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-[22px] font-normal text-white">
                  {s.value}
                </span>
                <span
                  className={`rounded-[2px] px-2 py-0.5 text-[11px] font-medium tracking-[0.5px] ${
                    s.up
                      ? "bg-spotlight-teal/40 text-[#b8c9e0]"
                      : "bg-spotlight-coral/20 text-spotlight-coral"
                  }`}
                >
                  {s.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
