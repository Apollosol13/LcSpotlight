import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { getEffectivePortalRole } from "@/lib/portal-role";
import { getSiteUrlFromRequest } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase-server";

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  if (!e || !e.includes("@")) return null;
  return e;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await createSupabaseServer();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((await getEffectivePortalRole(auth, user.id)) !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as { email?: string };
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const siteUrl = getSiteUrlFromRequest(req);
    const redirectTo = `${siteUrl}/login`;

    let inviteUserId: string | null = null;
    let existingAuthUser = false;
    let magicLinkForEmail: string | null = null;

    const inviteRes = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    if (!inviteRes.error && inviteRes.data.user?.id) {
      inviteUserId = inviteRes.data.user.id;
    } else {
      const msg = inviteRes.error?.message?.toLowerCase() ?? "";
      const looksRegistered =
        msg.includes("already") ||
        msg.includes("registered") ||
        inviteRes.error?.status === 422;

      if (!looksRegistered) {
        return NextResponse.json(
          { error: inviteRes.error?.message ?? "Invite failed." },
          { status: 400 },
        );
      }

      existingAuthUser = true;
      const gen = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });

      if (gen.error || !gen.data.user?.id) {
        return NextResponse.json(
          {
            error:
              gen.error?.message ??
              "Could not resolve this email. Ask them to sign up first or check the address.",
          },
          { status: 400 },
        );
      }

      inviteUserId = gen.data.user.id;
      magicLinkForEmail = gen.data.properties?.action_link ?? null;
    }

    if (!inviteUserId) {
      return NextResponse.json({ error: "Could not create or load auth user." }, { status: 500 });
    }

    const { data: priorRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", inviteUserId)
      .maybeSingle();

    if (priorRow?.role === "admin") {
      return NextResponse.json(
        { error: "That user is already staff (admin). Change their role first if you meant to invite them as a partner." },
        { status: 409 },
      );
    }

    const { error: upsertErr } = await supabaseAdmin.from("user_roles").upsert(
      { user_id: inviteUserId, role: "business" },
      { onConflict: "user_id" },
    );

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    let emailedViaApp = false;
    if (existingAuthUser && magicLinkForEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from =
        process.env.RESEND_FROM_EMAIL ?? "LC Spotlight <onboarding@resend.dev>";
      const { error: sendErr } = await resend.emails.send({
        from,
        to: email,
        subject: "Sign in to LC Spotlight — business portal",
        html: `
          <p>You’ve been invited to manage your listings on LC Spotlight.</p>
          <p><a href="${magicLinkForEmail}">Open this link to sign in</a>. If the link doesn’t work, copy and paste the URL into your browser.</p>
          <p style="color:#666;font-size:12px;word-break:break-all">${magicLinkForEmail}</p>
        `.trim(),
      });
      if (sendErr) {
        return NextResponse.json(
          { error: `Partner role saved but email failed: ${sendErr.message}` },
          { status: 502 },
        );
      }
      emailedViaApp = true;
    }

    return NextResponse.json({
      ok: true,
      existingUser: existingAuthUser,
      emailedViaApp,
      /** New invites: Supabase Auth sends the invite email (configure SMTP e.g. Resend in the Supabase dashboard). */
      emailedViaSupabase: !existingAuthUser,
      /** Existing accounts: set `RESEND_API_KEY` (and `RESEND_FROM_EMAIL`) so we can email a magic link; otherwise role is saved only. */
      magicLinkNotEmailed: existingAuthUser && !emailedViaApp,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
