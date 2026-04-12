"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function AccessFormClient() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/subscribe";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      window.location.href = nextPath.startsWith("/") ? nextPath : "/subscribe";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm text-center">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-teal/60">
          LCSpotlight
        </p>
        <h1 className="mb-3 font-serif text-2xl font-bold text-spotlight-navy">
          Enter invite code
        </h1>
        <p className="mb-8 text-[13px] leading-relaxed text-spotlight-text-mid">
          This code opens checkout only. After you pay, use Member login for access.
          Testers get free access from the team via Admin → Grant free access.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 text-left shadow-[0_4px_24px_rgba(12,27,51,0.06)]"
        >
          <div>
            <label
              htmlFor="access-code"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[1.5px] text-spotlight-text-muted"
            >
              Code
            </label>
            <input
              id="access-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="off"
              className="w-full rounded-lg border border-[rgba(12,27,51,0.12)] px-4 py-3 text-[14px] text-spotlight-navy outline-none transition focus:border-spotlight-gold focus:ring-2 focus:ring-spotlight-gold/20"
              placeholder="Your invite code"
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
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-[12px] text-spotlight-text-muted">
          Already a paying member?{" "}
          <Link
            href="/member/login"
            className="font-medium text-spotlight-navy underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
        <p className="mt-3 text-[12px] text-spotlight-text-muted">
          <Link href="/" className="text-spotlight-teal hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
