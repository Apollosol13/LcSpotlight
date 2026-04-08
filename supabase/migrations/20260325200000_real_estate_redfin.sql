-- Redfin-backed listings + computed stats (refreshed by cron / scrape API).
-- Run in Supabase SQL Editor if needed.

create table if not exists public.real_estate_listings (
  id uuid primary key default gen_random_uuid(),
  market_key text not null,
  source_listing_id text not null,
  price integer,
  beds numeric,
  baths numeric,
  sqft integer,
  dom integer,
  property_type text,
  year_built integer,
  address_line text,
  city text,
  state text,
  zip text,
  description text,
  redfin_path text,
  lat double precision,
  lon double precision,
  updated_at timestamptz not null default now(),
  unique (market_key, source_listing_id)
);

create index if not exists real_estate_listings_market_idx
  on public.real_estate_listings (market_key);

create index if not exists real_estate_listings_updated_idx
  on public.real_estate_listings (updated_at desc);

create table if not exists public.real_estate_stats (
  market_key text primary key,
  median_price_display text not null,
  median_dom_display text not null,
  active_listings_display text not null,
  avg_price_per_sqft_display text not null,
  price_subtext text,
  dom_subtext text,
  listings_subtext text,
  ratio_subtext text,
  fetched_at timestamptz not null default now()
);

alter table public.real_estate_listings enable row level security;
alter table public.real_estate_stats enable row level security;

drop policy if exists "real_estate_listings_select_public" on public.real_estate_listings;
drop policy if exists "real_estate_listings_select_authenticated" on public.real_estate_listings;
drop policy if exists "real_estate_stats_select_public" on public.real_estate_stats;
drop policy if exists "real_estate_stats_select_authenticated" on public.real_estate_stats;

create policy "real_estate_listings_select_public"
  on public.real_estate_listings for select to anon using (true);

create policy "real_estate_listings_select_authenticated"
  on public.real_estate_listings for select to authenticated using (true);

create policy "real_estate_stats_select_public"
  on public.real_estate_stats for select to anon using (true);

create policy "real_estate_stats_select_authenticated"
  on public.real_estate_stats for select to authenticated using (true);

-- Inserts/updates/deletes only via service role (API routes).
