/**
 * Fetches active for-sale listings from Redfin’s Stingray GIS endpoint (same JSON their map uses).
 * Respect Redfin’s Terms of Use; this is for editorial / local-guide use. Endpoints can change or block datacenter IPs.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";

const GIS_URL = "https://www.redfin.com/stingray/api/gis";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type RedfinHome = Record<string, unknown>;

function parseStingrayJson(text: string): unknown {
  const trimmed = text.trim();
  // Redfin prepends JSON-hijack noise, e.g. {}&&{"resultCode":0,...}
  const afterAmp = trimmed.split("&&").pop()?.trim() ?? trimmed;
  const idx = afterAmp.indexOf("{");
  if (idx === -1) throw new Error("Invalid Redfin response");
  return JSON.parse(afterAmp.slice(idx)) as unknown;
}

function pickNum(obj: unknown): number | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as { level?: number; value?: number };
  if (o.level === 1 && typeof o.value === "number") return o.value;
  return null;
}

function pickStr(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as { level?: number; value?: string };
  if (o.level === 1 && typeof o.value === "string") return o.value;
  return null;
}

function pickLatLong(obj: unknown): { lat: number; lon: number } | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as { level?: number; value?: { latitude?: number; longitude?: number } };
  if (o.level !== 1 || !o.value) return null;
  const { latitude, longitude } = o.value;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  return { lat: latitude, lon: longitude };
}

function uiPropertyLabel(ui: unknown): string {
  const t = typeof ui === "number" ? ui : NaN;
  switch (t) {
    case 1:
    case 6:
      return "Single family";
    case 2:
      return "Townhome";
    case 3:
    case 13:
      return "Condo";
    case 4:
      return "Multi-family";
    case 5:
      return "Manufactured";
    default:
      return "Home";
  }
}

async function fetchHomesForRegion(regionId: number): Promise<RedfinHome[]> {
  const url = new URL(GIS_URL);
  url.searchParams.set("al", "1");
  url.searchParams.set("num_homes", "350");
  url.searchParams.set("region_id", String(regionId));
  url.searchParams.set("region_type", "6");
  url.searchParams.set("status", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: "https://www.redfin.com/",
      Accept: "application/json,text/plain,*/*",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Redfin HTTP ${res.status}`);
  }

  const raw = await res.text();
  const json = parseStingrayJson(raw) as {
    resultCode?: number;
    errorMessage?: string;
    payload?: { homes?: RedfinHome[] };
  };

  if (json.resultCode !== 0) {
    throw new Error(json.errorMessage || "Redfin API error");
  }

  return json.payload?.homes ?? [];
}

/**
 * Primary MLS photo on Redfin CDN (matches paths embedded on listing pages).
 * GA / Savannah use alphanumeric MLS values (e.g. SA348140) in genMid.{id}_1.jpg;
 * the mbpaddedwide folder uses (digits-only tail % 1000), three-digit padded.
 */
function redfinThumbnailUrl(h: RedfinHome): string | null {
  const ds = typeof h.dataSourceId === "number" ? h.dataSourceId : null;
  const mlsRaw = h.mlsId;
  let mlsToken: string | null = null;
  if (mlsRaw && typeof mlsRaw === "object" && mlsRaw !== null && "value" in mlsRaw) {
    const v = (mlsRaw as { value?: unknown }).value;
    if (typeof v === "string" && v.trim()) mlsToken = v.trim();
    else if (typeof v === "number" && Number.isFinite(v)) mlsToken = String(v);
  }
  if (ds == null || mlsToken == null) return null;

  const digitsOnly = mlsToken.replace(/\D/g, "");
  if (!digitsOnly) return null;
  const bucket = parseInt(digitsOnly, 10);
  if (!Number.isFinite(bucket)) return null;
  const dir = String(bucket % 1000).padStart(3, "0");

  return `https://ssl.cdn-redfin.com/photo/${ds}/mbpaddedwide/${dir}/genMid.${mlsToken}_1.jpg`;
}

function homeToListingRow(
  marketKey: string,
  h: RedfinHome,
): Record<string, unknown> | null {
  const listingId = h.listingId;
  if (typeof listingId !== "number" && typeof listingId !== "string") return null;
  const sourceListingId = String(listingId);

  const price = pickNum(h.price);
  const sqft = pickNum(h.sqFt);
  const domFromField = pickNum(h.dom);
  const timeOnRedfinMs = pickNum(h.timeOnRedfin);
  const dom =
    domFromField ??
    (timeOnRedfinMs != null ? Math.max(0, Math.round(timeOnRedfinMs / 86_400_000)) : 0);

  const street = pickStr(h.streetLine) ?? "";
  const unit = pickStr(h.unitNumber) ?? "";
  const addressLine = [street, unit].filter(Boolean).join(" ").trim() || null;

  const ll = pickLatLong(h.latLong);
  const zip =
    (typeof h.zip === "string" ? h.zip : null) ?? pickStr(h.postalCode) ?? null;

  const remarks =
    typeof h.listingRemarks === "string" ? h.listingRemarks.slice(0, 4000) : null;
  const urlPath = typeof h.url === "string" ? h.url : null;

  return {
    market_key: marketKey,
    source_listing_id: sourceListingId,
    price: price ?? null,
    beds: typeof h.beds === "number" ? h.beds : null,
    baths: typeof h.baths === "number" ? h.baths : null,
    sqft: sqft ?? null,
    dom,
    property_type: uiPropertyLabel(h.uiPropertyType),
    year_built: pickNum(h.yearBuilt),
    address_line: addressLine,
    city: typeof h.city === "string" ? h.city : null,
    state: typeof h.state === "string" ? h.state : null,
    zip,
    description: remarks,
    redfin_path: urlPath,
    photo_url: redfinThumbnailUrl(h),
    lat: ll?.lat ?? null,
    lon: ll?.lon ?? null,
    updated_at: new Date().toISOString(),
  };
}

function medianSorted(sorted: number[]): number {
  if (!sorted.length) return 0;
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[m]!
    : Math.round((sorted[m - 1]! + sorted[m]!) / 2);
}

function formatPrice(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    if (v >= 10) return `$${Math.round(v)}M`;
    const s = v.toFixed(2).replace(/\.?0+$/, "");
    return `$${s}M`;
  }
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

export async function scrapeRedfinToSupabase(supabase: SupabaseClient): Promise<{
  markets: { key: string; inserted: number; error?: string }[];
}> {
  const markets: { key: string; inserted: number; error?: string }[] = [];
  const now = new Date().toISOString();

  for (const m of REAL_ESTATE_MARKETS) {
    try {
      const homes = await fetchHomesForRegion(m.regionId);
      const rows: Record<string, unknown>[] = [];
      for (const h of homes) {
        const row = homeToListingRow(m.key, h);
        if (row) rows.push(row);
      }

      await supabase.from("real_estate_listings").delete().eq("market_key", m.key);

      const chunk = 80;
      for (let i = 0; i < rows.length; i += chunk) {
        const part = rows.slice(i, i + chunk);
        const { error } = await supabase.from("real_estate_listings").insert(part);
        if (error) throw new Error(error.message);
      }

      const prices = rows
        .map((r) => r.price as number | null)
        .filter((p): p is number => typeof p === "number" && p > 0)
        .sort((a, b) => a - b);
      const doms = rows
        .map((r) => r.dom as number)
        .filter((d) => typeof d === "number" && d >= 0)
        .sort((a, b) => a - b);
      const pps: number[] = [];
      for (const r of rows) {
        const p = r.price as number | null;
        const s = r.sqft as number | null;
        if (typeof p === "number" && p > 0 && typeof s === "number" && s > 0) {
          pps.push(Math.round(p / s));
        }
      }
      pps.sort((a, b) => a - b);

      const medianPrice = medianSorted(prices);
      const medianDom = medianSorted(doms);
      const avgPpsf = pps.length ? Math.round(pps.reduce((a, b) => a + b, 0) / pps.length) : 0;

      const { error: statErr } = await supabase.from("real_estate_stats").upsert(
        {
          market_key: m.key,
          median_price_display: formatPrice(medianPrice),
          median_dom_display: medianDom ? String(medianDom) : "—",
          active_listings_display: String(rows.length),
          avg_price_per_sqft_display: avgPpsf ? `$${avgPpsf}` : "—",
          price_subtext: "Median · active listings",
          dom_subtext: "Median days on Redfin",
          listings_subtext: "Homes for sale (sample)",
          ratio_subtext: "Avg $/sqft",
          fetched_at: now,
        },
        { onConflict: "market_key" },
      );
      if (statErr) throw new Error(statErr.message);

      markets.push({ key: m.key, inserted: rows.length });
    } catch (e) {
      markets.push({
        key: m.key,
        inserted: 0,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return { markets };
}
