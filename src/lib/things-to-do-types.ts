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
  place_enriched_at?: string | null;
};
