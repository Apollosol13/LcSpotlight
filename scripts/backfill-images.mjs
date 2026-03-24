import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchOgImage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LCSpotlightBot/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) return null;
    const html = await res.text();
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (match?.[1]?.startsWith("http")) return match[1];
    return null;
  } catch { return null; }
}

const { data: articles } = await supabase
  .from("news")
  .select("id, source_url, image_bg")
  .not("source_url", "is", null);

const needsImage = articles.filter(a => !a.image_bg || !a.image_bg.startsWith("http"));
console.log(`${needsImage.length} articles need images (out of ${articles.length} total)\n`);

let found = 0;
let failed = 0;
const batchSize = 5;

for (let i = 0; i < needsImage.length; i += batchSize) {
  const batch = needsImage.slice(i, i + batchSize);
  const results = await Promise.all(
    batch.map(async (article) => {
      const img = await fetchOgImage(article.source_url);
      return { id: article.id, img };
    })
  );

  for (const { id, img } of results) {
    if (img) {
      await supabase.from("news").update({ image_bg: img }).eq("id", id);
      found++;
    } else {
      failed++;
    }
  }

  console.log(`Progress: ${Math.min(i + batchSize, needsImage.length)}/${needsImage.length} (${found} images found)`);
}

console.log(`\nDone! ${found} images added, ${failed} articles had no OG image`);
