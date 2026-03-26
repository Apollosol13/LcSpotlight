import type { ReactNode } from "react";
import { isGoogleNewsPlaceholderThumb } from "@/lib/news-thumbnail-url";

/** Default news card art when no remote image or hex color (served from /public). */
export const NEWS_PLACEHOLDER_IMAGE = "/images/news-placeholder-lcspotlight.png";

type Variant = "card" | "featured";

const GRADIENT: Record<Variant, string> = {
  card: "from-[rgba(12,27,51,0.7)]",
  featured: "from-[rgba(17,34,80,0.6)]",
};

/** Softer overlay when showing the light branded placeholder image */
const GRADIENT_PLACEHOLDER: Record<Variant, string> = {
  card: "from-[rgba(12,27,51,0.35)]",
  featured: "from-[rgba(17,34,80,0.3)]",
};

export function parseNewsImageBg(raw: string | null | undefined): {
  kind: "url" | "hex" | "empty";
  value: string;
} {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return { kind: "empty", value: "" };
  if (/^https?:\/\//i.test(s) || s.startsWith("//")) {
    const check = s.startsWith("//") ? `https:${s}` : s;
    if (isGoogleNewsPlaceholderThumb(check)) return { kind: "empty", value: "" };
    return { kind: "url", value: s };
  }
  if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return { kind: "hex", value: s };
  return { kind: "empty", value: "" };
}

type Props = {
  imageBg: string | null | undefined;
  variant?: Variant;
  heightClass: string;
  children?: ReactNode;
};

/**
 * News cards store either a remote image URL or a hex header color in `image_bg`.
 * (RSS/scraper rows may also have null when OG image fetch fails.)
 */
export function NewsArticleHeroImage({
  imageBg,
  variant = "card",
  heightClass,
  children,
}: Props) {
  const { kind, value } = parseNewsImageBg(imageBg);
  const imgSrc = kind === "url" && value.startsWith("//") ? `https:${value}` : value;

  const showBrandedPlaceholder = kind === "empty";
  const gradientClass = showBrandedPlaceholder ? GRADIENT_PLACEHOLDER[variant] : GRADIENT[variant];

  return (
    <div
      className={`relative overflow-hidden ${heightClass} ${
        kind === "empty" ? "bg-[#f5f0e8]" : ""
      }`}
      style={kind === "hex" ? { backgroundColor: value } : undefined}
    >
      {kind === "url" ? (
        <img src={imgSrc} alt="" className="h-full w-full object-cover" />
      ) : kind === "hex" ? null : (
        <img
          src={NEWS_PLACEHOLDER_IMAGE}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      )}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${gradientClass} to-transparent`}
      />
      {children}
    </div>
  );
}

/** Compact thumbnail for news sidebar rows (URL, hex, or branded placeholder). */
export function NewsThumbSquare({
  imageBg,
  label: _label,
  className = "size-14 shrink-0 overflow-hidden rounded border border-[rgba(17,34,80,0.08)]",
}: {
  imageBg: string | null | undefined;
  label: string;
  className?: string;
}) {
  const { kind, value } = parseNewsImageBg(imageBg);
  const imgSrc = kind === "url" && value.startsWith("//") ? `https:${value}` : value;

  return (
    <div
      className={`relative flex items-center justify-center bg-spotlight-sand ${className}`}
      style={kind === "hex" ? { backgroundColor: value } : undefined}
    >
      {kind === "url" ? (
        <img src={imgSrc} alt="" className="h-full w-full object-cover" />
      ) : kind === "hex" ? null : (
        <img
          src={NEWS_PLACEHOLDER_IMAGE}
          alt=""
          className="h-full w-full object-cover object-left"
        />
      )}
    </div>
  );
}
