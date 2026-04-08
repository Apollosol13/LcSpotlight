/** Curated directory rows for `things_to_do`. Upserted on `title`. */
export type ThingsToDoSeedRow = {
  market_key: "hhi" | "bluffton" | "beaufort" | "savannah";
  category: string;
  title: string;
  description: string;
  venue: string;
  website: string | null;
  source: "curated";
};
