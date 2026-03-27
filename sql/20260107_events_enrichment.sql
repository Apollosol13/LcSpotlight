-- Run in Supabase SQL Editor (Dashboard → SQL → New query) once.
-- Adds fields for external links, images, sortable dates, and deduplication.
--
-- After this, set optional env for SerpApi Google Events ingest:
--   SERPAPI_KEY=...
--   SERPAPI_EVENT_LOCATIONS=Bluffton, SC, United States|Hilton Head Island, SC, United States
-- Cron: GET /api/cron/events with Authorization: Bearer CRON_SECRET

alter table public.events
  add column if not exists source_url text,
  add column if not exists image_url text,
  add column if not exists start_at timestamptz,
  add column if not exists dedupe_key text;

create unique index if not exists events_dedupe_key_unique
  on public.events (dedupe_key)
  where dedupe_key is not null;

create index if not exists events_start_at_idx
  on public.events (start_at desc nulls last);

comment on column public.events.source_url is 'Ticket page or official listing (shown as “More info”)';
comment on column public.events.image_url is 'Hero/thumbnail image URL when available';
comment on column public.events.start_at is 'Event start time for sorting and dedupe';
comment on column public.events.dedupe_key is 'Stable hash: title|date|location for cross-source dedupe';
