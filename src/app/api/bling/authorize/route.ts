import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.BLING_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalmaquinas.vercel.app"}/api/bling/callback`;

  const url = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=tornometal`;

  return NextResponse.redirect(url);
}
