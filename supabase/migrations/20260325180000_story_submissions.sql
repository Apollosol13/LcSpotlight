-- Run in Supabase SQL Editor if migrations are not applied automatically.
create table if not exists public.story_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  title text not null,
  body text not null,
  status text not null default 'pending',
  staff_notes text
);

comment on table public.story_submissions is 'Public story pitches; reviewed in admin.';

create index if not exists story_submissions_created_at_idx
  on public.story_submissions (created_at desc);

create index if not exists story_submissions_status_idx
  on public.story_submissions (status);

alter table public.story_submissions enable row level security;

-- Logged-in admins (Supabase Auth) can manage rows via client if needed.
drop policy if exists "story_submissions_authenticated_all" on public.story_submissions;

create policy "story_submissions_authenticated_all"
  on public.story_submissions
  for all
  to authenticated
  using (true)
  with check (true);

-- No anon policies: public inserts go through Next.js API (service role only).
