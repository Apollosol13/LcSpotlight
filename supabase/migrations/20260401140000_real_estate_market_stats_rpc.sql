-- Server-side aggregates for real estate KPI cards (no row-limit / client-side median).
create or replace function public.get_real_estate_market_stats()
returns table (
  market_key text,
  active_count bigint,
  median_price numeric,
  median_dom double precision,
  avg_price_per_sqft numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select *
    from public.real_estate_listings
    where removed_at is null
  ),
  counts as (
    select b.market_key, count(*)::bigint as active_count
    from base b
    group by b.market_key
  ),
  median_prices as (
    select
      b.market_key,
      percentile_cont(0.5) within group (order by b.price) as median_price
    from base b
    where b.price is not null and b.price > 0
    group by b.market_key
  ),
  median_doms as (
    select
      b.market_key,
      percentile_cont(0.5) within group (order by b.dom::double precision) as median_dom
    from base b
    where b.dom is not null and b.dom >= 0
    group by b.market_key
  ),
  pps as (
    select
      b.market_key,
      avg((b.price::numeric / nullif(b.sqft, 0))) as avg_ppsf
    from base b
    where b.price is not null and b.price > 0 and b.sqft is not null and b.sqft > 0
    group by b.market_key
  )
  select
    c.market_key::text,
    c.active_count,
    mp.median_price,
    md.median_dom,
    coalesce(p.avg_ppsf, 0)::numeric as avg_price_per_sqft
  from counts c
  left join median_prices mp on mp.market_key = c.market_key
  left join median_doms md on md.market_key = c.market_key
  left join pps p on p.market_key = c.market_key;
$$;

comment on function public.get_real_estate_market_stats() is
  'Per-market active count, median price/DOM, avg $/sqft for removed_at IS NULL listings.';

grant execute on function public.get_real_estate_market_stats() to anon;
grant execute on function public.get_real_estate_market_stats() to authenticated;
grant execute on function public.get_real_estate_market_stats() to service_role;
