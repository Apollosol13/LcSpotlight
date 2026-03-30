"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type EventSubmissionRow = {
  id: string;
  created_at: string;
  org_name: string;
  contact_email: string;
  name: string;
  category: string | null;
  day: string;
  month: string;
  time: string | null;
  location: string | null;
  price: string | null;
  cta: string | null;
  bg: string | null;
  image_url?: string | null;
  icon: string | null;
  details: string | null;
  status: string;
  staff_notes: string | null;
  published_event_id: string | null;
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

export function EventSubmissionDetailClient({ row }: { row: EventSubmissionRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.status);
  const [staffNotes, setStaffNotes] = useState(row.staff_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canApprove = !row.published_event_id;

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/event_submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        org_name: row.org_name,
        contact_email: row.contact_email,
        name: row.name,
        category: row.category,
        day: row.day,
        month: row.month,
        time: row.time,
        location: row.location,
        price: row.price,
        cta: row.cta,
        bg: row.bg,
        image_url: row.image_url ?? null,
        icon: row.icon,
        details: row.details,
        status,
        staff_notes: staffNotes.trim() || null,
        published_event_id: row.published_event_id,
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

  async function approve() {
    setApproving(true);
    setError("");
    const res = await fetch("/api/admin/approve-event-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    setApproving(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Could not approve");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this submission permanently?")) return;
    setDeleting(true);
    setError("");
    const res = await fetch("/api/admin/event_submissions", {
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
    router.push("/admin/event-submissions");
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/admin/event-submissions"
        className="mb-6 inline-block text-sm text-white/50 no-underline transition hover:text-spotlight-gold"
      >
        ← Back to list
      </Link>

      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-8 min-[600px]:flex-row min-[600px]:items-start min-[600px]:justify-between">
        <div>
          <h1 className="text-xl font-semibold leading-snug text-white min-[600px]:text-2xl">
            {row.name}
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
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Organization</h2>
          <p className="text-sm text-white">{row.org_name}</p>
        </div>
        <div>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Contact</h2>
          <a
            href={`mailto:${encodeURIComponent(row.contact_email)}?subject=${encodeURIComponent(`Re: ${row.name}`)}`}
            className="text-sm text-spotlight-gold no-underline hover:underline"
          >
            {row.contact_email}
          </a>
        </div>
      </div>

      <div className="mb-8 grid gap-4 text-sm text-white/85 min-[600px]:grid-cols-2">
        {row.category ? (
          <p>
            <span className="text-white/40">Category · </span>
            {row.category}
          </p>
        ) : null}
        <p>
          <span className="text-white/40">Date · </span>
          {row.month} {row.day}
        </p>
        {row.time ? (
          <p>
            <span className="text-white/40">Time · </span>
            {row.time}
          </p>
        ) : null}
        {row.location ? (
          <p>
            <span className="text-white/40">Location · </span>
            {row.location}
          </p>
        ) : null}
        {row.price ? (
          <p>
            <span className="text-white/40">Price · </span>
            {row.price}
          </p>
        ) : null}
        {row.cta ? (
          <p>
            <span className="text-white/40">CTA · </span>
            {row.cta}
          </p>
        ) : null}
        {row.bg ? (
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-white/40">Background · </span>
            <span
              className="inline-block h-5 w-5 rounded border border-white/20"
              style={{ background: row.bg }}
              title={row.bg}
            />
            <span className="font-mono text-xs text-white/70">{row.bg}</span>
          </p>
        ) : null}
      </div>

      {row.image_url ? (
        <div className="mb-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">Submitted image</h2>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.image_url}
              alt=""
              className="max-h-64 w-full object-cover object-center"
            />
          </div>
        </div>
      ) : null}

      {row.details ? (
        <div className="mb-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">Details from submitter</h2>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{row.details}</p>
          </div>
        </div>
      ) : null}

      {row.published_event_id ? (
        <p className="mb-8 text-sm text-white/50">
          Linked calendar row:{" "}
          <span className="font-mono text-xs text-white/70">{row.published_event_id}</span>
        </p>
      ) : null}

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-sm font-medium text-white">Review</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="es-status" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Status
            </label>
            <select
              id="es-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full max-w-md rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-spotlight-gold"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="es-notes" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Staff notes
            </label>
            <textarea
              id="es-notes"
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
          {canApprove ? (
            <button
              type="button"
              onClick={() => void approve()}
              disabled={approving}
              className="rounded-md bg-spotlight-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
            >
              {approving ? "Publishing…" : "Approve & publish to calendar"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-md border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save status & notes"}
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
        {canApprove ? (
          <p className="mt-4 text-xs leading-relaxed text-white/35">
            Use <strong className="font-medium text-white/50">Approve & publish</strong> to add this event to the public
            calendar and mark the submission approved. To decline without publishing, set status to Rejected and save.
          </p>
        ) : null}
      </div>
    </div>
  );
}
