"use client";

import Link from "next/link";
import { useState } from "react";

type MarketKey = "hhi" | "bluffton" | "beaufort" | "savannah";

const tabs: { key: MarketKey; label: string }[] = [
  { key: "hhi", label: "Hilton Head" },
  { key: "bluffton", label: "Bluffton" },
  { key: "beaufort", label: "Beaufort" },
  { key: "savannah", label: "Savannah" },
];

const markets: Record<
  MarketKey,
  { price: string; priceChg: string; dom: string; domChg: string; listings: string; listChg: string; ratio: string; ratioChg: string }
> = {
  hhi: { price: "$748K", priceChg: "+4.2% YoY", dom: "38", domChg: "5 days faster", listings: "142", listChg: "+12 this month", ratio: "98.4%", ratioChg: "Strong demand" },
  bluffton: { price: "$465K", priceChg: "+2.8% YoY", dom: "44", domChg: "Stable", listings: "98", listChg: "+7 this month", ratio: "97.1%", ratioChg: "Healthy market" },
  beaufort: { price: "$312K", priceChg: "+5.1% YoY", dom: "51", domChg: "3 days slower", listings: "64", listChg: "Low inventory", ratio: "96.8%", ratioChg: "Balanced" },
  savannah: { price: "$398K", priceChg: "+6.4% YoY", dom: "35", domChg: "8 days faster", listings: "211", listChg: "+28 this month", ratio: "99.2%", ratioChg: "Very competitive" },
};

const statCards: { key: keyof (typeof markets)["hhi"]; chgKey: keyof (typeof markets)["hhi"]; label: string }[] = [
  { key: "price", chgKey: "priceChg", label: "Median Sale Price" },
  { key: "dom", chgKey: "domChg", label: "Avg. Days on Market" },
  { key: "listings", chgKey: "listChg", label: "Active Listings" },
  { key: "ratio", chgKey: "ratioChg", label: "List-to-Sale Ratio" },
];

const listings = [
  { type: "Single Family", price: "$1,250,000", address: "47 Calibogue Cay Rd, HHI", specs: ["4 bed", "3 bath", "2,840 sqft"] },
  { type: "Townhome", price: "$549,000", address: "12 Marshview Court, HHI", specs: ["3 bed", "2.5 bath", "1,920 sqft"] },
  { type: "Condo", price: "$389,000", address: "Sea Pines Villa #204, HHI", specs: ["2 bed", "2 bath", "1,100 sqft"] },
];

export function RealEstateSection() {
  const [active, setActive] = useState<MarketKey>("hhi");
  const m = markets[active];

  return (
    <section className="bg-spotlight-navy py-16">
      <div className="mx-auto max-w-[1200px] px-5 min-[601px]:px-10">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-gold">
          Market Report · March 2026
        </p>
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-[32px] font-normal text-white">
            Real Estate{" "}
            <em className="italic text-spotlight-gold">Snapshot</em>
          </h2>
          <Link
            href="/real-estate"
            className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline transition-colors hover:underline"
          >
            Full reports
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-9 flex border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`-mb-px border-b-2 px-6 py-3 text-[13px] font-normal uppercase tracking-[0.5px] transition-colors ${
                active === t.key
                  ? "border-spotlight-gold text-spotlight-gold"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="mb-9 grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-4">
          {statCards.map((s) => {
            const value = m[s.key];
            const change = m[s.chgKey];
            const c = change.toLowerCase();
            const isUp =
              change.startsWith("+") ||
              c.includes("faster") ||
              c.includes("strong") ||
              c.includes("competitive") ||
              c.includes("healthy market");
            const isDown =
              c.includes("slower") ||
              (c.includes("inventory") && c.includes("low"));
            return (
              <div
                key={s.label}
                className="rounded border border-white/[0.08] bg-white/5 p-6"
              >
                <p className="mb-3 text-[11px] font-normal uppercase tracking-[1.5px] text-white/40">
                  {s.label}
                </p>
                <p className="mb-2 font-serif text-[32px] font-normal text-white">
                  {value}
                </p>
                <p
                  className={`flex items-center gap-1 text-[13px] ${
                    isUp
                      ? "text-[#4dcfc4]"
                      : isDown
                        ? "text-[#f08070]"
                        : "text-white/50"
                  }`}
                >
                  {change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Listings */}
        <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
          {listings.map((l) => (
            <div
              key={l.address}
              className="cursor-pointer overflow-hidden rounded border border-white/[0.08] bg-white/[0.04] transition-colors hover:border-[rgba(201,168,76,0.4)]"
            >
              <div className="relative flex h-40 items-center justify-center bg-white/5">
                <span className="absolute bottom-3 left-3 rounded-[2px] bg-spotlight-gold px-2 py-[3px] text-[10px] font-medium uppercase tracking-[1px] text-spotlight-navy">
                  {l.type}
                </span>
              </div>
              <div className="p-[18px]">
                <p className="mb-1 font-serif text-[22px] text-white">
                  {l.price}
                </p>
                <p className="mb-3 text-[13px] text-white/50">{l.address}</p>
                <div className="flex gap-4 text-xs text-white/40">
                  {l.specs.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
