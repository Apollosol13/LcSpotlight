"use client";

import { useCallback, useState } from "react";

type Props = {
  shareTitle: string;
  websiteHref: string | null;
};

export function ThingsToDoDetailActions({ shareTitle, websiteHref }: Props) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: shareTitle, url });
        return;
      }
    } catch {
      /* user cancelled or share failed */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareTitle]);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {websiteHref ? (
        <a
          href={websiteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/15 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Website
        </a>
      ) : null}
      <button
        type="button"
        onClick={share}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-white/40 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        aria-label="Share"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
      {copied ? (
        <span className="text-[10px] font-medium uppercase tracking-wide text-white/80">Link copied</span>
      ) : null}
    </div>
  );
}
