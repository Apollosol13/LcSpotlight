import type { Metadata } from "next";
import Link from "next/link";
import { SubmitStoryForm } from "./SubmitStoryForm";

export const metadata: Metadata = {
  title: "Submit a Story | LCSpotlight",
  description:
    "Pitch a story, event, or tip for the Lowcountry. Our team reviews every submission.",
};

export default function SubmitStoryPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-5 py-14 min-[601px]:px-10 min-[601px]:py-20">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
        Community
      </p>
      <h1 className="font-serif text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight text-spotlight-navy">
        Submit a <em className="font-normal italic text-spotlight-teal">story</em>
      </h1>
      <p className="mt-4 text-sm font-light leading-relaxed text-spotlight-text-mid">
        Share a tip, event, business opening, or human-interest idea. We read every pitch;
        we may follow up by email. Submission does not guarantee coverage.
      </p>

      <div className="mt-10 rounded border border-spotlight-navy/[0.08] bg-white p-6 min-[601px]:p-8">
        <SubmitStoryForm />
      </div>

      <p className="mt-10 text-center text-xs text-spotlight-text-muted">
        <Link href="/" className="text-spotlight-teal no-underline hover:underline">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
