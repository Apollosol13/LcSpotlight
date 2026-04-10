"use client";

import { useState } from "react";

export default function CompMemberPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(
    null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/comp-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ok: true });
      setEmail("");
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-white">
        Grant free access
      </h1>
      <p className="mb-8 text-sm text-white/40">
        Give someone complimentary membership. They&apos;ll receive a magic link to
        log in.
      </p>

      <div className="max-w-md rounded-lg border border-white/10 bg-white/5 p-6">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label
              htmlFor="comp-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
            >
              Email address
            </label>
            <input
              id="comp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="friend@email.com"
              className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
            />
          </div>

          {result?.ok && (
            <p className="rounded bg-green-500/10 px-3 py-2 text-sm text-green-400">
              Access granted! A login link was sent to their email.
            </p>
          )}
          {result?.error && (
            <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {result.error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-spotlight-gold py-2.5 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
          >
            {loading ? "Granting..." : "Grant free access"}
          </button>
        </form>
      </div>
    </>
  );
}
