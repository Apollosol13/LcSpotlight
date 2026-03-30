-- Hero image for org-submitted events (public URL after upload to storage).
alter table public.event_submissions
  add column if not exists image_url text;

comment on column public.event_submissions.image_url is 'Public HTTPS URL for event card hero image (Supabase Storage).';

-- Public bucket for submission photos (server uploads via service role).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-submissions',
  'event-submissions',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Event submission images are publicly readable" on storage.objects;

create policy "Event submission images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'event-submissions');
