import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { thingsToDoSeedData } from "@/lib/seed-data/things-to-do";
import { replaceThingsToDoFromSeed } from "@/lib/seed-data/replace-things-to-do";

/**
 * Seeds only `things_to_do` (full replace). Use when you do not want to touch events/news/openings.
 * POST with no auth — same as /api/seed pattern for this project.
 */
export async function POST() {
  const res = await replaceThingsToDoFromSeed(supabaseAdmin);
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, stage: res.stage, error: res.error },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    deleted: res.deleted,
    inserted: res.inserted,
    verifiedCount: res.verifiedCount,
    expected: thingsToDoSeedData.length,
  });
}
