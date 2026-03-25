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
  {
    price: string;
    priceChg: string;
    dom: string;
    domChg: string;
    listings: string;
    listChg: string;
    ratio: string;
    ratioChg: string;
  }
> = {
  hhi: {
    price: "$748K",
    priceChg: "+4.2% YoY",
    dom: "38",
    domChg: "5 days faster",
    listings: "142",
    listChg: "+12 this month",
    ratio: "98.4%",
    ratioChg: "Strong demand",
  },
  bluffton: {
    price: "$465K",
    priceChg: "+2.8% YoY",
    dom: "44",
    domChg: "Stable",
    listings: "98",
    listChg: "+7 this month",
    ratio: "97.1%",
    ratioChg: "Healthy market",
  },
  beaufort: {
    price: "$312K",
    priceChg: "+5.1% YoY",
    dom: "51",
    domChg: "3 days slower",
    listings: "64",
    listChg: "Low inventory",
    ratio: "96.8%",
    ratioChg: "Balanced",
  },
  savannah: {
    price: "$398K",
    priceChg: "+6.4% YoY",
    dom: "35",
    domChg: "8 days faster",
    listings: "211",
    listChg: "+28 this month",
    ratio: "99.2%",
    ratioChg: "Very competitive",
  },
};

const statCards: {
  key: keyof (typeof markets)["hhi"];
  chgKey: keyof (typeof markets)["hhi"];
  label: string;
}[] = [
  { key: "price", chgKey: "priceChg", label: "Median sale price" },
  { key: "dom", chgKey: "domChg", label: "Avg. days on market" },
  { key: "listings", chgKey: "listChg", label: "Active listings" },
  { key: "ratio", chgKey: "ratioChg", label: "List-to-sale ratio" },
];

const listings = [
  {
    type: "Single family",
    price: "$1,250,000",
    address: "47 Calibogue Cay Rd, HHI",
    detail: "4 bed · 3 bath · 2,840 sqft",
  },
  {
    type: "Townhome",
    price: "$549,000",
    address: "12 Marshview Court, HHI",
    detail: "3 bed · 2.5 bath · 1,920 sqft",
  },
  {
    type: "Condo",
    price: "$389,000",
    address: "Sea Pines Villa #204, HHI",
    detail: "2 bed · 2 bath · 1,100 sqft",
  },
];

export function RealEstateSection() {
  const [active, setActive] = useState<MarketKey>("hhi");
  const m = markets[active];

  return (
    <section className="bg-spotlight-sand px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
              Market report ·{" "}
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
              Real estate <em className="font-normal italic text-spotlight-teal">Snapshot</em>
            </h2>
          </div>
          <Link
            href="/real-estate"
            className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
          >
            Full reports →
          </Link>
        </div>

        <div className="mb-2 flex flex-wrap gap-0 border-b border-spotlight-navy/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-[10px] font-normal uppercase tracking-[0.14em] transition-colors min-[601px]:px-6 ${
                active === t.key
                  ? "border-spotlight-gold text-spotlight-navy"
                  : "border-transparent text-spotlight-teal/50 hover:text-spotlight-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mb-0.5 grid grid-cols-1 gap-0.5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-4">
          {statCards.map((s) => {
            const value = m[s.key];
            const change = m[s.chgKey];
            const neg = change.includes("slower") || change.toLowerCase().includes("low inventory");
            const pos =
              change.startsWith("+") ||
              change.includes("faster") ||
              change.includes("Strong") ||
              change.includes("competitive") ||
              change.includes("Healthy") ||
              change.includes("Balanced");
            return (
              <div
                key={s.label}
                className="cursor-pointer border-b-[3px] border-b-transparent bg-white px-6 py-7 transition-colors hover:border-b-spotlight-gold"
              >
                <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-teal/55">
                  {s.label}
                </p>
                <p className="mb-1.5 font-serif text-[40px] font-bold leading-none text-spotlight-navy">
                  {value}
                </p>
                <p
                  className={`text-[11px] font-light tracking-[0.04em] ${
                    neg ? "text-[#c07070]" : pos ? "text-[#5a8a6a]" : "text-spotlight-text-muted"
                  }`}
                >
                  {change}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-0.5 min-[601px]:grid-cols-3">
          {listings.map((l) => (
            <div
              key={l.address}
              className="cursor-pointer border-t-2 border-t-transparent bg-white px-6 py-6 transition-colors hover:border-t-spotlight-teal"
            >
              <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-teal/50">
                {l.type}
              </p>
              <p className="mb-1.5 font-serif text-[32px] font-bold text-spotlight-navy">{l.price}</p>
              <p className="mb-2 text-[13px] font-light tracking-[0.02em] text-[#5a6880]">
                {l.address}
              </p>
              <p className="border-t border-spotlight-sand pt-2.5 text-[11px] font-light tracking-[0.04em] text-[#9aa0ab]">
                {l.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
