const items = [
  "Jazz & Wine Festival — April 5",
  "New Opening: The Marsh House Brasserie",
  "30% Off Kayak Tours This Weekend",
  "Beaufort Market Hits 3-Year Low Inventory",
  "Community Playhouse Spring Season Tickets On Sale",
  "Sweet Perks Ice Cream Opens on Coligny",
];

function TickerRow() {
  return (
    <>
      {items.map((text, i) => (
        <span key={i} className="inline-flex shrink-0 items-center gap-3 px-7">
          <span
            className="size-[3px] shrink-0 rounded-full bg-spotlight-gold/40"
            aria-hidden
          />
          <span className="whitespace-nowrap text-[10px] font-normal uppercase tracking-[0.14em] text-spotlight-cream/55">
            {text}
          </span>
        </span>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div
      className="h-10 overflow-hidden border-t border-spotlight-gold/10 bg-spotlight-navy"
      aria-hidden="true"
    >
      <div className="inline-flex h-full items-center animate-mag-tick">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}
