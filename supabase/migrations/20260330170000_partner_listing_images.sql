-- Optional hero/card images for partner-managed listings (public URLs from Storage).
alter table public.events add column if not exists image_url text;
alter table public.things_to_do add column if not exists image_url text;
alter table public.business_discounts add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partner-listings',
  'partner-listings',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "partner_listings_select_public" on storage.objects;
create policy "partner_listings_select_public"
  on storage.objects for select
  using (bucket_id = 'partner-listings');

drop policy if exists "partner_listings_insert_own" on storage.objects;
create policy "partner_listings_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'partner-listings'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "partner_listings_update_own" on storage.objects;
create policy "partner_listings_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'partner-listings'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'partner-listings'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "partner_listings_delete_own" on storage.objects;
create policy "partner_listings_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'partner-listings'
    and split_part(name, '/', 1) = auth.uid()::text
  );
