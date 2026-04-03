-- Google Places enrichment: cache place resource name + photo ref for proxied images.

alter table public.things_to_do
  add column if not exists google_place_name text;

alter table public.things_to_do
  add column if not exists google_photo_name text;

alter table public.things_to_do
  add column if not exists place_enriched_at timestamptz;

comment on column public.things_to_do.google_place_name is 'Places API (New) resource name, e.g. places/ChIJ...';
comment on column public.things_to_do.google_photo_name is 'First photo resource name for /api/places-photo proxy';
comment on column public.things_to_do.place_enriched_at is 'Last successful Places backfill of website/photo';
