import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, getStripeWebhookSecret());
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const email = session.customer_email ?? session.metadata?.email;
  if (!email) {
    console.error("[stripe-webhook] No email in checkout session");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const plan = session.metadata?.plan ?? "monthly";

  // Find or create the Supabase Auth user
  let userId: string;
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  if (existing) {
    userId = existing.id;
  } else {
    const randomPw =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      "A1!";
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPw,
      email_confirm: true,
    });
    if (error || !newUser.user) {
      console.error("[stripe-webhook] Failed to create user:", error);
      return;
    }
    userId = newUser.user.id;
  }

  // Fetch subscription details for period end
  let periodEnd: string | null = null;
  if (subscriptionId) {
    const stripe = getStripe();
    const subResponse = await stripe.subscriptions.retrieve(subscriptionId);
    const firstItem = subResponse.items?.data?.[0];
    if (firstItem?.current_period_end) {
      periodEnd = new Date(firstItem.current_period_end * 1000).toISOString();
    }
  }

  // Upsert subscription record
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: "active",
      plan,
      current_period_end: periodEnd,
      is_comped: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  // Send magic link so the user can log in
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://lcspotlight.com";
  await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${origin}/member` },
  });

  console.log(`[stripe-webhook] Subscription activated for ${email} (${plan})`);
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const stripeSubId = sub.id;

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    trialing: "trialing",
    unpaid: "past_due",
    paused: "canceled",
  };

  const mappedStatus = statusMap[sub.status] ?? "canceled";

  const firstItem = sub.items?.data?.[0];
  const periodEndSec = firstItem?.current_period_end;
  const periodEnd = periodEndSec
    ? new Date(periodEndSec * 1000).toISOString()
    : null;

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: mappedStatus,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubId);

  if (error) {
    console.error("[stripe-webhook] Failed to update subscription:", error);
  }
}
