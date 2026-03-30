import { getPublicSupabaseUrl } from "@/lib/supabase-env";

export const EVENT_SUBMISSIONS_BUCKET = "event-submissions";

/** Public URL must be our Supabase project's public storage for the event-submissions bucket. */
export function isPublicEventSubmissionImageUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:") return false;
    const base = new URL(getPublicSupabaseUrl());
    if (u.origin !== base.origin) return false;
    const prefix = `/storage/v1/object/public/${EVENT_SUBMISSIONS_BUCKET}/`;
    return u.pathname.includes(prefix);
  } catch {
    return false;
  }
}
