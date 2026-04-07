import type { Metadata } from "next";
import Link from "next/link";
import {
  DEFAULT_CONTACT_EMAIL,
  FOUNDERS,
  formatPhoneDisplay,
  phoneTelHref,
} from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Contact | LCSpotlight",
  description:
    "Reach the LCSpotlight team — co-founders Brennen Studenc and Jacob Weaver.",
};

export const revalidate = 300;

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-14 min-[601px]:px-10 min-[601px]:py-20">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
        LCSpotlight
      </p>
      <h1 className="font-serif text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight text-spotlight-navy">
        Contact <em className="font-normal italic text-spotlight-teal">us</em>
      </h1>
      <p className="mt-4 text-sm font-light leading-relaxed text-spotlight-text-mid">
        Questions about coverage, partnerships, or the site? Reach either of us directly.
      </p>

      <ul className="mt-10 grid list-none gap-6 p-0 min-[500px]:grid-cols-2">
        {FOUNDERS.map((f) => (
          <li
            key={f.email}
            className="rounded border border-spotlight-navy/[0.08] bg-white p-6 shadow-sm"
          >
            <p className="font-serif text-lg font-semibold text-spotlight-navy">{f.name}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-spotlight-teal/70">
              {f.title}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm font-light text-spotlight-text-mid">
              <a
                href={`mailto:${f.email}`}
                className="text-spotlight-teal no-underline transition-colors hover:underline"
              >
                {f.email}
              </a>
              <a
                href={phoneTelHref(f.phoneDigits)}
                className="text-spotlight-navy/80 no-underline transition-colors hover:text-spotlight-teal"
              >
                {formatPhoneDisplay(f.phoneDigits)}
              </a>
            </div>
          </li>
        ))}
      </ul>

      {DEFAULT_CONTACT_EMAIL ? (
        <p className="mt-10 rounded border border-spotlight-navy/[0.06] bg-spotlight-cream/40 px-5 py-4 text-center text-sm font-light text-spotlight-text-mid">
          General inquiries:{" "}
          <a
            href={`mailto:${DEFAULT_CONTACT_EMAIL}`}
            className="font-normal text-spotlight-teal no-underline hover:underline"
          >
            {DEFAULT_CONTACT_EMAIL}
          </a>
        </p>
      ) : null}

      <p className="mt-10 text-center text-xs text-spotlight-text-muted">
        <Link href="/" className="text-spotlight-teal no-underline hover:underline">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
