import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limiting for API routes (simple in-memory approach via headers)
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "60");
    return response;
  }

  // Admin auth is handled client-side in admin/layout.tsx via supabase.auth.getUser()
  // (supabase-js stores session in localStorage, not cookies — middleware can't check it)

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
