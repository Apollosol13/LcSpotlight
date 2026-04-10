import Link from "next/link";
import EventCalendar from "@/components/EventCalendar";

export const revalidate = 300;

export default function EventsPage() {
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
  );
}
