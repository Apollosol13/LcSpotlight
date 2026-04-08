import type { SupabaseClient } from "@supabase/supabase-js";
import { thingsToDoSeedData } from "@/lib/seed-data/things-to-do";
import type { ThingsToDoSeedRow } from "@/lib/seed-data/things-to-do-seed-types";

const INSERT_CHUNK = 40;

/** Enrichment from Places cron + optional image_url; keyed by title to survive full seed replace. */
type PreservedByTitle = {
  website: string | null;
  image_url: string | null;
  google_place_name: string | null;
  google_photo_name: string | null;
  place_enriched_at: string | null;
  opening_hours_text: string | null;
  owner_user_id: string | null;
};

function mergeSeedWithPreserved(
  rows: ThingsToDoSeedRow[],
  preserved: Map<string, PreservedByTitle>,
): Record<string, unknown>[] {
  return rows.map((row) => {
    const p = preserved.get(row.title);
    if (!p) return { ...row };
    const merged: Record<string, unknown> = { ...row };
    // Seed wins explicit website; otherwise keep enriched URL.
    merged.website = row.website ?? p.website;
    merged.image_url = p.image_url;
    merged.google_place_name = p.google_place_name;
    merged.google_photo_name = p.google_photo_name;
    merged.place_enriched_at = p.place_enriched_at;
    merged.opening_hours_text = p.opening_hours_text;
    if (p.owner_user_id) merged.owner_user_id = p.owner_user_id;
    return merged;
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Deletes every row by primary key (works for uuid or number ids), then inserts the seed in chunks.
 * Rows matched by **title** copy Places enrichment (photo, hours, website when seed website is null)
 * and partner ownership so a replace does not wipe /api/cron/things-to-do-enrich data.
 */
export async function replaceThingsToDoFromSeed(supabase: SupabaseClient): Promise<
  | { ok: true; deleted: number; inserted: number; verifiedCount: number | null }
  | { ok: false; error: string; stage: "select_ids" | "delete" | "insert" }
> {
  const { data: existingRows, error: selErr } = await supabase
    .from("things_to_do")
    .select(
      "id, title, website, image_url, google_place_name, google_photo_name, place_enriched_at, opening_hours_text, owner_user_id",
    );
  if (selErr) {
    return { ok: false, error: selErr.message, stage: "select_ids" };
  }

  const preserved = new Map<string, PreservedByTitle>();
  for (const r of existingRows ?? []) {
    const t = (r.title as string | null)?.trim();
    if (!t) continue;
    preserved.set(t, {
      website: (r.website as string | null) ?? null,
      image_url: (r.image_url as string | null) ?? null,
      google_place_name: (r.google_place_name as string | null) ?? null,
      google_photo_name: (r.google_photo_name as string | null) ?? null,
      place_enriched_at: (r.place_enriched_at as string | null) ?? null,
      opening_hours_text: (r.opening_hours_text as string | null) ?? null,
      owner_user_id: (r.owner_user_id as string | null) ?? null,
    });
  }

  const toInsert = mergeSeedWithPreserved(thingsToDoSeedData, preserved);

  const ids = (existingRows ?? []).map((r) => r.id as string | number);
  for (const idChunk of chunk(ids, 200)) {
    if (idChunk.length === 0) continue;
    const { error: delErr } = await supabase.from("things_to_do").delete().in("id", idChunk);
    if (delErr) {
      return { ok: false, error: delErr.message, stage: "delete" };
    }
  }

  const batches = chunk(toInsert, INSERT_CHUNK);
  let inserted = 0;
  for (let b = 0; b < batches.length; b++) {
    const { error: insErr } = await supabase.from("things_to_do").insert(batches[b]);
    if (insErr) {
      return {
        ok: false,
        error: `insert batch ${b + 1}/${batches.length}: ${insErr.message}`,
        stage: "insert",
      };
    }
    inserted += batches[b].length;
  }

  const { count: verifiedCount, error: cntErr } = await supabase
    .from("things_to_do")
    .select("*", { count: "exact", head: true });

  if (cntErr) {
    return {
      ok: true,
      deleted: ids.length,
      inserted,
      verifiedCount: null,
    };
  }

  return {
    ok: true,
    deleted: ids.length,
    inserted,
    verifiedCount: verifiedCount ?? null,
  };
}
