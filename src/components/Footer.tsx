import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Upcoming Events", href: "/events" },
      { label: "New Openings", href: "/openings" },
      { label: "Things To Do", href: "/things-to-do" },
      { label: "Deals", href: "/deals" },
      { label: "Real Estate", href: "/real-estate" },
      { label: "Buy Tickets", href: "/ticketing" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Submit an Event", href: "#" },
      { label: "List a Business", href: "#" },
      { label: "Advertise", href: "#" },
      { label: "Submit a Story", href: "/submit-story" },
      { label: "Business portal", href: "/login" },
    ],
  },
  {
    title: "Areas",
    links: [
      { label: "Hilton Head Island", href: "#" },
      { label: "Bluffton", href: "#" },
      { label: "Beaufort", href: "#" },
      { label: "Savannah, GA", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-spotlight-gold/10 bg-spotlight-navy px-5 pb-7 pt-14 min-[601px]:px-12 min-[601px]:pb-7 min-[601px]:pt-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 grid gap-10 min-[901px]:grid-cols-[1.6fr_1fr_1fr_1fr] min-[901px]:gap-12">
          <div>
            <div className="mb-3 font-serif text-[28px] font-bold uppercase tracking-[0.08em] text-spotlight-gold">
              Spotlight
            </div>
            <p className="max-w-[200px] text-xs font-light leading-[1.8] tracking-[0.03em] text-spotlight-cream/30">
              Your daily guide to life on Hilton Head Island, Bluffton, Beaufort, and Savannah.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-gold/55">
                {col.title}
              </p>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-xs font-light tracking-[0.04em] text-spotlight-cream/35 no-underline transition-colors hover:text-spotlight-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-spotlight-cream/[0.06] pt-6 min-[601px]:flex-row min-[601px]:items-center">
          <p className="text-[11px] font-light tracking-[0.06em] text-spotlight-cream/20">
            © 2026 Spotlight Lowcountry. All rights reserved.
          </p>
          <p className="text-[11px] font-light tracking-[0.08em] text-spotlight-cream/20">
            Hilton Head
            <span className="mx-2 text-spotlight-gold/30">·</span>
            Bluffton
            <span className="mx-2 text-spotlight-gold/30">·</span>
            Beaufort
            <span className="mx-2 text-spotlight-gold/30">·</span>
            Savannah
          </p>
        </div>
      </div>
    </footer>
  );
}
