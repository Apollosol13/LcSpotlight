/**
 * Redfin GIS → Supabase upsert + soft-remove for off-market listings.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";
import {
  parseStingrayJson,
  pickLatLong,
  pickNum,
  pickStr,
  redfinThumbnailUrl,
  uiPropertyLabel,
  type RedfinHome,
} from "@/lib/redfin-gis";

const GIS_URL = "https://www.redfin.com/stingray/api/gis";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchHomesForRegion(regionId: number): Promise<RedfinHome[]> {
  const url = new URL(GIS_URL);
  url.searchParams.set("al", "1");
  url.searchParams.set("num_homes", "0");
  url.searchParams.set("region_id", String(regionId));
  url.searchParams.set("region_type", "6");
  url.searchParams.set("v", "8");
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

function homeToRow(marketKey: string, h: RedfinHome): Record<string, unknown> | null {
  const propertyId = typeof h.propertyId === "number" ? h.propertyId : null;
  if (propertyId == null) return null;

  const listingId = h.listingId;
  const sourceListingId =
    typeof listingId === "number" || typeof listingId === "string"
      ? String(listingId)
      : String(propertyId);

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

  const propertyTypeCode = typeof h.propertyType === "number" ? h.propertyType : null;

  const now = new Date().toISOString();

  return {
    market_key: marketKey,
    redfin_property_id: propertyId,
    source_listing_id: sourceListingId,
    price: price ?? null,
    beds: typeof h.beds === "number" ? h.beds : null,
    baths: typeof h.baths === "number" ? h.baths : null,
    sqft: sqft ?? null,
    lot_size_sqft: pickNum(h.lotSize) ?? null,
    dom,
    property_type: uiPropertyLabel(h.uiPropertyType),
    property_type_code: propertyTypeCode,
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
    last_seen_at: now,
    removed_at: null,
    updated_at: now,
  };
}

async function markRemovedStale(
  supabase: SupabaseClient,
  marketKey: string,
  activePropertyIds: Set<number>,
): Promise<number> {
  const { data: rows, error } = await supabase
    .from("real_estate_listings")
    .select("id, redfin_property_id")
    .eq("market_key", marketKey)
    .is("removed_at", null)
    .not("redfin_property_id", "is", null);

  if (error) throw new Error(error.message);

  const now = new Date().toISOString();
  const staleIds = (rows ?? [])
    .filter(
      (r) =>
        typeof r.redfin_property_id === "number" && !activePropertyIds.has(r.redfin_property_id),
    )
    .map((r) => r.id as string);

  for (const part of chunk(staleIds, 80)) {
    const { error: uErr } = await supabase
      .from("real_estate_listings")
      .update({ removed_at: now, updated_at: now })
      .in("id", part);
    if (uErr) throw new Error(uErr.message);
  }

  return staleIds.length;
}

export async function syncRedfinListings(supabase: SupabaseClient): Promise<{
  markets: { key: string; upserted: number; markedRemoved: number; error?: string }[];
}> {
  const markets: { key: string; upserted: number; markedRemoved: number; error?: string }[] = [];

  for (const m of REAL_ESTATE_MARKETS) {
    try {
      const homes = await fetchHomesForRegion(m.regionId);
      const rows: Record<string, unknown>[] = [];
      const activeIds = new Set<number>();

      for (const h of homes) {
        const row = homeToRow(m.key, h);
        if (row) {
          rows.push(row);
          activeIds.add(row.redfin_property_id as number);
        }
      }

      for (const part of chunk(rows, 100)) {
        const { error } = await supabase.from("real_estate_listings").upsert(part, {
          onConflict: "market_key,redfin_property_id",
        });
        if (error) throw new Error(error.message);
      }

      const markedRemoved = await markRemovedStale(supabase, m.key, activeIds);

      markets.push({ key: m.key, upserted: rows.length, markedRemoved });
    } catch (e) {
      markets.push({
        key: m.key,
        upserted: 0,
        markedRemoved: 0,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return { markets };
}
