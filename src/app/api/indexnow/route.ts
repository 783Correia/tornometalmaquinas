import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INDEXNOW_KEY = "9b32a52a50c95ffb11c36201a452b0a3";
const SITE_URL = "https://tornometalevertonlopes.com.br";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    const { data: products } = await supabase
      .from("products")
      .select("slug")
      .eq("status", "publish");

    const staticUrls = [
      SITE_URL,
      `${SITE_URL}/loja`,
      `${SITE_URL}/contato`,
    ];

    const productUrls = (products || []).map(
      (p) => `${SITE_URL}/produto/${p.slug}`
    );

    const urlList = [...staticUrls, ...productUrls];

    const payload = {
      host: "tornometalevertonlopes.com.br",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      urlsSubmitted: urlList.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Allow GET to trigger manually
export async function GET() {
  return POST();
}
