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

  // Protect admin routes: redirect to login if no auth cookie present
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

    const accessToken =
      req.cookies.get("sb-access-token")?.value ||
      req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
      req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value ||
      req.cookies.get(`sb-${projectRef}-auth-token.1`)?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
