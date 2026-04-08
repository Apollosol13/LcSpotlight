alter table public.things_to_do
  add column if not exists google_rating double precision,
  add column if not exists google_user_rating_count integer,
  add column if not exists place_formatted_address text,
  add column if not exists place_international_phone text,
  add column if not exists place_google_maps_uri text,
  add column if not exists place_editorial_summary text,
  add column if not exists google_photo_names text[];

comment on column public.things_to_do.google_rating is 'Places API (New) rating 1–5';
comment on column public.things_to_do.google_user_rating_count is 'Places API userRatingCount';
comment on column public.things_to_do.place_formatted_address is 'Places formattedAddress';
comment on column public.things_to_do.place_international_phone is 'Places internationalPhoneNumber';
comment on column public.things_to_do.place_google_maps_uri is 'Places googleMapsUri';
comment on column public.things_to_do.place_editorial_summary is 'Places editorialSummary.text (present as-is)';
comment on column public.things_to_do.google_photo_names is 'Up to 5 Places photo resource names from Place Details';
