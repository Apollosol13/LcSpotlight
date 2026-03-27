import { createBrowserClient } from "@supabase/ssr";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase-env";

export function createSupabaseBrowser() {
  return createBrowserClient(
    getPublicSupabaseUrl(),
    getPublicSupabaseAnonKey()
  );
}
