import type { EventRow } from "./types";

/** Prefer official listing URL; otherwise fall back to site calendar. */
export function eventDetailHref(e: Pick<EventRow, "source_url">): string {
  const u = e.source_url?.trim();
  if (u && /^https?:\/\//i.test(u)) return u;
  return "/events";
}

export function isExternalEventHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
