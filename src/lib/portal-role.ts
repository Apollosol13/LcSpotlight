import type { SupabaseClient } from "@supabase/supabase-js";

export type EffectivePortalRole = "admin" | "business";

export type PortalAccess = {
  /** Explicit `admin` row only. Admin portal + full business portal + all rows in business API. */
  isStaff: boolean;
  /** Explicit `business` row only. Business portal only; business API scoped to own rows. */
  isPartnerOnly: boolean;
};

/**
 * Staff = explicit `admin` role. Partner = `business` only. No row = no portal (public auth only).
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
  if (data?.role === "admin") {
    return { isStaff: true, isPartnerOnly: false };
  }
  return { isStaff: false, isPartnerOnly: false };
}

export function canAccessBusinessPortal(access: PortalAccess): boolean {
  return access.isStaff || access.isPartnerOnly;
}

/**
 * Explicit row only. `null` when the user has no portal role.
 */
export async function getEffectivePortalRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<EffectivePortalRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.role === "admin" || data?.role === "business") {
    return data.role;
  }
  return null;
}
