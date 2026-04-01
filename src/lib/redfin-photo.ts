/**
 * Redfin CDN primary images use genMid.{mlsToken}_{n}.jpg; some listings 404 on _1
 * but succeed on _0 or _2, or under a different mbpaddedwide folder (listing id % 1000).
 */

const GENMID_RE =
  /^https:\/\/ssl\.cdn-redfin\.com\/photo\/(\d+)\/([^/]+)\/(\d+)\/genMid\.(.+)_(\d+)\.jpg$/i;

function pushUnique(out: string[], seen: Set<string>, url: string) {
  if (!seen.has(url)) {
    seen.add(url);
    out.push(url);
  }
}

/**
 * Ordered URLs to try for a listing image (primary first, then alternates).
 */
export function redfinPhotoUrlCandidates(
  primaryUrl: string | null | undefined,
  sourceListingId?: string | null,
): string[] {
  if (primaryUrl == null || typeof primaryUrl !== "string") return [];
  const trimmed = primaryUrl.trim();
  if (!trimmed.startsWith("http")) return [];

  const m = trimmed.match(GENMID_RE);
  if (!m) return [trimmed];

  const ds = m[1];
  const wide = m[2];
  const dirPrimary = m[3];
  const mlsToken = m[4];
  const primaryIdx = Number.parseInt(m[5], 10);
  const seen = new Set<string>();
  const out: string[] = [];
  pushUnique(out, seen, trimmed);

  const dirs: string[] = [dirPrimary];
  const lid = sourceListingId ? Number.parseInt(String(sourceListingId).trim(), 10) : NaN;
  if (Number.isFinite(lid) && lid > 0) {
    const alt = String(lid % 1000).padStart(3, "0");
    if (alt !== dirPrimary) dirs.push(alt);
  }

  const idxOrder: number[] = [];
  const want = (n: number) => {
    if (!idxOrder.includes(n)) idxOrder.push(n);
  };
  if (Number.isFinite(primaryIdx)) want(primaryIdx);
  for (const n of [1, 0, 2, 3, 4]) want(n);

  for (const d of dirs) {
    for (const idx of idxOrder) {
      pushUnique(
        out,
        seen,
        `https://ssl.cdn-redfin.com/photo/${ds}/${wide}/${d}/genMid.${mlsToken}_${idx}.jpg`,
      );
    }
  }

  return out;
}
