-- Portal roles. No row = app treats user as legacy admin (full admin access).
-- Row role = 'business' = business portal only; role = 'admin' = admin portal only.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'business')),
  created_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx on public.user_roles (role);

alter table public.user_roles enable row level security;

create policy "user_roles_select_own"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on table public.user_roles is E'Business onboarding: create the user in Supabase Auth, then run:\n  insert into public.user_roles (user_id, role) values (''<uuid>'', ''business'');\nOptional explicit staff row:\n  insert into public.user_roles (user_id, role) values (''<uuid>'', ''admin'');\nAccounts with no row still get full admin (legacy); business accounts must have role = business.';

alter table public.events
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create index if not exists events_owner_user_id_idx on public.events (owner_user_id);

alter table public.things_to_do
  add column if not exists source text;

alter table public.things_to_do
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create index if not exists things_to_do_owner_user_id_idx on public.things_to_do (owner_user_id);

-- Partner-submitted discounts; public reads active rows; owners manage via app API (service role).
create table if not exists public.business_discounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  market_key text not null,
  title text not null,
  description text,
  terms text,
  redeem_url text,
  expires_on date,
  is_active boolean not null default true
);

create index if not exists business_discounts_owner_idx on public.business_discounts (owner_user_id);
create index if not exists business_discounts_market_active_idx on public.business_discounts (market_key, is_active);

alter table public.business_discounts enable row level security;

create policy "business_discounts_select_public_active"
  on public.business_discounts
  for select
  to anon, authenticated
  using (is_active = true);

create policy "business_discounts_select_owner"
  on public.business_discounts
  for select
  to authenticated
  using (auth.uid() = owner_user_id);

create policy "business_discounts_insert_owner"
  on public.business_discounts
  for insert
  to authenticated
  with check (auth.uid() = owner_user_id);

create policy "business_discounts_update_owner"
  on public.business_discounts
  for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "business_discounts_delete_owner"
  on public.business_discounts
  for delete
  to authenticated
  using (auth.uid() = owner_user_id);
