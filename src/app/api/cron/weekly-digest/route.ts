import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { getSiteUrlFromRequest } from "@/lib/site-url";
import {
  buildWeeklyDigestHtml,
  type DigestEventRow,
  type DigestStatsRow,
  type DigestThingsRow,
} from "@/lib/weekly-digest/email-html";
import {
  easternWeekRangeContaining,
  formatEasternWeekLabel,
} from "@/lib/weekly-digest/eastern-week-range";
import { hasUnsubscribeSigning } from "@/lib/newsletter-unsubscribe-token";

export const maxDuration = 300;

const SUBSCRIBER_PAGE = 500;
const EVENT_CAP = 40;
const THINGS_SPOTLIGHT = 6;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllSubscriberEmails(): Promise<string[]> {
  const emails: string[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .select("email")
      .order("email", { ascending: true })
      .range(from, from + SUBSCRIBER_PAGE - 1);

    if (error) {
      throw new Error(error.message);
    }
    const chunk = data ?? [];
    for (const row of chunk) {
      if (row.email) emails.push(row.email);
    }
    if (chunk.length < SUBSCRIBER_PAGE) break;
    from += SUBSCRIBER_PAGE;
  }
  return emails;
}

function pickThingsSpotlight(rows: DigestThingsRow[], mondayYmd: string): DigestThingsRow[] {
  if (rows.length === 0) return [];
  const sorted = [...rows].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  const seed = mondayYmd.split("-").reduce((acc, p) => acc + parseInt(p, 10), 0);
  const n = sorted.length;
  const offset = seed % n;
  const out: DigestThingsRow[] = [];
  for (let i = 0; i < THINGS_SPOTLIGHT && i < n; i++) {
    out.push(sorted[(offset + i) % n]!);
  }
  return out;
}

/**
 * GET /api/cron/weekly-digest — Weekly email digest (intended: Monday 7:00 America/New_York via external scheduler).
 * Sections: events in the Eastern calendar week, real_estate_stats snapshot, rotating things_to_do spotlight.
 * Auth: Bearer CRON_SECRET. Query: dry_run=true returns counts + sample HTML only (no sends).
 * Env: RESEND_API_KEY, RESEND_FROM_EMAIL, NEXT_PUBLIC_SITE_URL; NEWSLETTER_UNSUBSCRIBE_SECRET (or CRON_SECRET) for unsubscribe links.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  const dryRun = req.nextUrl.searchParams.get("dry_run") === "true";
  const siteUrl = getSiteUrlFromRequest(req);

  try {
    const { startIso, endExclusiveIso, mondayYmd } = easternWeekRangeContaining(new Date());
    const weekLabel = formatEasternWeekLabel(startIso, endExclusiveIso);

    const { data: eventRows, error: evErr } = await supabaseAdmin
      .from("events")
      .select("name, start_at, time, location, category, source_url")
      .gte("start_at", startIso)
      .lt("start_at", endExclusiveIso)
      .not("start_at", "is", null)
      .order("start_at", { ascending: true })
      .limit(EVENT_CAP);

    if (evErr) {
      return NextResponse.json({ error: evErr.message }, { status: 500 });
    }

    const { data: statRows, error: stErr } = await supabaseAdmin
      .from("real_estate_stats")
      .select(
        "market_key, median_price_display, median_dom_display, active_listings_display, avg_price_per_sqft_display, price_subtext, dom_subtext, listings_subtext, ratio_subtext, fetched_at",
      )
      .order("market_key", { ascending: true });

    if (stErr) {
      return NextResponse.json({ error: stErr.message }, { status: 500 });
    }

    const { data: thingRows, error: tdErr } = await supabaseAdmin
      .from("things_to_do")
      .select("title, venue, category, market_key")
      .order("title", { ascending: true })
      .limit(2000);

    if (tdErr) {
      return NextResponse.json({ error: tdErr.message }, { status: 500 });
    }

    const events = (eventRows ?? []) as DigestEventRow[];
    const stats = (statRows ?? []) as DigestStatsRow[];
    const thingsPool = (thingRows ?? []) as DigestThingsRow[];
    const thingsToDo = pickThingsSpotlight(thingsPool, mondayYmd);

    const sampleEmail =
      process.env.DIGEST_PREVIEW_EMAIL?.toLowerCase().trim() ?? "preview@example.com";
    const sampleHtml = buildWeeklyDigestHtml({
      siteUrl,
      weekLabel,
      events,
      stats,
      thingsToDo,
      recipientEmail: sampleEmail,
    });

    if (dryRun) {
      let subscriberCount = 0;
      try {
        const list = await fetchAllSubscriberEmails();
        subscriberCount = list.length;
      } catch {
        subscriberCount = -1;
      }
      return NextResponse.json({
        dryRun: true,
        weekLabel,
        range: { startIso, endExclusiveIso, mondayYmd },
        counts: {
          events: events.length,
          stats: stats.length,
          thingsSpotlight: thingsToDo.length,
          subscribers: subscriberCount,
        },
        unsubscribeSigning: hasUnsubscribeSigning(),
        sampleHtml,
      });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
    }

    const from =
      process.env.RESEND_FROM_EMAIL ?? "LC Spotlight <onboarding@resend.dev>";
    const resend = new Resend(resendKey);

    const emails = await fetchAllSubscriberEmails();
    if (emails.length === 0) {
      return NextResponse.json({
        sent: 0,
        skipped: "no_subscribers",
        weekLabel,
        counts: { events: events.length, stats: stats.length, thingsSpotlight: thingsToDo.length },
      });
    }

    const subject = `LC Spotlight — This week (${weekLabel})`;
    let sent = 0;
    const errors: string[] = [];

    for (const to of emails) {
      const html = buildWeeklyDigestHtml({
        siteUrl,
        weekLabel,
        events,
        stats,
        thingsToDo,
        recipientEmail: to,
      });
      const { error: sendErr } = await resend.emails.send({ from, to, subject, html });
      if (sendErr) {
        errors.push(`${to}: ${sendErr.message}`);
      } else {
        sent++;
      }
      await sleep(75);
    }

    return NextResponse.json({
      weekLabel,
      range: { startIso, endExclusiveIso },
      sent,
      failed: emails.length - sent,
      errors: errors.slice(0, 20),
      counts: { events: events.length, stats: stats.length, thingsSpotlight: thingsToDo.length },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
