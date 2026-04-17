import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes: pass through (rate limiting real requer Redis/Upstash)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Admin auth is handled client-side via supabase.auth.getUser() in admin/layout.tsx
  // supabase-js stores session in localStorage — middleware cannot read it

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
