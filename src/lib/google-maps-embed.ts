/**
 * Maps Embed API — interactive map for a place search string.
 * Enable "Maps Embed API" for your Google Cloud key and restrict the key (HTTP referrers for production).
 * @see https://developers.google.com/maps/documentation/embed/embedding-map
 */
export function googleMapsPlaceEmbedUrl(placeQuery: string): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key || !placeQuery.trim()) return null;
  const q = encodeURIComponent(placeQuery.trim());
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${q}`;
}
