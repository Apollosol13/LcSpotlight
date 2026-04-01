/**
 * Redfin Stingray GIS JSON helpers + MLS thumbnail URL builder.
 */

export type RedfinHome = Record<string, unknown>;

export function parseStingrayJson(text: string): unknown {
  const trimmed = text.trim();
  const afterAmp = trimmed.split("&&").pop()?.trim() ?? trimmed;
  const idx = afterAmp.indexOf("{");
  if (idx === -1) throw new Error("Invalid Redfin response");
  return JSON.parse(afterAmp.slice(idx)) as unknown;
}

export function pickNum(obj: unknown): number | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as { level?: number; value?: number };
  if (o.level === 1 && typeof o.value === "number") return o.value;
  return null;
}

export function pickStr(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as { level?: number; value?: string };
  if (o.level === 1 && typeof o.value === "string") return o.value;
  return null;
}

export function pickLatLong(obj: unknown): { lat: number; lon: number } | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as { level?: number; value?: { latitude?: number; longitude?: number } };
  if (o.level !== 1 || !o.value) return null;
  const { latitude, longitude } = o.value;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  return { lat: latitude, lon: longitude };
}

export function uiPropertyLabel(ui: unknown): string {
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

/**
 * Primary MLS photo on Redfin CDN (matches paths embedded on listing pages).
 */
export function redfinThumbnailUrl(h: RedfinHome): string | null {
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
