import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { thingsToDoSeedData } from "@/lib/seed-data/things-to-do";
import { replaceThingsToDoFromSeed } from "@/lib/seed-data/replace-things-to-do";

function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname || "(unset)";
  } catch {
    return "(invalid URL)";
  }
}

function requireServiceRole(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(expectedKey && authHeader === `Bearer ${expectedKey}`);
}

/**
 * Seeds only `things_to_do` (full replace). Use when you do not want to touch events/news/openings.
 * POST with no auth — same as /api/seed pattern for this project.
 *
 * GET (Bearer SUPABASE_SERVICE_ROLE_KEY): returns row count as seen by this app — use to confirm you are
 * querying the same database as Railway (Supabase), not Railway Postgres.
 */
export async function GET(req: NextRequest) {
  if (!requireServiceRole(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { count, error } = await supabaseAdmin
    .from("things_to_do")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    things_to_do_count: count ?? 0,
    expected_after_seed: thingsToDoSeedData.length,
    supabase_host: supabaseHost(),
  });
}

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
