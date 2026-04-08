import type { ThingsToDoRow } from "@/lib/things-to-do-types";
import { isValidGooglePhotoResourceName } from "@/lib/places-api";

/**
 * Image URL for listings: explicit `image_url` wins; otherwise first valid Places photo.
 */
export function thingsToDoImageSrc(
  row: Pick<ThingsToDoRow, "image_url" | "google_photo_name" | "google_photo_names">,
): string | null {
  const ext = row.image_url?.trim();
  if (ext) return ext;
  const photoName = row.google_photo_name?.trim();
  if (photoName && isValidGooglePhotoResourceName(photoName)) {
    return `/api/places-photo?n=${encodeURIComponent(photoName)}`;
  }
  const names = row.google_photo_names;
  if (Array.isArray(names)) {
    for (const n of names) {
      const t = n?.trim();
      if (t && isValidGooglePhotoResourceName(t)) {
        return `/api/places-photo?n=${encodeURIComponent(t)}`;
      }
    }
  }
  return null;
}

const GALLERY_MAX = 12;

/**
 * Deduped image URLs for gallery: optional external `image_url` first, then Places photos.
 */
export function thingsToDoGalleryImageSrcs(
  row: Pick<ThingsToDoRow, "image_url" | "google_photo_name" | "google_photo_names">,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (u: string | null | undefined) => {
    const s = u?.trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  add(row.image_url);
  const names = [
    row.google_photo_name,
    ...(Array.isArray(row.google_photo_names) ? row.google_photo_names : []),
  ];
  for (const raw of names) {
    const t = raw?.trim();
    if (t && isValidGooglePhotoResourceName(t)) {
      add(`/api/places-photo?n=${encodeURIComponent(t)}`);
    }
    if (out.length >= GALLERY_MAX) break;
  }
  return out;
}
