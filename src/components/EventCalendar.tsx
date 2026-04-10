"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CalEvent {
  id: string;
  name: string;
  day: string;
  month: string;
  time: string | null;
  location: string | null;
  category: string | null;
  price: string | null;
  bg: string | null;
  cta: string | null;
  source_url: string | null;
  image_url: string | null;
  start_at: string | null;
  source: string | null;
}

type Area = "all" | "hilton-head" | "bluffton" | "beaufort" | "savannah";

const AREAS: { key: Area; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hilton-head", label: "Hilton Head" },
  { key: "bluffton", label: "Bluffton" },
  { key: "beaufort", label: "Beaufort" },
  { key: "savannah", label: "Savannah" },
];

function eventArea(ev: CalEvent): Area {
  const s = (ev.source ?? "").toLowerCase();
  const loc = (ev.location ?? "").toLowerCase();
  if (s.includes("hiltonhead") || loc.includes("hilton head")) return "hilton-head";
  if (s.includes("bluffton") || loc.includes("bluffton")) return "bluffton";
  if (s.includes("beaufort") || loc.includes("beaufort")) return "beaufort";
  if (s.includes("savannah") || loc.includes("savannah")) return "savannah";
  return "hilton-head";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

const PILL_COLORS: Record<string, string> = {
  "live music": "bg-purple-600/80 text-white",
  comedy: "bg-rose-600/80 text-white",
  theatre: "bg-pink-600/80 text-white",
  art: "bg-amber-600/80 text-white",
  exhibit: "bg-amber-500/80 text-white",
  golf: "bg-green-600/80 text-white",
  educational: "bg-sky-600/80 text-white",
  tour: "bg-teal-600/80 text-white",
  outdoors: "bg-emerald-600/80 text-white",
  entertainment: "bg-indigo-600/80 text-white",
  restaurant: "bg-orange-600/80 text-white",
  "farmers market": "bg-lime-600/80 text-white",
  shopping: "bg-fuchsia-600/80 text-white",
  trivia: "bg-violet-600/80 text-white",
  magic: "bg-red-600/80 text-white",
  sports: "bg-cyan-600/80 text-white",
  classes: "bg-blue-600/80 text-white",
  fundraiser: "bg-rose-500/80 text-white",
};

function pillClass(category: string | null): string {
  if (!category) return "bg-spotlight-navy/70 text-white";
  const key = category.toLowerCase().replace(/-\d+$/, "").replace(/-/g, " ");
  return PILL_COLORS[key] ?? "bg-spotlight-navy/70 text-white";
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState<Area>("all");
  const [expanded, setExpanded] = useState<CalEvent | null>(null);
  const [dayDetail, setDayDetail] = useState<{ date: string; events: CalEvent[] } | null>(null);
  const [mobileDay, setMobileDay] = useState<string | null>(null);

  const fetchEvents = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/month?year=${y}&month=${m}`);
      const json = await res.json();
      setEvents(json.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(year, month);
  }, [year, month, fetchEvents]);

  const prev = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  const filteredEvents = useMemo(() => {
    if (area === "all") return events;
    return events.filter((e) => eventArea(e) === area);
  }, [events, area]);

  const areaCounts = useMemo(() => {
    const counts: Record<Area, number> = { all: events.length, "hilton-head": 0, bluffton: 0, beaufort: 0, savannah: 0 };
    for (const e of events) {
      const a = eventArea(e);
      counts[a]++;
    }
    return counts;
  }, [events]);

  /* Group events by YYYY-MM-DD */
  const grouped = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const e of filteredEvents) {
      if (!e.start_at) continue;
      const d = new Date(e.start_at);
      if (Number.isNaN(d.getTime())) continue;
      const k = dateKey(d);
      (map[k] ??= []).push(e);
    }
    return map;
  }, [filteredEvents]);

  /* Build the grid of 6-row x 7-col dates */
  const calendarDays = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = new Date(year, month - 1, 1 - startOffset + i);
      days.push({ date: d, inMonth: d.getMonth() === month - 1 });
    }
    return days;
  }, [year, month]);

  const todayKey = dateKey(now);

  /* Mobile: sorted list of days with events */
  const mobileDays = useMemo(() => {
    const keys = Object.keys(grouped).sort();
    return keys.filter((k) => {
      const d = new Date(k + "T12:00:00");
      return d.getMonth() === month - 1 && d.getFullYear() === year;
    });
  }, [grouped, month, year]);

  return (
    <div>
      {/* Month nav */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(12,27,51,0.12)] bg-white text-spotlight-navy transition hover:bg-spotlight-navy hover:text-spotlight-gold"
          aria-label="Previous month"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="font-serif text-2xl font-normal text-spotlight-navy">
          {MONTH_NAMES[month - 1]} <span className="text-spotlight-gold">{year}</span>
        </h2>
        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(12,27,51,0.12)] bg-white text-spotlight-navy transition hover:bg-spotlight-navy hover:text-spotlight-gold"
          aria-label="Next month"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Area filter tabs */}
      <div className="-mx-5 mb-5 overflow-x-auto px-5 min-[601px]:mx-0 min-[601px]:px-0">
        <div className="flex items-center gap-2 min-[601px]:flex-wrap min-[601px]:justify-center">
          {AREAS.map(({ key, label }) => {
            const count = areaCounts[key];
            const active = area === key;
            return (
              <button
                key={key}
                onClick={() => { setArea(key); setMobileDay(null); }}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[1px] transition ${
                  active
                    ? "border-spotlight-navy bg-spotlight-navy text-spotlight-gold"
                    : "border-[rgba(12,27,51,0.15)] bg-white text-spotlight-text-mid hover:border-spotlight-navy/40 hover:text-spotlight-navy"
                }`}
              >
                {label}
                {!loading && (
                  <span className={`ml-1.5 ${active ? "text-spotlight-gold/70" : "text-spotlight-text-muted"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotlight-gold border-t-transparent" />
        </div>
      )}

      {/* Desktop calendar grid */}
      {!loading && (
        <div className="hidden min-[768px]:block">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[rgba(12,27,51,0.1)]">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-medium uppercase tracking-[1.5px] text-spotlight-text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map(({ date, inMonth }, i) => {
              const key = dateKey(date);
              const dayEvents = grouped[key] ?? [];
              const isToday = key === todayKey;
              const maxShow = 3;
              const overflow = dayEvents.length - maxShow;

              return (
                <div
                  key={i}
                  className={`min-h-[110px] border-b border-r border-[rgba(12,27,51,0.06)] p-1.5 transition ${
                    !inMonth ? "bg-[#f8f5f0]/50" : "bg-white"
                  } ${isToday ? "ring-2 ring-inset ring-spotlight-gold/50" : ""}`}
                >
                  <div className={`mb-1 text-right text-[12px] font-medium ${
                    !inMonth
                      ? "text-spotlight-text-muted/40"
                      : isToday
                        ? "font-bold text-spotlight-gold"
                        : "text-spotlight-text-mid"
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    {dayEvents.slice(0, maxShow).map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setExpanded(ev)}
                        className={`w-full truncate rounded-[3px] px-1.5 py-[2px] text-left text-[10px] leading-tight transition hover:brightness-110 ${pillClass(ev.category)}`}
                        title={ev.name}
                      >
                        {ev.name}
                      </button>
                    ))}
                    {overflow > 0 && (
                      <button
                        onClick={() => setDayDetail({ date: key, events: dayEvents })}
                        className="text-left text-[10px] font-medium text-spotlight-teal hover:underline"
                      >
                        +{overflow} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile list view */}
      {!loading && (
        <div className="min-[768px]:hidden">
          {mobileDays.length === 0 && (
            <p className="py-12 text-center text-sm text-spotlight-text-muted">
              No events this month.
            </p>
          )}
          {mobileDays.map((dayKey) => {
            const d = new Date(dayKey + "T12:00:00");
            const dayEvents = grouped[dayKey] ?? [];
            const isToday = dayKey === todayKey;

            return (
              <div key={dayKey} className="mb-6">
                {/* Sticky date header */}
                <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-3 bg-spotlight-cream/95 px-1 py-2 backdrop-blur-sm">
                  <div
                    className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl ${
                      isToday
                        ? "bg-spotlight-gold text-spotlight-navy shadow-[0_2px_8px_rgba(196,164,105,0.4)]"
                        : "bg-spotlight-navy text-white"
                    }`}
                  >
                    <span className="font-serif text-[18px] font-bold leading-none">
                      {d.getDate()}
                    </span>
                    <span className="mt-0.5 text-[8px] font-medium uppercase tracking-[1px] opacity-70">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-spotlight-navy">
                      {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-[11px] text-spotlight-text-muted">
                      {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Event cards for this day */}
                <div className="flex flex-col gap-2.5 pl-2">
                  {dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setExpanded(ev)}
                      className="group flex items-start gap-3 rounded-xl border border-[rgba(12,27,51,0.06)] bg-white p-4 text-left shadow-[0_1px_3px_rgba(12,27,51,0.04)] transition-all active:scale-[0.98] active:shadow-none"
                    >
                      {/* Category color bar */}
                      <div
                        className={`mt-0.5 h-10 w-1 shrink-0 rounded-full ${pillClass(ev.category).split(" ")[0]}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[14px] font-semibold leading-snug text-spotlight-navy">
                          {ev.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-spotlight-text-muted">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-spotlight-gold"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {ev.time ?? "All day"}
                          </span>
                          {ev.location && (
                            <>
                              <span className="text-spotlight-text-muted/30">·</span>
                              <span className="flex items-center gap-1 truncate">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-spotlight-gold"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span className="truncate">{ev.location}</span>
                              </span>
                            </>
                          )}
                        </div>
                        {ev.category && (
                          <div className="mt-2">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.8px] ${pillClass(ev.category)}`}
                            >
                              {ev.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="mt-1 shrink-0 text-spotlight-text-muted/30"
                      >
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day detail modal — all events for a given date */}
      {dayDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setDayDetail(null)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-4"
              style={{ background: "linear-gradient(135deg, #112250, #1E3A6E)" }}
            >
              <h3 className="font-serif text-xl text-white">
                {new Date(dayDetail.date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <button
                onClick={() => setDayDetail(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Scrollable event list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="flex flex-col gap-2">
                {dayDetail.events.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => { setDayDetail(null); setExpanded(ev); }}
                    className="flex items-start gap-3 rounded-lg border border-[rgba(12,27,51,0.08)] bg-white p-3.5 text-left transition hover:border-spotlight-gold/40 hover:shadow-md"
                  >
                    <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${pillClass(ev.category).split(" ")[0]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-spotlight-navy">{ev.name}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-spotlight-text-muted">
                        {ev.time && <span>{ev.time}</span>}
                        {ev.location && <span>{ev.location}</span>}
                        {ev.category && (
                          <span className={`inline-block rounded-[3px] px-1.5 py-[1px] text-[9px] uppercase tracking-[0.5px] ${pillClass(ev.category)}`}>
                            {ev.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 shrink-0 text-spotlight-text-muted/50"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer count */}
            <div className="shrink-0 border-t border-[rgba(12,27,51,0.08)] px-5 py-3 text-center text-[11px] text-spotlight-text-muted">
              {dayDetail.events.length} event{dayDetail.events.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colored header */}
            <div
              className="flex items-end justify-between px-5 pb-4 pt-5"
              style={{ background: "linear-gradient(135deg, #112250, #1E3A6E)" }}
            >
              <div className="min-w-0 flex-1 pr-4">
                {expanded.category && (
                  <span className={`mb-2 inline-block rounded-[3px] px-2 py-0.5 text-[10px] uppercase tracking-[1px] ${pillClass(expanded.category)}`}>
                    {expanded.category}
                  </span>
                )}
                <h3 className="font-serif text-xl leading-snug text-white">
                  {expanded.name}
                </h3>
              </div>
              <button
                onClick={() => setExpanded(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 px-5 py-5">
              {expanded.start_at && (
                <div className="flex items-center gap-2 text-sm text-spotlight-text-mid">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-spotlight-gold"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(expanded.start_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
              )}
              {expanded.time && (
                <div className="flex items-center gap-2 text-sm text-spotlight-text-mid">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-spotlight-gold"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {expanded.time}
                </div>
              )}
              {expanded.location && (
                <div className="flex items-center gap-2 text-sm text-spotlight-text-mid">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-spotlight-gold"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {expanded.location}
                </div>
              )}
              {expanded.price && (
                <div className="flex items-center gap-2 text-sm font-medium text-spotlight-teal">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  {expanded.price}
                </div>
              )}
            </div>

            {/* CTA */}
            {expanded.source_url && (
              <div className="border-t border-[rgba(12,27,51,0.08)] px-5 py-4">
                <a
                  href={expanded.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 bg-spotlight-navy px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-spotlight-gold no-underline transition hover:bg-spotlight-teal"
                >
                  {expanded.cta ?? "More info"} →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
