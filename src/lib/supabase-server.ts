import { createClient } from "@supabase/supabase-js";
import {
  getPublicSupabaseUrl,
  getServiceRoleKey,
} from "@/lib/supabase-env";

export const supabaseAdmin = createClient(
  getPublicSupabaseUrl(),
  getServiceRoleKey()
);
