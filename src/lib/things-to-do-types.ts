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
};
