/** Public `events` row shape (Supabase). Extra columns optional until migration is applied. */
export type EventRow = {
  id: string;
  name: string;
  category: string | null;
  day: string | null;
  month: string | null;
  time: string | null;
  location: string | null;
  price: string | null;
  bg: string | null;
  icon: string | null;
  cta: string | null;
  source: string | null;
  created_at?: string;
  source_url?: string | null;
  image_url?: string | null;
  start_at?: string | null;
  dedupe_key?: string | null;
};
