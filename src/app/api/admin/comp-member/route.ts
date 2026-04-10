import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { getPortalAccess } from "@/lib/portal-role";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const access = await getPortalAccess(supabase, user.id);
    if (!access.isStaff) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Find or create user
    let targetUserId: string;
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase().trim(),
    );

    if (existing) {
      targetUserId = existing.id;
    } else {
      const pw =
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2) +
        "A1!";
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser(
        {
          email: email.trim(),
          password: pw,
          email_confirm: true,
        },
      );
      if (error || !created.user) {
        return NextResponse.json(
          { error: error?.message ?? "Failed to create user" },
          { status: 500 },
        );
      }
      targetUserId = created.user.id;
    }

    // Upsert subscription as comped
    const { error: upsertErr } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: targetUserId,
          status: "comped",
          is_comped: true,
          plan: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertErr) {
      return NextResponse.json(
        { error: upsertErr.message },
        { status: 500 },
      );
    }

    // Send magic link
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://lcspotlight.com";
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim(),
      options: { redirectTo: `${origin}/member` },
    });

    return NextResponse.json({ ok: true, email: email.trim() });
  } catch (err) {
    console.error("[comp-member]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
