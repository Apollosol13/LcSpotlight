-- Thumbnail URL built from Redfin CDN (see scraper); nullable when MLS missing.
alter table public.real_estate_listings
  add column if not exists photo_url text;
