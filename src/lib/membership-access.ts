import { cookies } from "next/headers";

const COOKIE_NAME = "lcspotlight_access";

/**
 * Comma-separated invite codes. When non-empty, /subscribe and checkout require
 * a valid code (see /access) unless the user already has an active subscription.
 */
export function getConfiguredAccessCodes(): string[] {
  const raw = process.env.MEMBERSHIP_ACCESS_CODES?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
}

export function isInviteGateEnabled(): boolean {
  return getConfiguredAccessCodes().length > 0;
}

function getGateSecret(): string {
  return (
    process.env.ACCESS_GATE_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "build-placeholder-gate-secret"
  );
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signAccessTokenForCode(normalizedCode: string): Promise<string> {
  return hmacSha256Hex(getGateSecret(), `access|${normalizedCode}`);
}

/** Returns true if cookie value matches any configured invite code's signature. */
export async function verifyAccessCookieValue(
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue || !isInviteGateEnabled()) return false;
  const codes = getConfiguredAccessCodes();
  for (const code of codes) {
    const expected = await signAccessTokenForCode(code);
    if (timingSafeEqualHex(cookieValue, expected)) return true;
  }
  return false;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function hasInviteCookieFromRequest(
  cookieGetter: (name: string) => string | undefined,
): Promise<boolean> {
  if (!isInviteGateEnabled()) return false;
  return verifyAccessCookieValue(cookieGetter(COOKIE_NAME));
}

export async function hasInviteCookie(): Promise<boolean> {
  const jar = await cookies();
  const v = jar.get(COOKIE_NAME)?.value;
  return verifyAccessCookieValue(v);
}

export { COOKIE_NAME };
