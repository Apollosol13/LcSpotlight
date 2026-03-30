"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const PARTNER_LISTINGS_BUCKET = "partner-listings";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "color" | "boolean" | "select" | "date" | "image";
  placeholder?: string;
  defaultValue?: string | boolean;
  required?: boolean;
  /** When type === "select" */
  options?: { value: string; label: string }[];
}

type Row = Record<string, unknown> & { id: string };

interface AdminCrudProps {
  table: string;
  title: string;
  fields: FieldDef[];
  columns: string[];
  /** Base path for an “Open” link per row: `{detailBasePath}/{row.id}`. */
  detailBasePath?: string;
  /** When set, shows a search field; rows match if any listed field contains the query (case-insensitive). */
  searchKeys?: string[];
  searchPlaceholder?: string;
  /** @default "/api/admin" */
  apiBase?: string;
}

export function AdminCrud({
  table,
  title,
  fields,
  columns,
  detailBasePath,
  searchKeys,
  searchPlaceholder = "Search…",
  apiBase = "/api/admin",
}: AdminCrudProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${apiBase}/${table}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
    setLoading(false);
  }, [apiBase, table]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  function openNew() {
    setEditing(null);
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
      else if (f.type === "select" && f.options?.[0]) defaults[f.key] = f.options[0].value;
      else defaults[f.key] =
        f.type === "boolean" ? false : f.type === "image" ? "" : "";
    });
    setFormData(defaults);
    setShowForm(true);
    setError("");
  }

  function openEdit(row: Row) {
    setEditing(row);
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (row[f.key] !== undefined && row[f.key] !== null && row[f.key] !== "") {
        data[f.key] = row[f.key];
      } else if (f.type === "boolean") {
        data[f.key] = false;
      } else if (f.type === "select" && f.options?.[0]) {
        data[f.key] = f.options[0].value;
      } else {
        data[f.key] = "";
      }
    });
    setFormData(data);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...formData, id: editing.id } : formData;

    const res = await fetch(`${apiBase}/${table}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Something went wrong");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    fetchRows();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;

    await fetch(`${apiBase}/${table}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRows();
  }

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadListingImage(fieldKey: string, file: File | null) {
    if (!file) return;
    setError("");
    setUploadingField(fieldKey);
    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sign in to upload images.");
        return;
      }
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${table}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(PARTNER_LISTINGS_BUCKET)
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from(PARTNER_LISTINGS_BUCKET).getPublicUrl(path);
      updateField(fieldKey, data.publicUrl);
    } finally {
      setUploadingField(null);
    }
  }

  const filteredRows = useMemo(() => {
    if (!searchKeys?.length || !search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((key) => {
        const v = row[key];
        if (v == null) return false;
        return String(v).toLowerCase().includes(q);
      }),
    );
  }, [rows, search, searchKeys]);

  const displayRows = searchKeys?.length ? filteredRows : rows;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {search.trim() && searchKeys?.length
              ? `${displayRows.length} of ${rows.length} items`
              : `${rows.length} items`}
          </p>
          {searchKeys?.length ? (
            <div className="mt-4 max-w-md">
              <label htmlFor={`admin-crud-search-${table}`} className="sr-only">
                Search {title.toLowerCase()}
              </label>
              <input
                id={`admin-crud-search-${table}`}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-spotlight-gold"
              />
            </div>
          ) : null}
        </div>
        <button
          onClick={openNew}
          className="shrink-0 rounded-md bg-spotlight-gold px-4 py-2 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light"
        >
          + Add New
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-medium text-white">
            {editing ? "Edit" : "New"} {title.replace(/s$/, "")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.key}
                className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}
              >
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={(formData[f.key] as string) ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-spotlight-gold"
                  />
                ) : f.type === "select" && f.options?.length ? (
                  <select
                    value={(formData[f.key] as string) ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-spotlight-gold"
                  >
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "boolean" ? (
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={(formData[f.key] as boolean) ?? false}
                      onChange={(e) => updateField(f.key, e.target.checked)}
                      className="rounded"
                    />
                    {f.label}
                  </label>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    value={(formData[f.key] as string) ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-spotlight-gold"
                  />
                ) : f.type === "image" ? (
                  <div className="space-y-3">
                    {(formData[f.key] as string)?.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(formData[f.key] as string).trim()}
                        alt=""
                        className="max-h-44 max-w-full rounded border border-white/10 object-cover"
                      />
                    ) : null}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={uploadingField === f.key}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        e.target.value = "";
                        void uploadListingImage(f.key, file);
                      }}
                      className="w-full text-xs text-white/60 file:mr-3 file:rounded file:border-0 file:bg-spotlight-gold/20 file:px-3 file:py-1.5 file:text-spotlight-gold"
                    />
                    {uploadingField === f.key ? (
                      <p className="text-xs text-white/40">Uploading…</p>
                    ) : null}
                    <input
                      type="text"
                      value={(formData[f.key] as string) ?? ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      placeholder="Or paste image URL"
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-spotlight-gold"
                    />
                    {(formData[f.key] as string)?.trim() ? (
                      <button
                        type="button"
                        onClick={() => updateField(f.key, "")}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Clear image
                      </button>
                    ) : null}
                  </div>
                ) : f.type === "color" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(formData[f.key] as string) ?? "#1E3A5F"}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                    <input
                      type="text"
                      value={(formData[f.key] as string) ?? ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="flex-1 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-spotlight-gold"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={(formData[f.key] as string) ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-spotlight-gold"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-spotlight-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-white/10 px-5 py-2 text-sm text-white/60 transition hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-white/40">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-16 text-center">
          <p className="text-sm text-white/40">No {title.toLowerCase()} yet</p>
          <button
            onClick={openNew}
            className="mt-4 text-sm font-medium text-spotlight-gold hover:underline"
          >
            Add your first one
          </button>
        </div>
      ) : displayRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-white/40">No items match “{search.trim()}”. Clear the search or try other keywords.</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-3 text-sm font-medium text-spotlight-gold hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-white/[0.02]">
                  {columns.map((col) => (
                    <td key={col} className="max-w-[200px] truncate px-4 py-3 text-white/70">
                      {typeof row[col] === "boolean"
                        ? row[col] ? "Yes" : "No"
                        : String(row[col] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {detailBasePath ? (
                        <Link
                          href={`${detailBasePath.replace(/\/$/, "")}/${row.id}`}
                          className="rounded px-2.5 py-1 text-xs text-white/80 no-underline transition hover:bg-white/10"
                        >
                          Open
                        </Link>
                      ) : null}
                      <button
                        onClick={() => openEdit(row)}
                        className="rounded px-2.5 py-1 text-xs text-spotlight-gold transition hover:bg-spotlight-gold/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded px-2.5 py-1 text-xs text-red-400 transition hover:bg-red-400/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
