import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { data, error } = await supabase
      .from("products")
      .select("name")
      .limit(2);

    return NextResponse.json({
      env_url: url ? `${url.substring(0, 20)}...` : "MISSING",
      env_key: key ? `${key.substring(0, 20)}...` : "MISSING",
      data,
      error: error?.message || null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
