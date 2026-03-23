"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Star, AlertTriangle } from "lucide-react";

type ProductRow = {
  id: number; name: string; slug: string; sku: string; price: number;
  stock_quantity: number; featured: boolean; manage_stock: boolean;
  status: string; categories: { name: string } | null; brands: { name: string } | null;
  product_images: { src: string }[];
};

const PAGE_SIZE = 20;

export default function AdminProdutos() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("products")
      .select("id, name, slug, sku, price, stock_quantity, featured, manage_stock, status, categories(name), brands(name), product_images(src)")
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

  async function toggleFeatured(id: number, current: boolean) {
    await supabase.from("products").update({ featured: !current }).eq("id", id);
    setProducts(products.map((p) => p.id === id ? { ...p, featured: !current } : p));
  }

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    : products;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  function stockColor(qty: number) {
    if (qty === 0) return "text-red-600 bg-red-50";
    if (qty <= 5) return "text-yellow-700 bg-yellow-50";
    return "text-green-700 bg-green-50";
  }

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
        <>
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
                    <th className="px-4 py-3 text-center">Estoque</th>
                    <th className="px-4 py-3 text-center">Destaque</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                            {p.product_images?.[0] ? (
                              <Image src={p.product_images[0].src} alt="" fill className="object-cover" sizes="40px" />
                            ) : <div className="w-full h-full bg-gray-200" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                            {p.status === "draft" && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">Rascunho</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.sku || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{(p.categories as any)?.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{(p.brands as any)?.name || "—"}</td>
                      <td className="px-4 py-3 font-medium">R$ {p.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stockColor(p.stock_quantity)}`}>
                          {p.stock_quantity === 0 && <AlertTriangle size={12} />}
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleFeatured(p.id, p.featured)}
                          className={`p-1.5 rounded-lg transition ${p.featured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-400"}`}
                          title={p.featured ? "Remover destaque" : "Destacar produto"}>
                          <Star size={18} fill={p.featured ? "currentColor" : "none"} />
                        </button>
                      </td>
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
            {paginated.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum produto encontrado.</p>}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      p === page ? "bg-primary text-white" : "border border-gray-200 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
