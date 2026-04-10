import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { getSubscription } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sub = await getSubscription(supabase, user.id);
    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 },
      );
    }

    const origin = req.headers.get("origin") || "https://lcspotlight.com";
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/member`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[customer-portal]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
