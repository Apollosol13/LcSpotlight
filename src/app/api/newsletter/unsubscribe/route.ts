import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { verifyUnsubscribeToken } from "@/lib/newsletter-unsubscribe-token";

/**
 * GET /api/newsletter/unsubscribe?e=email&t=token — one-click unsubscribe (HMAC).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const emailRaw = url.searchParams.get("e") ?? "";
  const token = url.searchParams.get("t") ?? "";
  const email = decodeURIComponent(emailRaw).toLowerCase().trim();

  if (!email || !token || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:system-ui;padding:24px"><p>Invalid unsubscribe link.</p></body></html>`,
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:system-ui;padding:24px"><p>This link is invalid or expired.</p></body></html>`,
      { status: 403, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const { error } = await supabaseAdmin.from("subscribers").delete().eq("email", email);

  if (error) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:system-ui;padding:24px"><p>Something went wrong. Please try again later.</p></body></html>`,
      { status: 500, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:system-ui;padding:24px;max-width:480px;line-height:1.5">
<p>You’re unsubscribed from <strong>LC Spotlight</strong> weekly emails.</p>
<p style="color:#666;font-size:14px">You can sign up again anytime on the site.</p>
</body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
