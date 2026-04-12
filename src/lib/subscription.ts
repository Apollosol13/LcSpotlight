import type { SupabaseClient } from "@supabase/supabase-js";
import { hasInviteCookie } from "@/lib/membership-access";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan: string | null;
  current_period_end: string | null;
  is_comped: boolean;
  created_at: string;
  updated_at: string;
};

const ACTIVE_STATUSES = new Set(["active", "trialing", "comped"]);

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionRow | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export function isSubscriptionActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  if (ACTIVE_STATUSES.has(sub.status)) return true;
  if (sub.status === "past_due") {
    if (sub.current_period_end) {
      return new Date(sub.current_period_end) > new Date();
    }
  }
  return false;
}

/**
 * Combined check: does this user have an active paid/comped subscription?
 * Admin and business users bypass the paywall (they already have portal access).
 */
export async function hasActiveAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleRow?.role === "admin" || roleRow?.role === "business") return true;

  const sub = await getSubscription(supabase, userId);
  return isSubscriptionActive(sub);
}

/**
 * Premium content: active subscription / comped / portal roles, OR valid invite cookie.
 */
export async function hasPremiumAccess(
  supabase: SupabaseClient,
  userId: string | null,
): Promise<boolean> {
  if (await hasInviteCookie()) return true;
  if (!userId) return false;
  return hasActiveAccess(supabase, userId);
}
