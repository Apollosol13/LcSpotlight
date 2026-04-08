export type ThingsToDoRow = {
  id: string;
  market_key?: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  venue: string | null;
  website: string | null;
  source?: string | null;
  owner_user_id?: string | null;
  image_url?: string | null;
  /** Places API resource name, e.g. places/ChIJ... */
  google_place_name?: string | null;
  /** First photo resource name; images served via /api/places-photo */
  google_photo_name?: string | null;
  /** Up to 5 Places photo resource names from Place Details */
  google_photo_names?: string[] | null;
  place_enriched_at?: string | null;
  google_rating?: number | null;
  google_user_rating_count?: number | null;
  place_formatted_address?: string | null;
  place_international_phone?: string | null;
  place_google_maps_uri?: string | null;
  place_editorial_summary?: string | null;
  /** Lines from Places weekdayDescriptions (cron enrich) */
  opening_hours_text?: string | null;
};
