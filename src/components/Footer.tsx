import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Upcoming Events", href: "/events" },
      { label: "New Openings", href: "/openings" },
      { label: "Things To Do", href: "/things-to-do" },
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
      { label: "Submit a Tip", href: "#" },
    ],
  },
  {
    title: "Areas Covered",
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
    <footer className="border-t border-spotlight-gold/25 bg-spotlight-navy px-5 pb-8 pt-[60px] min-[601px]:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 grid gap-10 min-[601px]:grid-cols-2 min-[901px]:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand col */}
          <div>
            <p className="mb-4 font-display text-[32px] tracking-[3px] text-spotlight-gold">
              SPOTLIGHT
            </p>
            <p className="max-w-[240px] text-[13px] font-light leading-[1.7] text-white/40">
              Your daily guide to life on Hilton Head Island, Bluffton,
              Beaufort, and Savannah.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-gold">
                {col.title}
              </p>
              <ul className="list-none space-y-2.5 p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] font-light text-white/45 no-underline transition-colors hover:text-spotlight-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.07] pt-6 min-[601px]:flex-row">
          <p className="text-xs text-white/25">
            © 2026 Spotlight Lowcountry. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[1px] text-white/25">
            Hilton Head · Bluffton · Beaufort · Savannah
          </p>
        </div>
      </div>
    </footer>
  );
}
