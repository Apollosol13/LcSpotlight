import Link from "next/link";
import EventCalendar from "@/components/EventCalendar";
import { Paywall } from "@/components/Paywall";

export const revalidate = 300;

export default function EventsPage() {
  return (
    <Paywall feature="the full events calendar">
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-10 min-[601px]:px-10 min-[601px]:py-16">
        <div className="mb-8 flex flex-col gap-4 border-b border-[rgba(12,27,51,0.1)] pb-4 min-[640px]:mb-10 min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between min-[640px]:gap-6">
          <div>
            <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[2px] text-spotlight-text-muted min-[640px]:mb-2 min-[640px]:text-[10px] min-[640px]:tracking-[3px]">
              What&apos;s on
            </p>
            <h1 className="font-serif text-[clamp(1.75rem,6vw,2.25rem)] font-normal leading-tight text-spotlight-navy">
              Upcoming <em className="italic text-spotlight-gold">Events</em>
            </h1>
            <p className="mt-2 text-[13px] text-spotlight-text-mid min-[640px]:mt-3 min-[640px]:text-sm">
              Events across the Lowcountry.
            </p>
          </div>
          <Link
            href="/events/publish"
            className="inline-flex w-fit shrink-0 items-center justify-center rounded-lg bg-spotlight-navy px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-gold no-underline transition-colors hover:bg-spotlight-teal"
          >
            Publish an event
          </Link>
        </div>

        <EventCalendar />

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline hover:underline"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>
    </Paywall>
  );
}
