import { NextResponse, type NextRequest } from "next/server";

/** Shared guard for GET /api/cron/* — Authorization: Bearer CRON_SECRET */
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

export function cronUnauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
