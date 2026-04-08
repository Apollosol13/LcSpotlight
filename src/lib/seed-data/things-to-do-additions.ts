import type { ThingsToDoSeedRow } from "./things-to-do-seed-types";
import { thingsToDoAddBeaufort } from "./things-to-do-add-beaufort";
import { thingsToDoAddBluffton } from "./things-to-do-add-bluffton";
import { thingsToDoAddHhi } from "./things-to-do-add-hhi";
import { thingsToDoAddSavannah } from "./things-to-do-add-savannah";

/** 240 curated rows (60 per market) appended to the legacy seed list. */
export const additionalThingsToDoSeedRows: ThingsToDoSeedRow[] = [
  ...thingsToDoAddHhi,
  ...thingsToDoAddBluffton,
  ...thingsToDoAddBeaufort,
  ...thingsToDoAddSavannah,
];
