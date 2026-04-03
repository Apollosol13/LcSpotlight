-- Clear invalid google_photo_name values (place resource mistaken for photo, or malformed).
update public.things_to_do
set google_photo_name = null
where google_photo_name is not null
  and (
    trim(google_photo_name) = trim(coalesce(google_place_name, ''))
    or google_photo_name not like '%/photos/%'
  );
