/** Normalize stored website string to a usable href. */
export function websiteHref(w: string | null | undefined): string | null {
  if (!w?.trim()) return null;
  const t = w.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
