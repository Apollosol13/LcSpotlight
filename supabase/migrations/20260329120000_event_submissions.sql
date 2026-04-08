-- Public org event submissions; reviewed in admin before appearing on /events.
create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  org_name text not null,
  contact_email text not null,
  name text not null,
  category text,
  day text not null,
  month text not null,
  time text,
  location text,
  price text,
  cta text not null default 'Learn More',
  bg text not null default '#1E3A5F',
  icon text,
  details text,
  status text not null default 'pending',
  staff_notes text,
  published_event_id uuid
);

comment on table public.event_submissions is 'Org-submitted events pending admin approval.';

create index if not exists event_submissions_created_at_idx
  on public.event_submissions (created_at desc);

create index if not exists event_submissions_status_idx
  on public.event_submissions (status);

alter table public.event_submissions enable row level security;

drop policy if exists "event_submissions_authenticated_all" on public.event_submissions;

create policy "event_submissions_authenticated_all"
  on public.event_submissions
  for all
  to authenticated
  using (true)
  with check (true);
