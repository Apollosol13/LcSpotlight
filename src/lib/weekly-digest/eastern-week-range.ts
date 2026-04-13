const TZ = "America/New_York";

/** YYYY-MM-DD in America/New_York for instant `d`. */
export function formatEasternYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function easternWeekdayShort(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d);
}

/** First instant (UTC ISO) where Eastern local time is 00:00 on `ymd`. */
export function easternMidnightInstantIso(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const lo = Date.UTC(y, m - 1, d - 1, 0, 0, 0);
  const hi = Date.UTC(y, m - 1, d + 2, 0, 0, 0);
  for (let t = lo; t < hi; t += 60 * 1000) {
    const dt = new Date(t);
    if (formatEasternYmd(dt) !== ymd) continue;
    const hour = parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: TZ,
        hour: "numeric",
        hour12: false,
      }).format(dt),
      10,
    );
    const minute = parseInt(
      new Intl.DateTimeFormat("en-US", { timeZone: TZ, minute: "numeric" }).format(dt),
      10,
    );
    if (hour === 0 && minute === 0) return dt.toISOString();
  }
  throw new Error(`easternMidnightInstantIso: no midnight for ${ymd}`);
}

function addCalendarDaysEastern(ymd: string, delta: number): string {
  if (delta === 0) return ymd;
  const sign = delta > 0 ? 1 : -1;
  let cur = ymd;
  for (let i = 0; i < Math.abs(delta); i++) {
    const start = new Date(easternMidnightInstantIso(cur));
    let t = start.getTime() + sign * 60 * 1000;
    while (true) {
      const nextYmd = formatEasternYmd(new Date(t));
      if (nextYmd !== cur) {
        cur = nextYmd;
        break;
      }
      t += sign * 60 * 1000;
      if (Math.abs(t - start.getTime()) > 50 * 60 * 60 * 1000) {
        throw new Error(`addCalendarDaysEastern stuck at ${cur}`);
      }
    }
  }
  return cur;
}

/**
 * Monday 00:00 Eastern through the following Monday 00:00 Eastern (exclusive),
 * for the Eastern calendar week containing `anchor`.
 */
export function easternWeekRangeContaining(anchor: Date): {
  startIso: string;
  endExclusiveIso: string;
  mondayYmd: string;
} {
  const ymd = formatEasternYmd(anchor);
  const wd = easternWeekdayShort(anchor);
  const offsetFromMonday =
    { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[wd] ?? 0;
  const mondayYmd = addCalendarDaysEastern(ymd, -offsetFromMonday);
  const startIso = easternMidnightInstantIso(mondayYmd);
  const nextMondayYmd = addCalendarDaysEastern(mondayYmd, 7);
  const endExclusiveIso = easternMidnightInstantIso(nextMondayYmd);
  return { startIso, endExclusiveIso, mondayYmd };
}

/** Human-readable range for the digest subject line (Eastern). */
export function formatEasternWeekLabel(startIso: string, endExclusiveIso: string): string {
  const start = new Date(startIso);
  const endSunday = new Date(new Date(endExclusiveIso).getTime() - 60 * 1000);
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${f.format(start)} – ${f.format(endSunday)}`;
}
