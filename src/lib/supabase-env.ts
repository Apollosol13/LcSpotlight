/**
 * Safe fallbacks so `next build` can run without a local .env (pages and API routes
 * are analyzed at build time). Production must set real values (e.g. Railway).
 */
export function getPublicSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "https://build-placeholder.supabase.co"
  );
}

export function getPublicSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "build-placeholder-anon-key"
  );
}

export function getServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "build-placeholder-service-role-key"
  );
}
