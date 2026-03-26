import Script from "next/script";

/**
 * Loads Cloudflare Web Analytics when `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is set.
 * Token: Cloudflare dashboard → Web Analytics → your site → JavaScript snippet.
 */
export function CloudflareWebAnalytics() {
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
  if (!token?.trim()) return null;

  return (
    <Script
      id="cf-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: token.trim() })}
    />
  );
}
