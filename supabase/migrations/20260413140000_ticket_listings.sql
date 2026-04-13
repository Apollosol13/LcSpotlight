-- Admin-curated ticket offers for /ticketing (managed via /api/admin only; service role bypasses RLS).
create table if not exists public.ticket_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  subtitle text,
  description text,
  day text,
  month text,
  location text,
  price text,
  ticket_url text not null,
  cta text not null default 'Get tickets',
  image_url text,
  is_published boolean not null default true
);

comment on table public.ticket_listings is 'Ticket offers shown on /ticketing; CRUD via admin API (admin role only).';

create index if not exists ticket_listings_published_created_idx
  on public.ticket_listings (is_published, created_at desc);

alter table public.ticket_listings enable row level security;

drop policy if exists "ticket_listings_select_published" on public.ticket_listings;

create policy "ticket_listings_select_published"
  on public.ticket_listings
  for select
  to anon, authenticated
  using (is_published = true);
