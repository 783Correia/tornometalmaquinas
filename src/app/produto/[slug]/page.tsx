import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, short_description, brands(name), categories(name), product_images(src)")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Produto não encontrado" };

  const title = product.name;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brandName = (product.brands as any)?.name;
  const description = product.short_description
    || `${product.name}${brandName ? ` - ${brandName}` : ""}. Peça para plantadeira com envio para todo o Brasil. TornoMetal Everton Lopes.`;
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.name,
    sku: product.sku || undefined,
    image: product.product_images?.[0]?.src || undefined,
    brand: product.brands ? { "@type": "Brand", name: product.brands.name } : undefined,
    category: product.categories?.name || undefined,
    url: `${siteUrl}/produto/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.sale_price || product.price,
      priceCurrency: "BRL",
      availability: product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/produto/${product.slug}`,
      seller: { "@type": "Organization", name: "TornoMetal Everton Lopes" },
    },
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
