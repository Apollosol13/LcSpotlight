import { isGoogleNewsPlaceholderThumb } from "@/lib/news-thumbnail-url";

function pickMetaImage(html: string): string | null {
  const og =
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og?.[1]?.startsWith("http")) return og[1];

  const tw =
    html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]*property=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  if (tw?.[1]?.startsWith("http")) return tw[1];

  return null;
}

function normalizeImageUrl(url: string | null): string | null {
  if (!url || !url.startsWith("http")) return null;
  if (isGoogleNewsPlaceholderThumb(url)) return null;
  return url;
}

export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    let hostname: string;
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
    // Google News article pages only expose the generic Google News og:image, not the publisher photo.
    if (hostname === "news.google.com") return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const html = await res.text();
    return normalizeImageUrl(pickMetaImage(html));
  } catch {
    return null;
  }
}
