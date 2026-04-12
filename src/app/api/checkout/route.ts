import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  isInviteGateEnabled,
  verifyAccessCookieValue,
} from "@/lib/membership-access";
import { getStripe, getStripeMonthlyPriceId, getStripeYearlyPriceId } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { hasActiveAccess } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, plan } = body as { email?: string; plan?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (isInviteGateEnabled()) {
      const cookieOk = await verifyAccessCookieValue(
        req.cookies.get(COOKIE_NAME)?.value,
      );
      if (!cookieOk) {
        const supabase = await createSupabaseServer();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json(
            { error: "Enter your invite code at /access first" },
            { status: 403 },
          );
        }
        const allowed = await hasActiveAccess(supabase, user.id);
        if (!allowed) {
          return NextResponse.json(
            { error: "Enter your invite code at /access first" },
            { status: 403 },
          );
        }
      }
    }

    const priceId =
      plan === "yearly" ? getStripeYearlyPriceId() : getStripeMonthlyPriceId();

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 },
      );
    }

    const stripe = getStripe();

    const origin = req.headers.get("origin") || "https://lcspotlight.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      subscription_data: {
        metadata: { email, plan: plan ?? "monthly" },
      },
      metadata: { email, plan: plan ?? "monthly" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
