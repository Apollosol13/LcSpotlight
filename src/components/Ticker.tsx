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
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-10 text-xs font-medium uppercase tracking-[0.5px] text-spotlight-gold">
            {text}
          </span>
          <span className="mx-5 inline-block size-1 shrink-0 rounded-full bg-spotlight-gold/35" />
        </span>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div
      className="overflow-hidden border-y border-spotlight-gold/20 bg-spotlight-teal py-2"
      aria-hidden="true"
    >
      <div className="inline-flex animate-[ticker_30s_linear_infinite]">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}
