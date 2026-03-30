"use client";

import { useState } from "react";

export default function InviteBusinessPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        existingUser?: boolean;
        emailedViaApp?: boolean;
        emailedViaSupabase?: boolean;
        magicLinkNotEmailed?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      const parts: string[] = ["Partner role saved."];
      if (data.emailedViaSupabase) {
        parts.push("Supabase sent an invite email (check your Auth / SMTP settings).");
      }
      if (data.existingUser && data.emailedViaApp) {
        parts.push("We emailed them a sign-in link.");
      }
      if (data.magicLinkNotEmailed) {
        parts.push(
          "They already have an account. Set RESEND_API_KEY in the app to email a magic link automatically, or ask them to sign in at /login.",
        );
      }
      setMessage(parts.join(" "));
      setEmail("");
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-white">Invite business partner</h1>
      <p className="mb-8 max-w-xl text-sm text-white/40">
        Sends a Supabase invite for new emails. If the address already exists in Auth, we assign the
        partner role and—when{" "}
        <code className="rounded bg-white/10 px-1 text-white/70">RESEND_API_KEY</code> is
        set—email a magic link.
      </p>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="max-w-md space-y-5 rounded-lg border border-white/10 bg-white/[0.03] p-6"
      >
        <div>
          <label
            htmlFor="invite-email"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
          >
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
            placeholder="partner@venue.com"
          />
        </div>

        {error ? (
          <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200/90">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-spotlight-gold px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send invite"}
        </button>
      </form>
    </>
  );
}
