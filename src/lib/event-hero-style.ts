import type { CSSProperties } from "react";

/** Card hero background when no photo: solid `bg` or category tint gradients (matches homepage). */
export function gradientFallback(
  category: string | null | undefined,
  bg: string | null | undefined,
): string {
  if (bg) return bg;
  const c = (category || "").toLowerCase();
  if (c.includes("outdoor") || c.includes("nature") || c.includes("coastal"))
    return "linear-gradient(135deg,#1A3A2A,#2D5A3D)";
  if (
    c.includes("food") ||
    c.includes("drink") ||
    c.includes("wine") ||
    c.includes("tasting")
  )
    return "linear-gradient(135deg,#2A1A2E,#4A2060)";
  if (c.includes("well") || c.includes("health") || c.includes("walk"))
    return "linear-gradient(135deg,#1A2A3A,#2A4060)";
  return "linear-gradient(135deg,#112250,#1E3A6E)";
}

/** Hero strip: optional cover photo with gradient overlay, else color/gradient fallback. */
export function eventHeroStyle(
  imageUrl: string | null | undefined,
  category: string | null | undefined,
  bg: string | null | undefined,
): CSSProperties {
  const trimmed = imageUrl?.trim();
  if (trimmed) {
    return {
      backgroundImage: `linear-gradient(to top, rgba(12,27,51,0.75), rgba(12,27,51,0.12)), url(${trimmed})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: gradientFallback(category, bg) };
}
