"use client";

import { useState } from "react";
import Link from "next/link";

type Plan = "monthly" | "yearly";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<Plan>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-teal/60">
          Membership
        </p>
        <h1 className="mb-3 font-serif text-[clamp(2rem,6vw,3rem)] font-bold leading-tight text-spotlight-navy">
          Unlock the{" "}
          <em className="font-normal italic text-spotlight-teal">Lowcountry</em>
        </h1>
        <p className="mx-auto mb-12 max-w-md text-[14px] leading-relaxed text-spotlight-text-mid">
          Get full access to real estate listings, events, local deals, new
          openings, and ticketing across the Lowcountry.
        </p>

        {/* Plan toggle */}
        <div className="mx-auto mb-10 flex w-fit rounded-full border border-[rgba(12,27,51,0.12)] bg-white p-1">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`rounded-full px-6 py-2.5 text-[12px] font-medium transition ${
              plan === "monthly"
                ? "bg-spotlight-navy text-spotlight-gold shadow-sm"
                : "text-spotlight-text-mid hover:text-spotlight-navy"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPlan("yearly")}
            className={`rounded-full px-6 py-2.5 text-[12px] font-medium transition ${
              plan === "yearly"
                ? "bg-spotlight-navy text-spotlight-gold shadow-sm"
                : "text-spotlight-text-mid hover:text-spotlight-navy"
            }`}
          >
            Yearly
            <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              Save 17%
            </span>
          </button>
        </div>

        {/* Pricing card */}
        <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-[rgba(12,27,51,0.08)] bg-white shadow-[0_8px_40px_rgba(12,27,51,0.08)]">
          <div className="bg-gradient-to-br from-spotlight-navy to-[#1E3A6E] px-8 pb-6 pt-8 text-center">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[2px] text-spotlight-gold/80">
              {plan === "monthly" ? "Monthly" : "Annual"} membership
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-serif text-[48px] font-bold leading-none text-white">
                ${plan === "monthly" ? "10" : "100"}
              </span>
              <span className="text-[14px] text-white/50">
                /{plan === "monthly" ? "mo" : "yr"}
              </span>
            </div>
            {plan === "yearly" && (
              <p className="mt-2 text-[12px] text-white/40">
                $8.33/mo — saves $20/year
              </p>
            )}
          </div>

          <div className="px-8 pb-8 pt-6">
            {/* Features */}
            <ul className="mb-8 space-y-3 text-left text-[13px] text-spotlight-text-mid">
              {[
                "Real estate listings & market data",
                "Full events calendar",
                "Local deals & discounts",
                "New openings & businesses",
                "Event ticketing",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mt-0.5 shrink-0 text-spotlight-gold"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* Email + submit */}
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full rounded-lg border border-[rgba(12,27,51,0.12)] bg-spotlight-cream/40 px-4 py-3 text-[14px] text-spotlight-navy placeholder-spotlight-text-muted/50 outline-none transition focus:border-spotlight-gold focus:ring-2 focus:ring-spotlight-gold/20"
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-spotlight-navy py-3.5 text-[13px] font-semibold text-spotlight-gold transition hover:bg-spotlight-teal disabled:opacity-50"
              >
                {loading ? "Redirecting to checkout..." : "Subscribe now"}
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-spotlight-text-muted/60">
              Cancel anytime. Powered by Stripe.
            </p>
          </div>
        </div>

        {/* Already a member */}
        <p className="mt-8 text-[13px] text-spotlight-text-muted">
          Already a member?{" "}
          <Link
            href="/member/login"
            className="font-medium text-spotlight-navy underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
