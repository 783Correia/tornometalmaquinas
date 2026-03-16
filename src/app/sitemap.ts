import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = "https://tornometalevertonlopes.com.br";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/loja`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contato`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/termos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/trocas`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Product pages
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "publish")
    .order("id");

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${baseUrl}/produto/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
