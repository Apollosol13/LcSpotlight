"use client";

import { useState } from "react";

function normalizeHex(raw: string): string {
  const t = raw.trim();
  if (!t) return "#1E3A5F";
  const withHash = t.startsWith("#") ? t : `#${t}`;
  if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) return withHash;
  return "";
}

export function PublishEventForm() {
  const [org_name, setOrgName] = useState("");
  const [contact_email, setContactEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [cta, setCta] = useState("Learn More");
  const [bg, setBg] = useState("#1E3A5F");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hex = normalizeHex(bg);
    if (!hex) {
      setStatus("error");
      setMessage("Please use a valid hex background color (e.g. #1E3A5F).");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/submit-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name,
          contact_email,
          name,
          category,
          day,
          month,
          time,
          location,
          price,
          cta: cta.trim() || "Learn More",
          bg: hex,
          details,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setOrgName("");
      setContactEmail("");
      setName("");
      setCategory("");
      setDay("");
      setMonth("");
      setTime("");
      setLocation("");
      setPrice("");
      setCta("Learn More");
      setBg("#1E3A5F");
      setDetails("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="py-4 text-center">
        <p className="font-serif text-lg text-spotlight-navy">Thanks — we received it.</p>
        <p className="mt-3 text-sm font-light leading-relaxed text-spotlight-text-mid">
          Your event is pending review. If we publish it, it will appear on the calendar after
          approval. We may contact you at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="evt-org"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Organization or venue
        </label>
        <input
          id="evt-org"
          type="text"
          required
          maxLength={200}
          value={org_name}
          onChange={(e) => setOrgName(e.target.value)}
          autoComplete="organization"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-email"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Contact email
        </label>
        <input
          id="evt-email"
          type="email"
          required
          value={contact_email}
          onChange={(e) => setContactEmail(e.target.value)}
          autoComplete="email"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-name"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Event name
        </label>
        <input
          id="evt-name"
          type="text"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-cat"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Category <span className="font-normal normal-case text-spotlight-text-muted/80">(optional)</span>
        </label>
        <input
          id="evt-cat"
          type="text"
          maxLength={80}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Music, Community, Food & Drink…"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
      </div>
      <div className="grid gap-5 min-[500px]:grid-cols-2">
        <div>
          <label
            htmlFor="evt-day"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
          >
            Day
          </label>
          <input
            id="evt-day"
            type="text"
            required
            maxLength={4}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="05"
            className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
          />
        </div>
        <div>
          <label
            htmlFor="evt-month"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
          >
            Month
          </label>
          <input
            id="evt-month"
            type="text"
            required
            maxLength={12}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Apr"
            className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="evt-time"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Time <span className="font-normal normal-case text-spotlight-text-muted/80">(optional)</span>
        </label>
        <input
          id="evt-time"
          type="text"
          maxLength={80}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="6:00 PM"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-loc"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Location <span className="font-normal normal-case text-spotlight-text-muted/80">(optional)</span>
        </label>
        <input
          id="evt-loc"
          type="text"
          maxLength={300}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-price"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Price / admission <span className="font-normal normal-case text-spotlight-text-muted/80">(optional)</span>
        </label>
        <input
          id="evt-price"
          type="text"
          maxLength={120}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Free · From $45"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-cta"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Button label
        </label>
        <input
          id="evt-cta"
          type="text"
          maxLength={80}
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          placeholder="Learn More"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label
          htmlFor="evt-bg"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Card background color
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="evt-bg"
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(bg) ? bg : "#1E3A5F"}
            onChange={(e) => setBg(e.target.value)}
            className="h-11 w-14 cursor-pointer border border-spotlight-sand bg-spotlight-cream p-1"
            aria-label="Pick background color"
          />
          <input
            type="text"
            maxLength={7}
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            placeholder="#1E3A5F"
            className="min-w-[7rem] flex-1 border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="evt-details"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted"
        >
          Extra details for our team <span className="font-normal normal-case text-spotlight-text-muted/80">(optional)</span>
        </label>
        <textarea
          id="evt-details"
          rows={5}
          maxLength={4000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Ticket link, parking, accessibility, or anything else we should know."
          className="w-full resize-y border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
        <p className="mt-1 text-right text-[11px] text-spotlight-text-muted">{details.length} / 4000</p>
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-spotlight-coral">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-spotlight-navy py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-gold transition-colors hover:bg-spotlight-teal disabled:opacity-60 min-[601px]:w-auto min-[601px]:px-10"
      >
        {status === "loading" ? "Sending…" : "Submit for review"}
      </button>
    </form>
  );
}
