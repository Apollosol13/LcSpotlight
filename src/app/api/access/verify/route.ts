import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  getConfiguredAccessCodes,
  isInviteGateEnabled,
  signAccessTokenForCode,
} from "@/lib/membership-access";

export async function POST(req: NextRequest) {
  if (!isInviteGateEnabled()) {
    return NextResponse.json(
      { error: "Invite gate is not configured" },
      { status: 400 },
    );
  }

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = typeof body.code === "string" ? body.code.trim().toLowerCase() : "";
  if (!raw) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const allowed = getConfiguredAccessCodes();
  if (!allowed.includes(raw)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = await signAccessTokenForCode(raw);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}
