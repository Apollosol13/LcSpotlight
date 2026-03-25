-- Lets upsert(..., onConflict: 'title') work from /api/seed and /api/scrape.
-- If this fails, remove duplicate titles in things_to_do first.
create unique index if not exists things_to_do_title_unique on public.things_to_do (title);
