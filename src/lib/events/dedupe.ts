/** Normalize for fuzzy-ish matching across sources. */
export function normalizeTitle(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export function normalizeLocation(loc: string | null | undefined): string {
  if (!loc) return "";
  return loc.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 120);
}

/**
 * Stable key: same event from different sources should collide here if
 * title, calendar day, and location align.
 */
export function buildDedupeKey(
  name: string,
  dateKey: string,
  location: string | null | undefined,
): string {
  const t = normalizeTitle(name);
  const d = dateKey || "unknown";
  const l = normalizeLocation(location);
  return `${t}|${d}|${l}`;
}

/** `dateKey` should be YYYY-MM-DD in local intent (UTC date of start_at when known). */
export function dateKeyFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function dateKeyFromDayMonth(day: string, month: string, year = new Date().getFullYear()): string {
  const tryParse = Date.parse(`${month} ${parseInt(day, 10)}, ${year}`);
  if (!Number.isNaN(tryParse)) {
    return new Date(tryParse).toISOString().slice(0, 10);
  }
  return `${year}-${(month || "?").slice(0, 3)}-${day}`;
}
