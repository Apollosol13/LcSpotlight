import type { ReactNode } from "react";
import Link from "next/link";
import { upcomingEventsQuery } from "@/lib/events/fetch-upcoming-events";
import { supabase } from "@/lib/supabase";

function EventListingLink({
  sourceUrl,
  className,
  children,
}: {
  sourceUrl?: string | null;
  className: string;
  children: ReactNode;
}) {
  const url = sourceUrl?.trim();
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href="/events" className={className}>
      {children}
    </Link>
  );
}

const CATEGORY_ACCENT: Record<string, string> = {
  "live music": "bg-purple-500",
  comedy: "bg-rose-500",
  theatre: "bg-pink-500",
  art: "bg-amber-500",
  exhibit: "bg-amber-400",
  golf: "bg-green-500",
  educational: "bg-sky-500",
  tour: "bg-teal-500",
  outdoors: "bg-emerald-500",
  entertainment: "bg-indigo-500",
  restaurant: "bg-orange-500",
  "farmers market": "bg-lime-500",
  shopping: "bg-fuchsia-500",
  trivia: "bg-violet-500",
  magic: "bg-red-500",
  sports: "bg-cyan-500",
  classes: "bg-blue-500",
  fundraiser: "bg-rose-400",
  benefit: "bg-pink-400",
  community: "bg-spotlight-teal",
};

function accentDot(category: string | null): string {
  if (!category) return "bg-spotlight-gold";
  const key = category.toLowerCase().replace(/-\d+$/, "").replace(/-/g, " ");
  return CATEGORY_ACCENT[key] ?? "bg-spotlight-gold";
}

export async function EventsSection() {
  const { data: events } = await upcomingEventsQuery(supabase, { limit: 6 });
  const list = events ?? [];

  return (
    <section className="overflow-hidden bg-spotlight-cream px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col gap-4 min-[601px]:mb-10 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
              What&apos;s on
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
              Upcoming <em className="font-normal italic text-spotlight-teal">Events</em>
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
          >
            View all events →
          </Link>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-spotlight-text-muted">No upcoming events yet.</p>
        ) : (
          <div className="grid gap-3 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
            {list.map((e) => (
              <EventListingLink
                key={e.id}
                sourceUrl={e.source_url}
                className="group flex min-w-0 gap-4 overflow-hidden rounded-lg border border-[rgba(12,27,51,0.06)] bg-white p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-spotlight-gold/30 hover:shadow-[0_8px_30px_rgba(12,27,51,0.08)]"
              >
                {/* Date badge */}
                <div className="flex h-[56px] w-[56px] shrink-0 flex-col items-center justify-center rounded-lg bg-spotlight-navy text-center">
                  <span className="font-serif text-[22px] font-bold leading-none text-spotlight-gold">
                    {e.day}
                  </span>
                  <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.8px] text-spotlight-cream/50">
                    {e.month}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 truncate font-serif text-[16px] font-semibold leading-snug text-spotlight-navy group-hover:text-spotlight-teal">
                    {e.name}
                  </h3>
                  <div className="mb-1.5 flex items-center gap-x-2 text-[11px] text-spotlight-text-muted">
                    {e.time && <span className="shrink-0">{e.time}</span>}
                    {e.location && (
                      <>
                        {e.time && <span className="shrink-0 text-spotlight-sand">·</span>}
                        <span className="truncate">{e.location}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {e.category && (
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.5px] text-spotlight-text-muted/70">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${accentDot(e.category)}`} />
                        {e.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex shrink-0 items-center">
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-spotlight-text-muted/30 transition group-hover:translate-x-0.5 group-hover:text-spotlight-gold"
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </EventListingLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
