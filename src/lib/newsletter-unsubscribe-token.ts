import { createHmac, timingSafeEqual } from "crypto";

function signingSecret(): string {
  return (
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ??
    process.env.CRON_SECRET ??
    ""
  );
}

export function hasUnsubscribeSigning(): boolean {
  return Boolean(signingSecret());
}

export function makeUnsubscribeToken(email: string): string {
  const secret = signingSecret();
  if (!secret) return "";
  const normalized = email.toLowerCase().trim();
  return createHmac("sha256", secret).update(normalized).digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = signingSecret();
  if (!secret || !token) return false;
  const normalized = email.toLowerCase().trim();
  const expected = createHmac("sha256", secret).update(normalized).digest("base64url");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(token, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
