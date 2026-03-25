"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type StorySubmissionRow = {
  id: string;
  name: string;
  email: string;
  title: string;
  body: string;
  status: string;
  staff_notes: string | null;
  created_at: string;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function StorySubmissionDetailClient({ row }: { row: StorySubmissionRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.status);
  const [staffNotes, setStaffNotes] = useState(row.staff_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/story_submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        name: row.name,
        email: row.email,
        title: row.title,
        body: row.body,
        status,
        staff_notes: staffNotes.trim() || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Could not save");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this submission permanently?")) return;
    setDeleting(true);
    setError("");
    const res = await fetch("/api/admin/story_submissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    setDeleting(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Could not delete");
      return;
    }
    router.push("/admin/story-submissions");
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/admin/story-submissions"
        className="mb-6 inline-block text-sm text-white/50 no-underline transition hover:text-spotlight-gold"
      >
        ← Back to list
      </Link>

      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-8 min-[600px]:flex-row min-[600px]:items-start min-[600px]:justify-between">
        <div>
          <h1 className="text-xl font-semibold leading-snug text-white min-[600px]:text-2xl">
            {row.title}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Submitted {formatWhen(row.created_at)}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-md border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/60">
          {row.status}
        </span>
      </div>

      <div className="mb-8 grid gap-6 min-[600px]:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">From</h2>
          <p className="text-sm text-white">{row.name}</p>
          <a
            href={`mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent(`Re: ${row.title}`)}`}
            className="mt-1 inline-block text-sm text-spotlight-gold no-underline hover:underline"
          >
            {row.email}
          </a>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">Pitch</h2>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{row.body}</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-sm font-medium text-white">Internal</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="sub-status" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Status
            </label>
            <input
              id="sub-status"
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="pending · reviewed · archived"
              className="w-full max-w-md rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-spotlight-gold"
            />
          </div>
          <div>
            <label htmlFor="sub-notes" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Staff notes
            </label>
            <textarea
              id="sub-notes"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              rows={4}
              placeholder="Private notes for your team…"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-spotlight-gold"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-md bg-spotlight-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={deleting}
            className="rounded-md border border-red-400/40 px-5 py-2 text-sm text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
