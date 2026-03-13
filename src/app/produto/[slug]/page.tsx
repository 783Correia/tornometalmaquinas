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
    .select("name, short_description")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Produto não encontrado" };

  return {
    title: `${product.name} | TornoMetal`,
    description: product.short_description || product.name,
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

  // Related products
  const { data: related } = await supabase
    .from("products")
    .select("*, categories(*), brands(*), product_images(*)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return <ProductDetail product={product} related={related || []} />;
}
