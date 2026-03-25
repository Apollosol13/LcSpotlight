"use client";

import { useState } from "react";

export function SubmitStoryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/submit-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, title, body }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setTitle("");
      setBody("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="py-4 text-center">
        <p className="font-serif text-lg text-spotlight-navy">Thank you.</p>
        <p className="mt-3 text-sm font-light leading-relaxed text-spotlight-text-mid">
          We received your story idea. If it&apos;s a fit, someone from LCSpotlight may
          reach out at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="story-name" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted">
          Your name
        </label>
        <input
          id="story-name"
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label htmlFor="story-email" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted">
          Email
        </label>
        <input
          id="story-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label htmlFor="story-title" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted">
          Headline / subject
        </label>
        <input
          id="story-title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. New café opening in Old Town Bluffton"
          className="w-full border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
      </div>
      <div>
        <label htmlFor="story-body" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-spotlight-text-muted">
          Your pitch
        </label>
        <textarea
          id="story-body"
          required
          rows={8}
          maxLength={8000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Who, what, when, where, and why our readers would care."
          className="w-full resize-y border border-spotlight-sand bg-spotlight-cream px-4 py-3 text-sm text-spotlight-ink outline-none placeholder:text-spotlight-text-muted/60 focus:border-spotlight-teal/40"
        />
        <p className="mt-1 text-right text-[11px] text-spotlight-text-muted">{body.length} / 8000</p>
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-spotlight-coral">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-spotlight-navy py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-spotlight-gold transition-colors hover:bg-spotlight-teal disabled:opacity-60 min-[601px]:w-auto min-[601px]:px-10"
      >
        {status === "loading" ? "Sending…" : "Send submission"}
      </button>
    </form>
  );
}
