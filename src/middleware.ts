import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

// In-memory store (resets on cold start — good enough for edge rate limiting)
const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = hits.get(ip);
  if (!record || now - record.ts > RATE_LIMIT_WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }
  record.count += 1;
  if (record.count > RATE_LIMIT_MAX) return false;
  return true;
}

const SENSITIVE_API_PATHS = [
  "/api/checkout",
  "/api/payment",
  "/api/register",
  "/api/melhorenvio",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (SENSITIVE_API_PATHS.some((p) => pathname.startsWith(p))) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
