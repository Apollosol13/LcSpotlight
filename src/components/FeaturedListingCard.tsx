"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { redfinPhotoUrlCandidates } from "@/lib/redfin-photo";

export type FeaturedListing = {
  id: string;
  price: string;
  address: string;
  specs: string;
  href: string | null;
  photoUrl: string | null;
  sourceListingId: string | null;
  propertyType: string | null;
  area: string | null;
};

export function FeaturedListingCard({ listing: l }: { listing: FeaturedListing }) {
  const candidates = useMemo(
    () => redfinPhotoUrlCandidates(l.photoUrl, l.sourceListingId),
    [l.photoUrl, l.sourceListingId],
  );
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] ?? null;

  const card = (
    <div className="group overflow-hidden rounded-lg border border-[rgba(12,27,51,0.06)] bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(12,27,51,0.1)]">
      {/* Photo */}
      <div className="relative h-[200px] w-full overflow-hidden bg-[#e8e4dc]">
        {src ? (
          <Image
            key={src}
            src={src}
            alt={l.address}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
            unoptimized
            onError={() => setIdx((i) => i + 1)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-spotlight-text-muted/40">
            Photo on Redfin
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {l.propertyType && (
            <span className="rounded-[3px] bg-spotlight-navy/80 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.8px] text-white/90 backdrop-blur-sm">
              {l.propertyType}
            </span>
          )}
          {l.area && (
            <span className="rounded-[3px] bg-spotlight-gold/90 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.8px] text-spotlight-navy backdrop-blur-sm">
              {l.area}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="mb-1 font-serif text-[22px] font-bold leading-tight text-spotlight-navy">
          {l.price}
        </p>
        <p className="mb-1.5 truncate text-[12px] text-spotlight-text-mid">
          {l.address}
        </p>
        {l.specs && (
          <p className="text-[11px] text-spotlight-text-muted">{l.specs}</p>
        )}
      </div>
    </div>
  );

  if (l.href) {
    return (
      <a
        href={l.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline"
      >
        {card}
      </a>
    );
  }

  return card;
}
