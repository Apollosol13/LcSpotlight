-- Member subscriptions — tracks Stripe billing + comped (free) access.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active'
    check (status in ('active','past_due','canceled','incomplete','trialing','comped')),
  plan text check (plan in ('monthly','yearly')),
  current_period_end timestamptz,
  is_comped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_stripe_sub_idx on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription
create policy "subscriptions_select_own"
  on public.subscriptions for select to authenticated
  using (auth.uid() = user_id);

-- Service role (webhooks, admin) can do everything via supabaseAdmin
-- No public insert/update/delete policies needed

comment on table public.subscriptions is
  'Stripe subscription state for paying members. is_comped=true + status=comped for free access grants.';
