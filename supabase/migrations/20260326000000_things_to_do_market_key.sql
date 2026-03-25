-- Region tabs: Hilton Head, Bluffton, Beaufort, Savannah (aligns with REAL_ESTATE_MARKETS keys).
alter table public.things_to_do
  add column if not exists market_key text not null default 'hhi';

create index if not exists things_to_do_market_key_idx
  on public.things_to_do (market_key);
