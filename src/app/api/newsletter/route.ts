import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSiteUrlFromRequest } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase-server";

type WelcomeSkippedReason =
  | "already_subscribed"
  | "no_resend_key"
  | "resend_error"
  | "select_error"
  | null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();

    const { data: existing, error: selectError } = await supabaseAdmin
      .from("subscribers")
      .select("email")
      .eq("email", normalized)
      .maybeSingle();

    if (selectError) {
      console.error("[newsletter] subscribers select error:", selectError.message);
    }

    const isNewSubscriber = !existing;
    const hasResendKey = Boolean(process.env.RESEND_API_KEY);

    console.log("[newsletter]", {
      email: normalized,
      isNewSubscriber,
      hasResendKey,
      selectError: selectError?.message ?? null,
    });

    let welcomeSent = false;
    let welcomeSkippedReason: WelcomeSkippedReason = selectError
      ? "select_error"
      : !isNewSubscriber
        ? "already_subscribed"
        : !hasResendKey
          ? "no_resend_key"
          : null;

    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert({ email: normalized }, { onConflict: "email" });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    if (isNewSubscriber && hasResendKey && !selectError) {
      const origin = getSiteUrlFromRequest(request);
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from =
        process.env.RESEND_FROM_EMAIL ?? "LC Spotlight <onboarding@resend.dev>";

      const { data: sendData, error: sendErr } = await resend.emails.send({
        from,
        to: normalized,
        subject: "You're Subscribed -- LcSpotlight",
        html: `
          <p>Thanks for subscribing to <strong>LcSpotlight</strong>.</p>
          <p>You’ll get events, openings, deals, and local news — we send on Thursdays.</p>
          <p><a href="${origin}">Visit LC Spotlight</a></p>
          <p style="color:#666;font-size:12px;margin-top:24px">— LC Spotlight</p>
        `.trim(),
      });

      if (sendErr) {
        welcomeSkippedReason = "resend_error";
        console.error("[newsletter] Resend send failed:", sendErr.message);
      } else {
        welcomeSent = true;
        welcomeSkippedReason = null;
        console.log("[newsletter] welcome email sent:", sendData?.id ?? "ok");
      }
    }

    return NextResponse.json({
      message: "You're on the list!",
      welcomeSent,
      welcomeSkippedReason,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
