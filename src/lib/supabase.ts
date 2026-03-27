import { createClient } from "@supabase/supabase-js";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase-env";

export const supabase = createClient(
  getPublicSupabaseUrl(),
  getPublicSupabaseAnonKey()
);
