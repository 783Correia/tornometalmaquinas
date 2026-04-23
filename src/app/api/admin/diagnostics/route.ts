import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const referer = req.headers.get("referer") || "";
  const origin = req.headers.get("origin") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";

  const isInternal = referer.startsWith(siteUrl) || origin.startsWith(siteUrl)
    || referer.includes("localhost") || origin.includes("localhost");

  if (!isInternal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, sku, price, sale_price, status, product_images(src)")
    .order("name");

  if (!products) return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 });

  const noPrice = products.filter(
    (p) => !p.price && !p.sale_price
  );
  const noImage = products.filter(
    (p) => !p.product_images || p.product_images.length === 0
  );
  const noPriceAndNoImage = products.filter(
    (p) => (!p.price && !p.sale_price) && (!p.product_images || p.product_images.length === 0)
  );
  const unpublished = products.filter((p) => p.status !== "publish");
  const ok = products.filter(
    (p) => p.status === "publish" && (p.price || p.sale_price) && p.product_images?.length > 0
  );

  return NextResponse.json({
    resumo: {
      total: products.length,
      prontos_para_google: ok.length,
      sem_preco: noPrice.length,
      sem_imagem: noImage.length,
      sem_preco_e_sem_imagem: noPriceAndNoImage.length,
      nao_publicados: unpublished.length,
    },
    sem_preco: noPrice.map((p) => ({
      id: p.id,
      nome: p.name,
      sku: p.sku,
      slug: p.slug,
      status: p.status,
      admin_url: `https://tornometalevertonlopes.com.br/admin/produtos`,
    })),
    sem_imagem: noImage.map((p) => ({
      id: p.id,
      nome: p.name,
      sku: p.sku,
      slug: p.slug,
      status: p.status,
    })),
    nao_publicados: unpublished.map((p) => ({
      id: p.id,
      nome: p.name,
      sku: p.sku,
      status: p.status,
    })),
  });
}
