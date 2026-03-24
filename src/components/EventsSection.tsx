import Link from "next/link";

const events = [
  {
    day: "05",
    month: "Apr",
    category: "Music",
    bg: "#1E3A5F",
    icon: "🎵",
    name: "Hilton Head Jazz & Wine Festival",
    location: "Shelter Cove Marina",
    time: "6:00 PM",
    price: "From $45 · General Admission",
    cta: "Get Tickets",
  },
  {
    day: "12",
    month: "Apr",
    category: "Outdoors",
    bg: "#1A3A2A",
    icon: "🌿",
    name: "Coastal Discovery Museum Plein Air",
    location: "Sea Pines Forest",
    time: "9:00 AM",
    price: "Free Entry",
    cta: "Learn More",
  },
  {
    day: "19",
    month: "Apr",
    category: "Food & Drink",
    bg: "#3A1A2A",
    icon: "🍷",
    name: "Savannah Food & Wine Experience",
    location: "Forsyth Park, Savannah",
    time: "4:00 PM",
    price: "From $75 · Tasting Pass",
    cta: "Get Tickets",
  },
];

export function EventsSection() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-16 min-[601px]:px-10">
      <div className="mb-9 flex items-baseline justify-between border-b border-[rgba(12,27,51,0.1)] pb-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
            What&apos;s On
          </p>
          <h2 className="font-serif text-[32px] font-normal text-spotlight-navy">
            Upcoming <em className="italic text-spotlight-gold">Events</em>
          </h2>
        </div>
        <Link
          href="/events"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline transition-colors hover:underline"
        >
          View All Events →
        </Link>
      </div>

      <div className="grid gap-6 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {events.map((e) => (
          <div
            key={e.name}
            className="cursor-pointer overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(12,27,51,0.1)]"
          >
            <div
              className="relative flex h-[180px] items-center justify-center overflow-hidden"
              style={{ background: e.bg }}
            >
              <span className="absolute text-5xl opacity-15">{e.icon}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,27,51,0.7)] to-transparent" />
              <div className="absolute left-3.5 top-3.5 z-[1] rounded-[2px] bg-spotlight-gold px-2.5 py-1.5 text-center leading-tight text-spotlight-navy">
                <span className="block font-serif text-[22px] font-semibold">
                  {e.day}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-[1px]">
                  {e.month}
                </span>
              </div>
              <span className="absolute right-3.5 top-3.5 z-[1] rounded-[2px] bg-[rgba(12,27,51,0.8)] px-2.5 py-1 text-[10px] uppercase tracking-[1px] text-white/90">
                {e.category}
              </span>
            </div>

            <div className="p-5">
              <h3 className="mb-2 font-serif text-lg font-normal leading-tight text-spotlight-navy">
                {e.name}
              </h3>
              <div className="mb-3.5 flex gap-4 text-xs text-spotlight-text-muted">
                <span className="flex items-center gap-1">📍 {e.location}</span>
                <span className="flex items-center gap-1">🕕 {e.time}</span>
              </div>
              <p className="text-[13px] font-medium text-spotlight-teal">
                {e.price}
              </p>
              <button
                type="button"
                className="mt-3 rounded-[2px] border border-[rgba(12,27,51,0.1)] bg-transparent px-[18px] py-2 text-xs font-medium uppercase tracking-[0.5px] text-spotlight-navy transition-all hover:border-spotlight-navy hover:bg-spotlight-navy hover:text-white"
              >
                {e.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
