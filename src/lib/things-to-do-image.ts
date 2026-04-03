import type { ThingsToDoRow } from "@/lib/things-to-do-types";

/**
 * Image URL for listings: explicit `image_url` wins; otherwise Google Places proxy.
 */
export function thingsToDoImageSrc(row: Pick<ThingsToDoRow, "image_url" | "google_photo_name">): string | null {
  const ext = row.image_url?.trim();
  if (ext) return ext;
  const photoName = row.google_photo_name?.trim();
  if (photoName) {
    return `/api/places-photo?n=${encodeURIComponent(photoName)}`;
  }
  return null;
}
