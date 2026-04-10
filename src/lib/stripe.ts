import Stripe from "stripe";

function getStripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() || "sk_test_placeholder";
}

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeSecretKey());
  }
  return _stripe;
}

export function getStripeMonthlyPriceId(): string {
  return process.env.STRIPE_MONTHLY_PRICE_ID?.trim() || "";
}

export function getStripeYearlyPriceId(): string {
  return process.env.STRIPE_YEARLY_PRICE_ID?.trim() || "";
}

export function getStripeWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
}
