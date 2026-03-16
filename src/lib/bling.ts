import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getBlingToken(): Promise<string | null> {
  const { data: tokenRow } = await supabase.from("settings").select("value").eq("key", "bling_access_token").single();
  const { data: expiresRow } = await supabase.from("settings").select("value").eq("key", "bling_token_expires").single();

  if (!tokenRow?.value) return null;

  // Check if expired
  if (expiresRow?.value && new Date(expiresRow.value) < new Date()) {
    // Refresh token
    const refreshed = await refreshBlingToken();
    return refreshed;
  }

  return tokenRow.value;
}

async function refreshBlingToken(): Promise<string | null> {
  const { data: refreshRow } = await supabase.from("settings").select("value").eq("key", "bling_refresh_token").single();
  if (!refreshRow?.value) return null;

  const clientId = process.env.BLING_CLIENT_ID!;
  const clientSecret = process.env.BLING_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshRow.value,
    }),
  });

  const data = await res.json();
  if (data.error) return null;

  await supabase.from("settings").upsert({ key: "bling_access_token", value: data.access_token }, { onConflict: "key" });
  await supabase.from("settings").upsert({ key: "bling_refresh_token", value: data.refresh_token }, { onConflict: "key" });
  await supabase.from("settings").upsert({
    key: "bling_token_expires",
    value: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }, { onConflict: "key" });

  return data.access_token;
}

export async function blingApi(endpoint: string, method = "GET", body?: object) {
  const token = await getBlingToken();
  if (!token) throw new Error("Bling não conectado");

  const res = await fetch(`https://www.bling.com.br/Api/v3${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}
