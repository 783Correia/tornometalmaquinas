import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, short_description, sku, brands(name), categories(name), product_images(src)")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Produto não encontrado", robots: { index: false } };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brandName = (product.brands as any)?.name;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryName = (product.categories as any)?.name;
  const sku = product.sku || "";

  // Title includes SKU so people searching by code find it
  const title = sku
    ? `${product.name} - ${sku}`
    : product.name;

  // Description rich in keywords: name, SKU, brand, category
  const description = product.short_description
    || [
      product.name,
      sku ? `Código ${sku}` : "",
      brandName ? `Marca ${brandName}` : "",
      categoryName || "",
      "Peça para plantadeira",
      "Envio para todo o Brasil",
      "TornoMetal Everton Lopes",
    ].filter(Boolean).join(". ") + ".";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const image = (product.product_images as any)?.[0]?.src;
  const url = `https://tornometalevertonlopes.com.br/produto/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
  } catch {
    return { title: "TornoMetal - Peças para Plantadeiras" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(*), brands(*), product_images(*)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  // Sort images by position
  if (product.product_images) {
    product.product_images.sort((a: { position?: number }, b: { position?: number }) => (a.position ?? 0) - (b.position ?? 0));
  }

  // Related products
  const { data: related } = await supabase
    .from("products")
    .select("*, categories(*), brands(*), product_images(*)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";
  const productUrl = `${siteUrl}/produto/${product.slug}`;
  const allImages = (product.product_images || []).map((img: { src: string }) => img.src);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || `${product.name}${product.sku ? ` - Código ${product.sku}` : ""}. Peça para plantadeira.`,
    sku: product.sku || undefined,
    mpn: product.sku || undefined,
    image: allImages.length > 0 ? allImages : undefined,
    brand: product.brands ? { "@type": "Brand", name: product.brands.name } : undefined,
    category: product.categories?.name || undefined,
    url: productUrl,
    offers: {
      "@type": "Offer",
      price: product.sale_price || product.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "TornoMetal Everton Lopes",
        url: siteUrl,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "BR",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        applicableCountry: "BR",
      },
    },
    ...(product.weight > 0 ? { weight: { "@type": "QuantitativeValue", value: product.weight, unitCode: "KGM" } } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Loja", item: `${siteUrl}/loja` },
      ...(product.categories ? [{ "@type": "ListItem", position: 3, name: product.categories.name, item: `${siteUrl}/loja?categoria=${product.categories.slug}` }] : []),
      { "@type": "ListItem", position: product.categories ? 4 : 3, name: product.name, item: `${siteUrl}/produto/${product.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><a href="/" className="hover:text-primary transition">Início</a></li>
            <li>/</li>
            <li><a href="/loja" className="hover:text-primary transition">Loja</a></li>
            {product.categories && (
              <>
                <li>/</li>
                <li><a href={`/loja?categoria=${product.categories.slug}`} className="hover:text-primary transition">{product.categories.name}</a></li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>
      </div>
      <ProductDetail product={product} related={related || []} />
    </>
  );
}
