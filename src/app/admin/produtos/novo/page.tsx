"use client";

import { ProductForm } from "@/components/admin/product-form";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Produto</h1>
      <ProductForm />
    </div>
  );
}
