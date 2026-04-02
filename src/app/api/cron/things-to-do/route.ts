import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cronUnauthorized, isCronAuthorized } from "@/lib/cron-auth";
import { replaceThingsToDoFromSeed } from "@/lib/seed-data/replace-things-to-do";

/** GET /api/cron/things-to-do — Replace Things To Do from bundled seed (run less often). */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return cronUnauthorized();

  try {
    const tdRes = await replaceThingsToDoFromSeed(supabaseAdmin);
    const thingsToDo = tdRes.ok
      ? {
          replaced: true,
          deleted: tdRes.deleted,
          inserted: tdRes.inserted,
          verifiedCount: tdRes.verifiedCount,
        }
      : { stage: tdRes.stage, error: tdRes.error };
    return NextResponse.json({ scraped: { thingsToDo } });
  } catch (err) {
    return NextResponse.json(
      { scraped: { thingsToDo: { error: String(err) } } },
      { status: 500 },
    );
  }
}
