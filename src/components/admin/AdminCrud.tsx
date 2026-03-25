"use client";

import { useEffect, useState, useCallback } from "react";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "color" | "boolean";
  placeholder?: string;
  defaultValue?: string | boolean;
  required?: boolean;
}

interface AdminCrudProps {
  table: string;
  title: string;
  fields: FieldDef[];
  columns: string[];
}

type Row = Record<string, unknown> & { id: string };

export function AdminCrud({ table, title, fields, columns }: AdminCrudProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/${table}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
    setLoading(false);
  }, [table]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  function openNew() {
    setEditing(null);
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
      else defaults[f.key] = f.type === "boolean" ? false : "";
    });
    setFormData(defaults);
    setShowForm(true);
    setError("");
  }

  function openEdit(row: Row) {
    setEditing(row);
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      data[f.key] = row[f.key] ?? (f.type === "boolean" ? false : "");
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

    const res = await fetch(`/api/admin/${table}`, {
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

    await fetch(`/api/admin/${table}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRows();
  }

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-white/40">{rows.length} items</p>
        </div>
        <button
          onClick={openNew}
          className="rounded-md bg-spotlight-gold px-4 py-2 text-sm font-semibold text-spotlight-navy transition hover:bg-spotlight-gold-light"
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
              <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
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
                ) : f.type === "color" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(formData[f.key] as string) ?? "#3C507D"}
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
              className="rounded-md bg-spotlight-gold px-5 py-2 text-sm font-semibold text-spotlight-navy transition hover:bg-spotlight-gold-light disabled:opacity-50"
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
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-white/[0.02]">
                  {columns.map((col) => (
                    <td key={col} className="max-w-[200px] truncate px-4 py-3 text-white/70">
                      {typeof row[col] === "boolean"
                        ? row[col] ? "Yes" : "No"
                        : String(row[col] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
