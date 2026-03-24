import Link from "next/link";

const sidebarItems = [
  { icon: "🎓", title: "Beaufort County Schools Expand Arts Program for Fall 2026", meta: "Education · March 21" },
  { icon: "🚴", title: "New Bike Lane Extension Approved from Coligny to Palmetto Dunes", meta: "Infrastructure · March 20" },
  { icon: "🌺", title: "Bluffton's Spring Garden Tour Returns with 18 Stops", meta: "Community · March 19" },
  { icon: "🐢", title: "Sea Turtle Nesting Season Begins — Beach Guidelines Updated", meta: "Wildlife · March 18" },
];

export function NewsSection() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-16 min-[601px]:px-10">
      <div className="mb-9 flex items-baseline justify-between border-b border-[rgba(12,27,51,0.1)] pb-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
            Community
          </p>
          <h2 className="font-serif text-[32px] font-normal text-spotlight-navy">
            News &amp; <em className="italic text-spotlight-gold">Updates</em>
          </h2>
        </div>
        <Link
          href="/news"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline transition-colors hover:underline"
        >
          All Stories →
        </Link>
      </div>

      <div className="grid gap-8 min-[901px]:grid-cols-[2fr_1fr]">
        {/* Featured */}
        <div className="cursor-pointer overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white transition-shadow hover:shadow-[0_8px_32px_rgba(12,27,51,0.08)]">
          <div className="relative flex h-[280px] items-center justify-center overflow-hidden bg-[#14324A]">
            <span className="text-[60px] opacity-15">🌊</span>
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,27,51,0.8)] to-transparent" />
          </div>
          <div className="p-7">
            <span className="mb-2.5 inline-block border-b border-[rgba(201,168,76,0.3)] pb-1 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-gold">
              Environment
            </span>
            <h3 className="mb-3 font-serif text-[26px] font-normal leading-[1.3] text-spotlight-navy">
              New Shoreline Restoration Project Launches Across Hilton
              Head&apos;s North End
            </h3>
            <p className="mb-4 text-sm font-light leading-[1.7] text-spotlight-text-mid">
              A coalition of local environmental groups and the Town of Hilton
              Head Island has begun a multi-year dune restoration initiative,
              planting sea oats and native grasses across 3.2 miles of shoreline
              to protect against seasonal erosion.
            </p>
            <div className="flex gap-4 text-xs text-spotlight-text-muted">
              <span>By Town of HHI</span>
              <span>March 22, 2026</span>
              <span>4 min read</span>
            </div>
          </div>
        </div>

        {/* Sidebar stack */}
        <div className="flex flex-col gap-4">
          {sidebarItems.map((item) => (
            <div
              key={item.title}
              className="flex cursor-pointer items-start gap-4 rounded border border-[rgba(12,27,51,0.1)] bg-white p-5 transition-colors hover:border-spotlight-gold"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-spotlight-sand text-lg">
                {item.icon}
              </div>
              <div>
                <h4 className="mb-1.5 font-serif text-[15px] font-normal leading-[1.4] text-spotlight-navy">
                  {item.title}
                </h4>
                <p className="text-[11px] text-spotlight-text-muted">
                  {item.meta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
