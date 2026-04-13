import type { ReactNode } from "react";
import Link from "next/link";
import { Paywall } from "@/components/Paywall";
import {
  publishedTicketListingsQuery,
  type TicketListingRow,
} from "@/lib/tickets/fetch-ticket-listings";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function TicketCardLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const url = href.trim();
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href="/ticketing" className={className}>
      {children}
    </Link>
  );
}

function TicketListingCard({ row }: { row: TicketListingRow }) {
  const cta = row.cta?.trim() || "Get tickets";
  const hasBadge = Boolean(row.day?.trim() && row.month?.trim());

  return (
    <TicketCardLink
      href={row.ticket_url}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[rgba(12,27,51,0.06)] bg-white no-underline transition-all hover:-translate-y-0.5 hover:border-spotlight-gold/30 hover:shadow-[0_8px_30px_rgba(12,27,51,0.08)] min-[640px]:flex-row"
    >
      {row.image_url?.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.image_url.trim()}
          alt=""
          className="h-40 w-full shrink-0 object-cover min-[640px]:h-auto min-[640px]:w-[200px]"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 gap-4 p-4">
        {hasBadge ? (
          <div className="flex h-[56px] w-[56px] shrink-0 flex-col items-center justify-center rounded-lg bg-spotlight-navy text-center">
            <span className="font-serif text-[22px] font-bold leading-none text-spotlight-gold">
              {row.day}
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.8px] text-spotlight-cream/50">
              {row.month}
            </span>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-[17px] font-semibold leading-snug text-spotlight-navy group-hover:text-spotlight-teal">
            {row.title}
          </h2>
          {row.subtitle?.trim() ? (
            <p className="mt-1 text-[12px] text-spotlight-text-mid">{row.subtitle.trim()}</p>
          ) : null}
          {row.description?.trim() ? (
            <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-spotlight-text-muted">
              {row.description.trim()}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-spotlight-text-muted">
            {row.location?.trim() ? (
              <span className="truncate">{row.location.trim()}</span>
            ) : null}
            {row.price?.trim() ? (
              <>
                {row.location?.trim() ? (
                  <span className="shrink-0 text-spotlight-sand">·</span>
                ) : null}
                <span className="shrink-0">{row.price.trim()}</span>
              </>
            ) : null}
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-spotlight-gold-dark">
            {cta} →
          </p>
        </div>
        <div className="flex shrink-0 items-center self-center min-[640px]:self-start min-[640px]:pt-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-spotlight-text-muted/30 transition group-hover:translate-x-0.5 group-hover:text-spotlight-gold"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </TicketCardLink>
  );
}

export default async function TicketingPage() {
  const { data: rows } = await publishedTicketListingsQuery(supabase);
  const list = (rows ?? []) as TicketListingRow[];

  return (
    <Paywall feature="event ticketing">
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-16 min-[601px]:px-10">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
          Local events
        </p>
        <h1 className="font-serif text-3xl font-normal text-spotlight-navy">Tickets</h1>
        <p className="mt-3 max-w-2xl text-spotlight-text-mid">
          Buy tickets to Lowcountry events — curated by LCSpotlight. Follow each link for seating,
          pricing, and checkout on the organizer&apos;s site.
        </p>

        <div className="mt-12">
          {list.length === 0 ? (
            <p className="text-sm text-spotlight-text-muted">
              New ticket offers will appear here soon.
            </p>
          ) : (
            <ul className="grid list-none gap-4 p-0 min-[640px]:gap-5">
              {list.map((row) => (
                <li key={row.id}>
                  <TicketListingCard row={row} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </Paywall>
  );
}
