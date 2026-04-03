alter table public.things_to_do
  add column if not exists opening_hours_text text;

comment on column public.things_to_do.opening_hours_text is 'Lines from Places API regularOpeningHours.weekdayDescriptions (cron enrich)';
