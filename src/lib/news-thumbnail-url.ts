/**
 * Detects generic Google News / Google branding images that are not article photos.
 * (When we fetched og:image from a news.google.com URL, every story got the same asset.)
 */
export function isGoogleNewsPlaceholderThumb(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u.startsWith("http") && !u.startsWith("//")) return false;
  if (u.includes("gstatic.com/gnews")) return true;
  // Default og:image Google serves for Google News article shell pages (same for all stories)
  if (u.includes("j6_cofbogxhri9i")) return true;
  return false;
}
