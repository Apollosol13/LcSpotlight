import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_TABLES = ["events", "news", "openings", "things_to_do"];

type RouteContext = { params: Promise<{ table: string }> };

async function requireAuth() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabaseAdmin;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAuth();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAuth();
    const body = await req.json();
    const { data, error } = await supabase.from(table).insert(body).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAuth();
    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data, error } = await supabase.from(table).update(rest).eq("id", id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { table } = await ctx.params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = await requireAuth();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
