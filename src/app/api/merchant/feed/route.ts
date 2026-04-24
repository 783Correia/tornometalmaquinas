import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = "https://tornometalevertonlopes.com.br";

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, categories(name, slug), brands(name), product_images(src, position)")
    .eq("status", "publish")
    .order("id");

  if (error || !products) {
    return new NextResponse("Erro ao carregar produtos", { status: 500 });
  }

  const items = products
    .filter((p) => Number(p.price || p.sale_price || 0) > 0) // skip products with no price
    .map((p) => {
      const actualPrice = Number(p.sale_price || p.price);
      const originalPrice = Number(p.regular_price || p.price);
      const hasSalePrice = p.sale_price && Number(p.sale_price) < originalPrice;

      const images = (p.product_images || [])
        .sort((a: { position?: number }, b: { position?: number }) => (a.position ?? 0) - (b.position ?? 0));
      const mainImage = images[0]?.src || "";

      // Skip products without image — Google requires it
      if (!mainImage) return null;

      const additionalImages = images.slice(1, 10)
        .map((img: { src: string }) => `<g:additional_image_link>${escapeXml(img.src)}</g:additional_image_link>`)
        .join("\n      ");

      const productUrl = `${SITE_URL}/produto/${p.slug}`;
      const id = `tm_${p.id}`; // unique prefix to avoid conflict with Content API
      const brand = (p.brands as { name: string } | null)?.name || "TornoMetal Everton Lopes";
      const category = (p.categories as { name: string } | null)?.name || "Peças para Plantadeiras";
      const description = escapeXml(
        p.short_description ||
        `${p.name}${p.sku ? ` - Código ${p.sku}` : ""}. Peça para plantadeira. ${brand}.`
      );

      // Google rule: identifier_exists=no ONLY when no gtin, no mpn, no brand
      // We always have brand, and often have mpn (sku) — so NEVER set identifier_exists=no
      // Instead: submit brand + mpn (sku). Google accepts this for parts without GTIN.

      return `
    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
      ${additionalImages}
      <g:availability>in_stock</g:availability>
      <g:price>${hasSalePrice ? originalPrice.toFixed(2) : actualPrice.toFixed(2)} BRL</g:price>
      ${hasSalePrice ? `<g:sale_price>${actualPrice.toFixed(2)} BRL</g:sale_price>` : ""}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:google_product_category>3237</g:google_product_category>
      ${p.sku ? `<g:mpn>${escapeXml(p.sku)}</g:mpn>` : "<g:identifier_exists>no</g:identifier_exists>"}
      <g:shipping>
        <g:country>BR</g:country>
        <g:price>0 BRL</g:price>
      </g:shipping>
      <g:return_policy_label>default-return-policy</g:return_policy_label>
      <g:excluded_destination>local_inventory_ads</g:excluded_destination>
      <g:excluded_destination>free_local_listings</g:excluded_destination>
    </item>`;
    })
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>TornoMetal Everton Lopes - Peças para Plantadeiras</title>
    <link>${SITE_URL}</link>
    <description>Fábrica de peças para plantadeiras em Passo Fundo/RS. Mais de 25 anos de tradição.</description>
    ${items.join("")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
