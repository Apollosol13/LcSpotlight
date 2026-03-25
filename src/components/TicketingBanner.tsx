import Link from "next/link";

const perks = [
  "Instant e-tickets delivered to your inbox",
  "Mobile-friendly — works at the gate",
  "No booking fees or hidden charges",
  "Local events only — curated for the Lowcountry",
];

export function TicketingBanner() {
  return (
    <section className="bg-spotlight-teal px-5 py-16 min-[601px]:px-12 min-[601px]:py-[88px]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 min-[901px]:grid-cols-2 min-[901px]:gap-20">
        <div>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-gold/65">
            No fees. No hassle.
          </p>
          <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] font-bold leading-none text-spotlight-cream">
            Buy tickets in <em className="font-normal italic text-spotlight-gold">seconds</em>
          </h2>
          <ul className="mt-8 flex list-none flex-col gap-[18px] p-0">
            {perks.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3.5 text-[13px] font-light leading-[1.7] tracking-[0.02em] text-spotlight-cream/60"
              >
                <span
                  className="mt-2 size-[5px] shrink-0 rounded-full bg-spotlight-gold"
                  aria-hidden
                />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-serif text-[clamp(4rem,15vw,7.5rem)] font-black leading-none tracking-[-0.04em] text-spotlight-cream/[0.05]">
            40+
          </p>
          <p className="-mt-4 mb-8 text-sm font-light leading-[1.8] tracking-[0.02em] text-spotlight-cream/50">
            Over 40 events this month across Hilton Head, Bluffton, Beaufort, and Savannah.
            Browse and book directly with the venue.
          </p>
          <Link
            href="/events"
            className="inline-block bg-spotlight-gold px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-spotlight-navy no-underline transition-colors hover:bg-spotlight-gold-dark"
          >
            Browse all events
          </Link>
        </div>
      </div>
    </section>
  );
}
