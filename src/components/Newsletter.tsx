"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section className="bg-spotlight-gold px-5 py-12 text-center min-[601px]:px-10">
      <div className="mx-auto max-w-[540px]">
        <h2 className="mb-2 font-serif text-[32px] font-normal text-spotlight-navy">
          Stay in the <em className="italic">loop</em>
        </h2>
        <p className="mb-6 text-sm font-light text-[rgba(12,27,51,0.65)]">
          The Spotlight weekly digest — events, openings, deals, and market
          news, delivered every Thursday morning.
        </p>

        {status === "success" ? (
          <p className="text-sm font-medium text-spotlight-navy">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-[400px]">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-w-0 flex-1 rounded-l-[2px] border-0 bg-white px-4 py-3 text-sm text-spotlight-navy placeholder:text-spotlight-text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-r-[2px] bg-spotlight-navy px-5 py-3 text-[13px] font-medium uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs font-medium text-[#8B0000]">{message}</p>
        )}
      </div>
    </section>
  );
}
