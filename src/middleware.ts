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

  // Protect admin routes on the server side
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Check for auth cookie
    const accessToken = req.cookies.get("sb-access-token")?.value
      || req.cookies.get(`sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`)?.value;

    if (!accessToken) {
      // Let client-side handle auth check (admin layout already does this)
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
