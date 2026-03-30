import type { SupabaseClient } from "@supabase/supabase-js";

export type EffectivePortalRole = "admin" | "business";

export type PortalAccess = {
  /** Explicit `admin` row or no row (legacy staff). Admin portal + full business portal + all rows in business API. */
  isStaff: boolean;
  /** Explicit `business` row only. Business portal only; business API scoped to own rows. */
  isPartnerOnly: boolean;
};

/**
 * Staff = admin role or missing row (legacy). Partner = business role only.
 */
export async function getPortalAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<PortalAccess> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.role === "business") {
    return { isStaff: false, isPartnerOnly: true };
  }
  return { isStaff: true, isPartnerOnly: false };
}

/**
 * `"business"` = partner-only account. `"admin"` = staff (explicit admin or legacy).
 */
export async function getEffectivePortalRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<EffectivePortalRole> {
  const { isPartnerOnly } = await getPortalAccess(supabase, userId);
  return isPartnerOnly ? "business" : "admin";
}
