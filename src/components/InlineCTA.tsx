"use client";

import { useState } from "react";

export function InlineCTA() {
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
    <section className="border-b border-[rgba(12,27,51,0.1)] bg-spotlight-sand">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5 px-5 py-10 min-[601px]:px-10 min-[768px]:flex-row min-[768px]:justify-between min-[768px]:gap-8">
        <div className="text-center min-[768px]:text-left">
          <h3 className="font-serif text-xl font-normal text-spotlight-navy">
            Get the <em className="italic text-spotlight-gold">Lowcountry Weekly</em>
          </h3>
          <p className="mt-1 text-sm font-light text-spotlight-text-mid">
            Events, openings, deals, and local news — every Thursday.
          </p>
        </div>

        {status === "success" ? (
          <p className="text-sm font-medium text-spotlight-teal">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-[380px] shrink-0">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-w-0 flex-1 rounded-l border border-r-0 border-[rgba(12,27,51,0.15)] bg-white px-4 py-2.5 text-sm text-spotlight-navy placeholder:text-spotlight-text-muted focus:border-spotlight-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-r bg-spotlight-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-spotlight-navy transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-xs font-medium text-spotlight-coral">{message}</p>
        )}
      </div>
    </section>
  );
}
