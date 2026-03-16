"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProductForm } from "@/components/admin/product-form";

export default function EditarProdutoPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("products").select("*, product_images(*)").eq("id", id).single();
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-gray-400">Carregando...</p>;
  if (!product) return <p className="text-red-500">Produto não encontrado.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Produto</h1>
      <ProductForm product={product} />
    </div>
  );
}
