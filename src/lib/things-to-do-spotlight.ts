import type { ThingsToDoRow } from "@/lib/things-to-do-types";

/** Evenly sample across the full list (deterministic, stable for SSR). */
export function pickThingsToDoSpotlight(items: ThingsToDoRow[], count: number): ThingsToDoRow[] {
  if (items.length <= count) return items;
  const sorted = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const out: ThingsToDoRow[] = [];
  const n = sorted.length;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(((i + 0.5) * n) / count);
    out.push(sorted[Math.min(idx, n - 1)]!);
  }
  return out;
}
