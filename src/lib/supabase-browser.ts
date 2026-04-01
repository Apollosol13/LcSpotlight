import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// createBrowserClient from @supabase/ssr forces flowType: "pkce", which rejects
// invite/magic-link redirects that use implicit hash (#access_token=...).
import { createStorageFromOptions } from "@supabase/ssr/dist/module/cookies";
import { VERSION } from "@supabase/ssr/dist/module/version";
import { isBrowser } from "@supabase/ssr/dist/module/utils/helpers";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase-env";

let cachedBrowserClient: SupabaseClient | undefined;

function buildCookieBrowserClient(flowType: "implicit" | "pkce"): SupabaseClient {
  const supabaseUrl = getPublicSupabaseUrl();
  const supabaseKey = getPublicSupabaseAnonKey();

  const { storage } = createStorageFromOptions(
    {
      cookieEncoding: "base64url",
    },
    false,
  );

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        "X-Client-Info": `supabase-ssr/${VERSION} lcspotlight-browser`,
      },
    },
    auth: {
      flowType,
      autoRefreshToken: isBrowser(),
      detectSessionInUrl: isBrowser(),
      persistSession: true,
      storage,
    },
  });
}

/**
 * Browser client with cookie-backed session (middleware can read the same cookies).
 * Uses implicit grant so email invite / magic links with `#access_token=...` work.
 */
export function createSupabaseBrowser(): SupabaseClient {
  const shouldUseSingleton =
    typeof window !== "undefined" && typeof document !== "undefined";

  if (shouldUseSingleton && cachedBrowserClient) {
    return cachedBrowserClient;
  }

  const client = buildCookieBrowserClient("implicit");

  if (shouldUseSingleton) {
    cachedBrowserClient = client;
  }

  return client;
}

/**
 * For `/auth/complete-invite` only: URL may be PKCE (`?code=`) or implicit (`#access_token=`).
 * Must match flow type or GoTrue rejects the callback during client init.
 */
export function createAuthCallbackBrowserClient(): SupabaseClient {
  let flowType: "implicit" | "pkce" = "implicit";
  if (typeof window !== "undefined") {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) flowType = "pkce";
  }
  return buildCookieBrowserClient(flowType);
}
