-- Public catalog uses the anon key unless routes use the service role; with RLS and no SELECT policy, rows are hidden (404).
alter table public.things_to_do enable row level security;

drop policy if exists "things_to_do_select_public" on public.things_to_do;

create policy "things_to_do_select_public"
  on public.things_to_do
  for select
  to anon, authenticated
  using (true);
