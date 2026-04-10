import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-green-600"
        >
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mt-6 font-serif text-[clamp(1.5rem,5vw,2.25rem)] font-bold text-spotlight-navy">
        Welcome to LCSpotlight!
      </h1>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-spotlight-text-mid">
        Your membership is active. Check your email for a login link to access
        all premium content — real estate, events, deals, and more.
      </p>

      <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
        <Link
          href="/member/login"
          className="inline-flex items-center justify-center rounded-lg bg-spotlight-navy px-6 py-3 text-[12px] font-semibold uppercase tracking-[1px] text-spotlight-gold no-underline transition hover:bg-spotlight-teal"
        >
          Log in
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-[rgba(12,27,51,0.12)] bg-white px-6 py-3 text-[12px] font-medium uppercase tracking-[1px] text-spotlight-navy no-underline transition hover:border-spotlight-navy/30"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
