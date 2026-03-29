import type { Metadata } from "next";
import Link from "next/link";
import { PublishEventForm } from "./PublishEventForm";

export const metadata: Metadata = {
  title: "Publish an Event | LCSpotlight",
  description:
    "Submit your organization’s Lowcountry event for review. Approved events appear on the calendar.",
};

export default function PublishEventPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-5 py-14 min-[601px]:px-10 min-[601px]:py-20">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
        Calendar
      </p>
      <h1 className="font-serif text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight text-spotlight-navy">
        Publish an <em className="font-normal italic text-spotlight-teal">event</em>
      </h1>
      <p className="mt-4 text-sm font-light leading-relaxed text-spotlight-text-mid">
        Organizations and venues can submit events for the public calendar. Submissions are
        reviewed before they go live; we may follow up by email.
      </p>

      <div className="mt-10 rounded border border-spotlight-navy/[0.08] bg-white p-6 min-[601px]:p-8">
        <PublishEventForm />
      </div>

      <p className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-spotlight-text-muted">
        <Link href="/events" className="text-spotlight-teal no-underline hover:underline">
          ← Back to events
        </Link>
        <span className="hidden text-spotlight-text-muted/40 min-[400px]:inline">·</span>
        <Link href="/" className="text-spotlight-teal no-underline hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
