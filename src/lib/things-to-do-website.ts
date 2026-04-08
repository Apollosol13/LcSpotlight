/** Matches Google Business Profile “Website” UTM convention for attribution. */
const GOOGLE_BUSINESS_PROFILE_UTM =
  "utm_source=google&utm_medium=organic&utm_campaign=business-profile";

function withGoogleBusinessProfileUtm(href: string): string {
  if (/[?&]utm_source=google(?:&|$)/.test(href)) return href;
  return href.includes("?")
    ? `${href}&${GOOGLE_BUSINESS_PROFILE_UTM}`
    : `${href}?${GOOGLE_BUSINESS_PROFILE_UTM}`;
}

type WebsiteHrefOptions = {
  /** When `"Golf"`, outbound links include GBP-style UTM params (if not already present). */
  category?: string | null;
};

/** Normalize stored website string to a usable href. */
export function websiteHref(
  w: string | null | undefined,
  opts?: WebsiteHrefOptions,
): string | null {
  if (!w?.trim()) return null;
  const t = w.trim();
  const base = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  if ((opts?.category ?? "").trim() === "Golf") {
    return withGoogleBusinessProfileUtm(base);
  }
  return base;
}
