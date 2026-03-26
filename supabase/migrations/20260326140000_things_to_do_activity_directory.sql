-- Activity directory: category + website; remove deal-oriented columns.

alter table public.things_to_do
  add column if not exists category text not null default 'General';

alter table public.things_to_do
  add column if not exists website text;

alter table public.things_to_do drop column if exists icon;
alter table public.things_to_do drop column if exists badge;
alter table public.things_to_do drop column if exists expires;
