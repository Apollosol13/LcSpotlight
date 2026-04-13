-- Newsletter signups from POST /api/newsletter (used by weekly digest cron).
create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- No policies: anon/authenticated cannot read or write; service role (supabaseAdmin) bypasses RLS.
