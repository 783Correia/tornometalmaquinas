import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Código não recebido" }, { status: 400 });
  }

  const clientId = process.env.BLING_CLIENT_ID!;
  const clientSecret = process.env.BLING_CLIENT_SECRET!;
  const redirectUri = "https://tornometalevertonlopes.com.br/api/bling/callback";

  // Exchange code for tokens
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error, description: tokenData.error_description }, { status: 400 });
  }

  // Store tokens in Supabase (settings table)
  await supabase.from("settings").upsert({
    key: "bling_access_token",
    value: tokenData.access_token,
  }, { onConflict: "key" });

  await supabase.from("settings").upsert({
    key: "bling_refresh_token",
    value: tokenData.refresh_token,
  }, { onConflict: "key" });

  await supabase.from("settings").upsert({
    key: "bling_token_expires",
    value: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
  }, { onConflict: "key" });

  // Redirect to admin
  return NextResponse.redirect("https://tornometalevertonlopes.com.br/admin?bling=connected");
}
