-- Lifecycle + Redfin property id for upsert-based sync (soft-remove when off-market).
-- Does not drop real_estate_listings; extends it.

alter table public.real_estate_listings
  add column if not exists redfin_property_id bigint,
  add column if not exists first_seen_at timestamptz default now(),
  add column if not exists last_seen_at timestamptz default now(),
  add column if not exists removed_at timestamptz,
  add column if not exists lot_size_sqft bigint,
  add column if not exists property_type_code integer;

comment on column public.real_estate_listings.redfin_property_id is 'Redfin GIS propertyId; upsert key with market_key';
comment on column public.real_estate_listings.removed_at is 'Set when listing no longer returned by GIS (still on-market elsewhere may reappear)';
comment on column public.real_estate_listings.first_seen_at is 'First time we saw this property in sync';
comment on column public.real_estate_listings.last_seen_at is 'Last successful GIS fetch including this property';

-- Legacy rows: tie lifecycle to updated_at
update public.real_estate_listings
set
  first_seen_at = coalesce(first_seen_at, updated_at, now()),
  last_seen_at = coalesce(last_seen_at, updated_at, now())
where first_seen_at is null or last_seen_at is null;

-- Replace single unique (market_key, source_listing_id) with partial uniques:
-- new rows: (market_key, redfin_property_id); legacy without property id: (market_key, source_listing_id)
alter table public.real_estate_listings drop constraint if exists real_estate_listings_market_key_source_listing_id_key;

create unique index if not exists real_estate_listings_market_redfin_property_uidx
  on public.real_estate_listings (market_key, redfin_property_id)
  where redfin_property_id is not null;

create unique index if not exists real_estate_listings_market_source_legacy_uidx
  on public.real_estate_listings (market_key, source_listing_id)
  where redfin_property_id is null;

create index if not exists real_estate_listings_removed_at_idx
  on public.real_estate_listings (market_key)
  where removed_at is null;

-- Preserve first_seen_at on upsert updates (sync never sends first_seen_at)
create or replace function public.real_estate_listings_preserve_first_seen()
returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.first_seen_at is null then
      new.first_seen_at := now();
    end if;
  elsif tg_op = 'UPDATE' then
    new.first_seen_at := coalesce(old.first_seen_at, new.first_seen_at);
  end if;
  return new;
end;
$$;

drop trigger if exists tr_real_estate_listings_preserve_first_seen on public.real_estate_listings;
create trigger tr_real_estate_listings_preserve_first_seen
  before insert or update on public.real_estate_listings
  for each row
  execute procedure public.real_estate_listings_preserve_first_seen();
