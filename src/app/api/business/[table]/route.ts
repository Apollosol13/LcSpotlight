import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { getPortalAccess } from "@/lib/portal-role";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_TABLES = ["events", "things_to_do", "business_discounts"] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

type RouteContext = { params: Promise<{ table: string }> };

function revalidateForTable(table: string) {
  if (table === "events") {
    revalidatePath("/");
    revalidatePath("/events");
  } else if (table === "things_to_do") {
    revalidatePath("/");
    revalidatePath("/things-to-do");
  } else if (table === "business_discounts") {
    revalidatePath("/");
    revalidatePath("/deals");
  }
}

class Reject {
  constructor(
    public status: number,
    public message: string,
  ) {}
}

function handleApiError(e: unknown) {
  if (e instanceof Reject) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type BusinessPortalContext = {
  user: { id: string };
  db: typeof supabaseAdmin;
  access: Awaited<ReturnType<typeof getPortalAccess>>;
};

async function requireBusinessPortalUser(): Promise<BusinessPortalContext> {
  const auth = await createSupabaseServer();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const access = await getPortalAccess(auth, user.id);
  return { user, db: supabaseAdmin, access };
}

function assertTable(table: string): asserts table is AllowedTable {
  if (!ALLOWED_TABLES.includes(table as AllowedTable)) {
    throw new Reject(400, "Invalid table");
  }
}

async function assertOwnedRow(
  db: SupabaseClient,
  table: AllowedTable,
  id: string,
  userId: string,
) {
  const { data, error } = await db
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) throw new Reject(500, error.message);
  if (!data) throw new Reject(404, "Not found");
}

async function assertRowExists(db: SupabaseClient, table: AllowedTable, id: string) {
  const { data, error } = await db.from(table).select("id").eq("id", id).maybeSingle();

  if (error) throw new Reject(500, error.message);
  if (!data) throw new Reject(404, "Not found");
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  try {
    assertTable(table);
    const { user, db, access } = await requireBusinessPortalUser();

    let q = db.from(table).select("*");
    if (access.isPartnerOnly) {
      q = q.eq("owner_user_id", user.id);
    }

    const { data, error } = await q.order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  try {
    assertTable(table);
    const { user, db, access } = await requireBusinessPortalUser();
    const body = (await req.json()) as Record<string, unknown>;
    delete body.id;

    const suppliedOwner =
      typeof body.owner_user_id === "string" && body.owner_user_id.length > 0
        ? body.owner_user_id
        : undefined;
    delete body.owner_user_id;

    let ownerId = user.id;
    if (!access.isPartnerOnly && suppliedOwner) {
      ownerId = suppliedOwner;
    }

    let payload: Record<string, unknown> = { ...body, owner_user_id: ownerId };

    if (table === "events") {
      payload = { ...payload, source: "Partner" };
    } else if (table === "things_to_do") {
      payload = { ...payload, source: "Partner" };
    } else if (table === "business_discounts") {
      payload = {
        ...payload,
        owner_user_id: ownerId,
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await db.from(table).insert(payload).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateForTable(table);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  try {
    assertTable(table);
    const { user, db, access } = await requireBusinessPortalUser();
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    if (access.isPartnerOnly) {
      await assertOwnedRow(db, table, id, user.id);
    } else {
      await assertRowExists(db, table, id);
    }

    const ownerIncoming = body.owner_user_id;
    const { id: _i, owner_user_id: _drop, ...rest } = body;
    const patch: Record<string, unknown> = {
      ...rest,
      ...(table === "business_discounts"
        ? { updated_at: new Date().toISOString() }
        : {}),
    };

    if (!access.isPartnerOnly && typeof ownerIncoming === "string" && ownerIncoming.length > 0) {
      patch.owner_user_id = ownerIncoming;
    }

    const { data, error } = await db.from(table).update(patch).eq("id", id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateForTable(table);
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  try {
    assertTable(table);
    const { user, db, access } = await requireBusinessPortalUser();
    const { id } = (await req.json()) as { id?: string };

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    if (access.isPartnerOnly) {
      await assertOwnedRow(db, table, id, user.id);
    } else {
      await assertRowExists(db, table, id);
    }

    const { error } = await db.from(table).delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateForTable(table);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
