import type { SupabaseClient } from "@supabase/supabase-js";
import { thingsToDoSeedData } from "@/lib/seed-data/things-to-do";

const INSERT_CHUNK = 40;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Deletes every row by primary key (works for uuid or number ids), then inserts the seed in chunks.
 * Bulk upsert alone can be unreliable at large sizes; empty table + insert is predictable after delete.
 */
export async function replaceThingsToDoFromSeed(supabase: SupabaseClient): Promise<
  | { ok: true; deleted: number; inserted: number; verifiedCount: number | null }
  | { ok: false; error: string; stage: "select_ids" | "delete" | "insert" }
> {
  const { data: idRows, error: selErr } = await supabase.from("things_to_do").select("id");
  if (selErr) {
    return { ok: false, error: selErr.message, stage: "select_ids" };
  }

  const ids = (idRows ?? []).map((r) => r.id as string | number);
  for (const idChunk of chunk(ids, 200)) {
    if (idChunk.length === 0) continue;
    const { error: delErr } = await supabase.from("things_to_do").delete().in("id", idChunk);
    if (delErr) {
      return { ok: false, error: delErr.message, stage: "delete" };
    }
  }

  const batches = chunk(thingsToDoSeedData, INSERT_CHUNK);
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
