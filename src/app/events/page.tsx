import Link from "next/link";
import { eventHeroStyle } from "@/lib/event-hero-style";
import { upcomingEventsQuery } from "@/lib/events/fetch-upcoming-events";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

export default async function EventsPage() {
  const { data: events } = await upcomingEventsQuery(supabase);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-16 min-[601px]:px-10">
      <div className="mb-10 flex flex-col gap-6 border-b border-[rgba(12,27,51,0.1)] pb-4 min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
            Calendar
          </p>
          <h1 className="font-serif text-3xl font-normal text-spotlight-navy">
            Upcoming <em className="italic text-spotlight-gold">Events</em>
          </h1>
          <p className="mt-3 text-sm text-spotlight-text-mid">
            Events across the Lowcountry.
          </p>
        </div>
        <Link
          href="/events/publish"
          className="inline-flex w-fit shrink-0 items-center justify-center bg-spotlight-navy px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-gold no-underline transition-colors hover:bg-spotlight-teal"
        >
          Publish an event
        </Link>
      </div>

      <div className="grid gap-6 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {(events ?? []).map((e) => {
          const listingUrl = e.source_url?.trim();
          const shellClass =
            "overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(12,27,51,0.1)]";

          const body = (
            <>
              <div
                className="relative flex h-[160px] items-center justify-center overflow-hidden"
                style={eventHeroStyle(e.image_url, e.category, e.bg ?? "#1E3A5F")}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,27,51,0.45)] to-transparent" />
                <div className="absolute left-3.5 top-3.5 z-[1] rounded-[2px] bg-spotlight-gold px-2.5 py-1.5 text-center leading-tight text-spotlight-navy">
                  <span className="block font-serif text-[22px] font-semibold">{e.day}</span>
                  <span className="block text-[10px] font-medium uppercase tracking-[1px]">{e.month}</span>
                </div>
                {e.category && (
                  <span className="absolute right-3.5 top-3.5 z-[1] rounded-[2px] bg-[rgba(12,27,51,0.8)] px-2.5 py-1 text-[10px] uppercase tracking-[1px] text-white/90">
                    {e.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="mb-2 font-serif text-lg font-normal leading-tight text-spotlight-navy">
                  {e.name}
                </h2>
                <div className="mb-3 flex flex-wrap gap-4 text-xs text-spotlight-text-muted">
                  {e.location && <span>{e.location}</span>}
                  {e.time && <span>{e.time}</span>}
                </div>
                {e.price && (
                  <p className="text-[13px] font-medium text-spotlight-teal">{e.price}</p>
                )}
                {listingUrl && (
                  <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-spotlight-gold">
                    {e.cta ?? "More info"} →
                  </p>
                )}
              </div>
            </>
          );

          return listingUrl ? (
            <a
              key={e.id}
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${shellClass} block text-inherit no-underline`}
              aria-label={`${e.name}: ${e.cta ?? "open listing"}`}
            >
              {body}
            </a>
          ) : (
            <div key={e.id} className={shellClass}>
              {body}
            </div>
          );
        })}
      </div>

      {(!events || events.length === 0) && (
        <p className="py-20 text-center text-sm text-spotlight-text-muted">
          No events yet. Check back soon.
        </p>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline hover:underline"
        >
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
