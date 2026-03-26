import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { EventRow } from "@/lib/events/types";
import { eventDetailHref, isExternalEventHref } from "@/lib/events/event-link";

function imageBackground(category: string | null | undefined, bg: string | null | undefined) {
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

function isFreePrice(price: string | null | undefined) {
  if (!price) return false;
  return /\bfree\b/i.test(price);
}

function eventLinkProps(e: Pick<EventRow, "source_url">) {
  const href = eventDetailHref(e);
  const ext = isExternalEventHref(href);
  return {
    href,
    ...(ext ? { target: "_blank" as const, rel: "noopener noreferrer" as const } : {}),
  };
}

function EventHeroVisual({
  e,
  className,
  minH,
}: {
  e: Pick<EventRow, "category" | "bg" | "image_url">;
  className?: string;
  minH: string;
}) {
  const hasImg = Boolean(e.image_url?.trim());
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        className={`relative flex items-start justify-end p-4 transition-transform duration-300 group-hover:scale-[1.03] ${minH}`}
      >
        {hasImg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={e.image_url!}
              alt=""
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(17,34,80,0.5)] to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0 z-0"
            style={{ background: imageBackground(e.category, e.bg) }}
          />
        )}
        {e.category && (
          <span className="relative z-[2] border border-spotlight-cream/20 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-spotlight-cream/60">
            {e.category}
          </span>
        )}
      </div>
    </div>
  );
}

export async function EventsSection() {
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(4);

  const list = (events ?? []) as EventRow[];
  const [featured, second, third, fourth] = list;

  return (
    <section className="bg-spotlight-cream px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col gap-4 min-[601px]:mb-10 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
              What&apos;s on
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
              Upcoming <em className="font-normal italic text-spotlight-teal">Events</em>
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
          >
            View all events →
          </Link>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-spotlight-text-muted">No upcoming events yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-0.5 lg:grid-cols-[1.4fr_1fr_1fr] lg:grid-rows-[auto_auto]">
            {featured && (
              <Link
                {...eventLinkProps(featured)}
                className="group relative overflow-hidden bg-white transition-transform hover:-translate-y-0.5 lg:row-span-2"
              >
                <div className="relative overflow-hidden">
                  <EventHeroVisual
                    e={featured}
                    minH="min-h-[220px] lg:min-h-[300px]"
                  />
                  <div className="absolute bottom-4 left-4 z-[3] min-w-[52px] bg-spotlight-gold px-3 py-2 text-center text-spotlight-navy">
                    <span className="block font-serif text-[26px] font-bold leading-none">
                      {featured.day}
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.1em]">
                      {featured.month}
                    </span>
                  </div>
                </div>
                <div className="px-[22px] pb-[22px] pt-5">
                  <h3 className="mb-2 font-serif text-2xl font-bold leading-tight text-spotlight-navy">
                    {featured.name}
                  </h3>
                  <div className="mb-3 text-[11px] font-light tracking-[0.03em] text-[#8a96a8]">
                    {featured.location && <span>{featured.location}</span>}
                    {featured.location && featured.time && <span> · </span>}
                    {featured.time && <span>{featured.time}</span>}
                  </div>
                  {featured.price && (
                    <p
                      className={`border-t border-spotlight-sand pt-2.5 text-[11px] font-medium tracking-[0.06em] text-spotlight-teal ${isFreePrice(featured.price) ? "text-[#5a8a6a]" : ""}`}
                    >
                      {featured.price}
                    </p>
                  )}
                  {isExternalEventHref(eventDetailHref(featured)) && (
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-spotlight-teal/80">
                      Open listing ↗
                    </p>
                  )}
                </div>
              </Link>
            )}

            {second && <EventCardSmall e={second} className="lg:col-start-2 lg:row-start-1" />}
            {third && <EventCardSmall e={third} className="lg:col-start-3 lg:row-start-1" />}

            {fourth && (
              <Link
                {...eventLinkProps(fourth)}
                className="group relative overflow-hidden bg-white transition-transform hover:-translate-y-0.5 lg:col-span-2 lg:col-start-2 lg:row-start-2"
              >
                <div className="grid lg:grid-cols-2">
                  <div className="relative h-full min-h-[140px]">
                    <EventHeroVisual e={fourth} minH="h-[140px] min-h-[140px] lg:h-full lg:min-h-[140px]" />
                    <div className="absolute left-4 top-3 z-[3] min-w-[52px] bg-spotlight-gold px-3 py-2 text-center text-spotlight-navy">
                      <span className="block font-serif text-[26px] font-bold leading-none">
                        {fourth.day}
                      </span>
                      <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.1em]">
                        {fourth.month}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center px-[22px] py-5 lg:py-6">
                    <h3 className="mb-2 font-serif text-[19px] font-bold leading-tight text-spotlight-navy">
                      {fourth.name}
                    </h3>
                    <div className="mb-3 text-[11px] font-light tracking-[0.03em] text-[#8a96a8]">
                      {fourth.location && <span>{fourth.location}</span>}
                      {fourth.location && fourth.time && <span> · </span>}
                      {fourth.time && <span>{fourth.time}</span>}
                    </div>
                    {fourth.price && (
                      <p
                        className={`border-t border-spotlight-sand pt-2.5 text-[11px] font-medium tracking-[0.06em] text-spotlight-teal ${isFreePrice(fourth.price) ? "text-[#5a8a6a]" : ""}`}
                      >
                        {fourth.price}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function EventCardSmall({ e, className }: { e: EventRow; className?: string }) {
  return (
    <Link
      {...eventLinkProps(e)}
      className={`group relative overflow-hidden bg-white transition-transform hover:-translate-y-0.5 ${className ?? ""}`}
    >
      <div className="relative overflow-hidden">
        <EventHeroVisual e={e} minH="h-[220px]" />
        <div className="absolute bottom-4 left-4 z-[3] min-w-[52px] bg-spotlight-gold px-3 py-2 text-center text-spotlight-navy">
          <span className="block font-serif text-[26px] font-bold leading-none">{e.day}</span>
          <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.1em]">
            {e.month}
          </span>
        </div>
      </div>
      <div className="px-[22px] pb-[22px] pt-5">
        <h3 className="mb-2 font-serif text-[19px] font-bold leading-tight text-spotlight-navy">
          {e.name}
        </h3>
        <div className="mb-3 text-[11px] font-light tracking-[0.03em] text-[#8a96a8]">
          {e.location && <span>{e.location}</span>}
          {e.location && e.time && <span> · </span>}
          {e.time && <span>{e.time}</span>}
        </div>
        {e.price && (
          <p
            className={`border-t border-spotlight-sand pt-2.5 text-[11px] font-medium tracking-[0.06em] text-spotlight-teal ${isFreePrice(e.price) ? "text-[#5a8a6a]" : ""}`}
          >
            {e.price}
          </p>
        )}
      </div>
    </Link>
  );
}
