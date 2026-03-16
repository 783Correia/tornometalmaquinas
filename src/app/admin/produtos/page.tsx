"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

type ProductRow = {
  id: number; name: string; slug: string; sku: string; price: number;
  status: string; categories: { name: string } | null; brands: { name: string } | null;
  product_images: { src: string }[];
};

export default function AdminProdutos() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("products")
      .select("id, name, slug, sku, price, status, categories(name), brands(name), product_images(src)")
      .order("created_at", { ascending: false });
    setProducts((data as unknown as ProductRow[]) || []);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  }

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produtos ({products.length})</h1>
        <Link href="/admin/produtos/novo"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition">
          <Plus size={18} /> Novo Produto
        </Link>
      </div>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 mb-4 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input type="text" placeholder="Buscar por nome ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2.5 w-full text-sm outline-none" />
      </div>

      {loading ? <p className="text-gray-400">Carregando...</p> : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Produto</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-left">Marca</th>
                  <th className="px-4 py-3 text-left">Preço</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                          {p.product_images?.[0] ? (
                            <Image src={p.product_images[0].src} alt="" fill className="object-cover" sizes="40px" />
                          ) : <div className="w-full h-full bg-gray-200" />}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.sku || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.categories?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.brands?.name || "—"}</td>
                    <td className="px-4 py-3 font-medium">R$ {p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/produtos/${p.id}`}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 transition">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum produto encontrado.</p>}
        </div>
      )}
    </div>
  );
}
