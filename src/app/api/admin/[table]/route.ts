import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { getEffectivePortalRole } from "@/lib/portal-role";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_TABLES = [
  "events",
  "news",
  "openings",
  "things_to_do",
  "story_submissions",
  "event_submissions",
  "ticket_listings",
];

type RouteContext = { params: Promise<{ table: string }> };

function revalidatePublicForTable(table: string) {
  if (table === "news") {
    revalidatePath("/");
    revalidatePath("/news");
  } else if (table === "events") {
    revalidatePath("/");
    revalidatePath("/events");
  } else if (table === "openings") {
    revalidatePath("/");
    revalidatePath("/openings");
  } else if (table === "things_to_do") {
    revalidatePath("/");
    revalidatePath("/things-to-do");
  } else if (table === "event_submissions") {
    revalidatePath("/events");
  } else if (table === "ticket_listings") {
    revalidatePath("/ticketing");
  }
}

async function requireAdmin() {
  const auth = await createSupabaseServer();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  if ((await getEffectivePortalRole(auth, user.id)) !== "admin") {
    throw new Reject(403, "Forbidden");
  }
  return supabaseAdmin;
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

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAdmin();
    const body = await req.json();
    const { data, error } = await supabase.from(table).insert(body).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePublicForTable(table);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAdmin();
    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data, error } = await supabase.from(table).update(rest).eq("id", id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePublicForTable(table);
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAdmin();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePublicForTable(table);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
