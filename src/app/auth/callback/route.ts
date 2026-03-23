import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/minha-conta";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";

  if (token_hash && type) {
    const response = NextResponse.redirect(new URL(next, siteUrl));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });

    if (!error) {
      return response;
    }
  }

  // If verification fails or no token, redirect to login
  return NextResponse.redirect(new URL("/login?error=link_expirado", siteUrl));
}
