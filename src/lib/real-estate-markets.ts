/** City-level Redfin region_ids (region_type=6) for the Lowcountry snapshot. */
export const REAL_ESTATE_MARKETS = [
  { key: "hhi", regionId: 8702, label: "Hilton Head" },
  { key: "bluffton", regionId: 1882, label: "Bluffton" },
  { key: "beaufort", regionId: 1243, label: "Beaufort" },
  { key: "savannah", regionId: 17651, label: "Savannah" },
] as const;

export type RealEstateMarketKey = (typeof REAL_ESTATE_MARKETS)[number]["key"];
