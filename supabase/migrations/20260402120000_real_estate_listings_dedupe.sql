-- Remove duplicate rows per (market_key, source_listing_id).
-- Keeps one row: prefer non-null redfin_property_id, then latest last_seen_at/updated_at.
--
-- Before running (preview), in Supabase SQL Editor:
--   SELECT market_key, source_listing_id, COUNT(*) AS cnt
--   FROM public.real_estate_listings
--   GROUP BY 1, 2
--   HAVING COUNT(*) > 1;
--
-- Optional: see rows that will be deleted (not the kept row):
--   WITH ranked AS (
--     SELECT id, market_key, source_listing_id,
--       ROW_NUMBER() OVER (
--         PARTITION BY market_key, source_listing_id
--         ORDER BY
--           (redfin_property_id IS NOT NULL) DESC,
--           COALESCE(last_seen_at, updated_at) DESC,
--           updated_at DESC,
--           id
--       ) AS rn
--     FROM public.real_estate_listings
--   )
--   SELECT * FROM ranked WHERE rn > 1;

DELETE FROM public.real_estate_listings
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY market_key, source_listing_id
        ORDER BY
          (redfin_property_id IS NOT NULL) DESC,
          COALESCE(last_seen_at, updated_at) DESC,
          updated_at DESC,
          id
      ) AS rn
    FROM public.real_estate_listings
  ) x
  WHERE x.rn > 1
);

-- Enforce one row per Redfin listing id per market (replaces partial legacy-only unique).
DROP INDEX IF EXISTS public.real_estate_listings_market_source_legacy_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS real_estate_listings_market_source_listing_uidx
  ON public.real_estate_listings (market_key, source_listing_id);
