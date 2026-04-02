import type { SupabaseClient } from "@supabase/supabase-js";

type ExchangeResult = Awaited<ReturnType<SupabaseClient["auth"]["exchangeCodeForSession"]>>;

/** Deduplicate PKCE exchange for the same code (e.g. React Strict Mode double mount). */
const exchangeByCode = new Map<string, Promise<ExchangeResult>>();

export function exchangePkceCodeOnce(
  client: SupabaseClient,
  code: string,
): Promise<ExchangeResult> {
  const existing = exchangeByCode.get(code);
  if (existing) return existing;

  const p = client.auth.exchangeCodeForSession(code);
  exchangeByCode.set(code, p);
  void p.finally(() => {
    setTimeout(() => exchangeByCode.delete(code), 60_000);
  });
  return p;
}
