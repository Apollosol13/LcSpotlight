import Link from "next/link";

export function TicketingBanner() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 min-[601px]:px-10">
      <div className="mt-12 grid items-center gap-10 rounded border border-[rgba(12,27,51,0.1)] bg-spotlight-sand p-10 min-[901px]:grid-cols-[1fr_auto]">
        <div>
          <h2 className="mb-2 font-serif text-[28px] font-normal text-spotlight-navy">
            Buy tickets to local events in seconds
          </h2>
          <p className="text-sm font-light text-spotlight-text-muted">
            No service fees. No hidden charges. Direct to the venue. Built for
            the Lowcountry.
          </p>
          <div className="mt-5 flex flex-wrap gap-6">
            {[
              "Instant e-tickets",
              "Mobile-friendly",
              "No booking fees",
              "Local events only",
            ].map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 text-[13px] text-spotlight-text-mid"
              >
                <span className="font-medium text-spotlight-teal">✓</span> {f}
              </span>
            ))}
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/events"
            className="inline-block rounded-[2px] bg-spotlight-gold px-9 py-4 text-sm font-medium uppercase tracking-[0.5px] text-spotlight-navy transition-colors hover:bg-spotlight-gold-light"
          >
            Browse All Events
          </Link>
          <p className="mt-2.5 text-xs text-spotlight-text-muted">
            Over 40 events this month
          </p>
        </div>
      </div>
    </section>
  );
}
