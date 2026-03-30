import type { SupabaseClient } from "@supabase/supabase-js";

export type EffectivePortalRole = "admin" | "business";

/**
 * Resolves which portal the user may use. Missing `user_roles` row = legacy full admin.
 */
export async function getEffectivePortalRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<EffectivePortalRole> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.role === "business") return "business";
  return "admin";
}
