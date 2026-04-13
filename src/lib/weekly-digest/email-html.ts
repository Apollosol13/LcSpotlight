import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";
import { hasUnsubscribeSigning, makeUnsubscribeToken } from "@/lib/newsletter-unsubscribe-token";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hrefAttr(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "#";
    return esc(u.href);
  } catch {
    return "#";
  }
}

export type DigestEventRow = {
  name: string;
  start_at: string | null;
  location: string | null;
  category: string | null;
  source_url: string | null;
};

export type DigestStatsRow = {
  market_key: string;
  median_price_display: string;
  median_dom_display: string;
  active_listings_display: string;
  avg_price_per_sqft_display: string;
  price_subtext: string | null;
  dom_subtext: string | null;
  listings_subtext: string | null;
  ratio_subtext: string | null;
  fetched_at: string;
};

export type DigestThingsRow = {
  title: string;
  venue: string | null;
  category: string | null;
  market_key: string | null;
};

function formatEventWhen(iso: string | null): string {
  if (!iso) return "Date TBA";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

const marketLabel = (key: string | null): string => {
  const m = REAL_ESTATE_MARKETS.find((x) => x.key === key);
  return m?.label ?? key ?? "";
};

export function buildWeeklyDigestHtml(params: {
  siteUrl: string;
  weekLabel: string;
  events: DigestEventRow[];
  stats: DigestStatsRow[];
  thingsToDo: DigestThingsRow[];
  recipientEmail: string;
}): string {
  const { siteUrl, weekLabel, events, stats, thingsToDo, recipientEmail } = params;
  const origin = siteUrl.replace(/\/$/, "");

  const eventsHtml =
    events.length === 0
      ? "<p>No dated events in this window yet — check back on the site for updates.</p>"
      : `<ul style="margin:0;padding-left:18px;line-height:1.5">
${events
  .map((e) => {
    const href = e.source_url ? hrefAttr(e.source_url) : "#";
    const nameHtml =
      href !== "#"
        ? `<a href="${href}"><strong>${esc(e.name)}</strong></a>`
        : `<strong>${esc(e.name)}</strong>`;
    const rest = `${esc(formatEventWhen(e.start_at))}${
      e.location ? ` · ${esc(e.location)}` : ""
    }${e.category ? ` · ${esc(e.category)}` : ""}`;
    return `<li style="margin-bottom:10px">${nameHtml} — ${rest}</li>`;
  })
  .join("\n")}
</ul>`;

  const statsHtml =
    stats.length === 0
      ? "<p>Market stats are syncing — visit Real Estate on the site for the latest.</p>"
      : `<table style="border-collapse:collapse;width:100%;max-width:560px;font-size:14px">
${stats
  .map((s) => {
    const label = marketLabel(s.market_key);
    return `<tr>
<td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:top"><strong>${esc(label)}</strong></td>
<td style="padding:10px 8px;border-bottom:1px solid #eee">${esc(s.median_price_display)} median · ${esc(s.active_listings_display)} active · ${esc(s.median_dom_display)} DOM · ${esc(s.avg_price_per_sqft_display)}/sf</td>
</tr>`;
  })
  .join("\n")}
</table>`;

  const thingsBlock =
    thingsToDo.length === 0
      ? `<p>A rotating spotlight from our directory — see everything on the site.</p>`
      : `<ul style="margin:0;padding-left:18px;line-height:1.5">
${thingsToDo
  .map(
    (t) =>
      `<li style="margin-bottom:8px"><strong>${esc(t.title)}</strong>${t.venue ? ` — ${esc(t.venue)}` : ""}${
        t.category ? ` · ${esc(t.category)}` : ""
      } · ${esc(marketLabel(t.market_key))}</li>`,
  )
  .join("\n")}
</ul>`;

  const token = makeUnsubscribeToken(recipientEmail);
  const unsub =
    hasUnsubscribeSigning() && token
      ? `<p style="color:#666;font-size:12px;margin-top:28px"><a href="${origin}/api/newsletter/unsubscribe?e=${encodeURIComponent(recipientEmail)}&t=${encodeURIComponent(token)}">Unsubscribe</a></p>`
      : `<p style="color:#666;font-size:12px;margin-top:28px">Reply to this email if you need to stop receiving updates.</p>`;

  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.45;color:#111;max-width:600px">
  <p style="font-size:15px">Here’s your <strong>LC Spotlight</strong> look-ahead for <strong>${esc(weekLabel)}</strong> (Eastern time).</p>

  <h2 style="font-size:17px;margin-top:24px">This week’s events</h2>
  ${eventsHtml}
  <p style="margin-top:14px"><a href="${origin}/events">Full events calendar →</a></p>

  <h2 style="font-size:17px;margin-top:28px">Real estate snapshot</h2>
  ${statsHtml}
  <p style="margin-top:14px"><a href="${origin}/real-estate">Listings &amp; markets →</a></p>

  <h2 style="font-size:17px;margin-top:28px">Things to do (spotlight)</h2>
  ${thingsBlock}
  <p style="margin-top:14px"><a href="${origin}/things-to-do">All things to do →</a></p>

  <p style="color:#666;font-size:12px;margin-top:32px">— LC Spotlight<br />
  <a href="${origin}">${esc(origin.replace(/^https?:\/\//, ""))}</a></p>
  ${unsub}
</body>
</html>`.trim();
}
