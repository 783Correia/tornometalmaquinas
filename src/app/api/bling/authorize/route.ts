import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://tornometalmaquinas.vercel.app";

export async function GET(req: NextRequest) {
  const clientId = process.env.BLING_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "BLING_CLIENT_ID não configurado" }, { status: 500 });
  }

  const redirectUri = `${SITE_URL}/api/bling/callback`;
  const url = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=tornometal`;

  return NextResponse.redirect(url);
}
