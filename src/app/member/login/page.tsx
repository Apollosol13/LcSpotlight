"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/member`,
      },
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-spotlight-gold/20">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-spotlight-gold"
          >
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="22,6 12,13 2,6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-serif text-2xl font-bold text-spotlight-navy">
          Check your email
        </h1>
        <p className="mt-3 max-w-sm text-[14px] text-spotlight-text-mid">
          We sent a login link to <strong className="text-spotlight-navy">{email}</strong>.
          Click the link in your inbox to sign in.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-[12px] font-medium text-spotlight-teal hover:underline"
        >
          Try a different email
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-spotlight-navy">
            Member login
          </h1>
          <p className="mt-2 text-[13px] text-spotlight-text-mid">
            Enter your email and we&apos;ll send you a login link.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-[0_4px_24px_rgba(12,27,51,0.06)]"
        >
          <div>
            <label
              htmlFor="member-email"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[1.5px] text-spotlight-text-muted"
            >
              Email
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@email.com"
              className="w-full rounded-lg border border-[rgba(12,27,51,0.12)] px-4 py-3 text-[14px] text-spotlight-navy outline-none transition focus:border-spotlight-gold focus:ring-2 focus:ring-spotlight-gold/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-spotlight-navy py-3 text-[13px] font-semibold text-spotlight-gold transition hover:bg-spotlight-teal disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send login link"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-spotlight-text-muted">
          Not a member yet?{" "}
          <Link
            href="/subscribe"
            className="font-medium text-spotlight-navy underline-offset-2 hover:underline"
          >
            Subscribe
          </Link>
        </p>
      </div>
    </main>
  );
}
