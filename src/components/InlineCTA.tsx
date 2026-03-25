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
    <section
      id="weekly-digest"
      className="border-b border-spotlight-sand bg-white px-5 py-10 min-[601px]:px-12"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-stretch gap-8 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-10">
        <div className="shrink-0">
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-spotlight-teal/50">
            Weekly digest
          </p>
          <h3 className="font-serif text-[clamp(1.5rem,4vw,1.875rem)] font-normal italic text-spotlight-navy">
            Get the Lowcountry Weekly
          </h3>
        </div>

        <p className="max-w-[280px] text-xs font-light tracking-[0.03em] text-[#8a96a8] min-[900px]:flex-1">
          Events, openings, deals, and local news — every Thursday.
        </p>

        <div className="w-full min-[900px]:w-auto min-[900px]:shrink-0">
          {status === "success" ? (
            <p className="text-sm font-medium text-spotlight-teal">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md min-[900px]:max-w-none">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="min-w-0 flex-1 border border-r-0 border-spotlight-sand bg-spotlight-cream px-5 py-3.5 text-xs font-light tracking-[0.04em] text-spotlight-ink outline-none placeholder:text-[#aaa] focus:border-spotlight-teal/40 min-[900px]:w-[260px] min-[900px]:flex-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 bg-spotlight-navy px-[22px] py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-gold transition-colors hover:bg-spotlight-teal disabled:opacity-60"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-xs font-medium text-spotlight-coral">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
