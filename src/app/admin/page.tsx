"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, FolderOpen, Tags, Users, ShoppingBag } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, brands: 0, customers: 0, orders: 0 });

  useEffect(() => {
    async function load() {
      const [p, c, b, cu, o] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("brands").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        products: p.count || 0, categories: c.count || 0, brands: b.count || 0,
        customers: cu.count || 0, orders: o.count || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Produtos", value: stats.products, icon: Package, color: "bg-blue-500" },
    { label: "Categorias", value: stats.categories, icon: FolderOpen, color: "bg-green-500" },
    { label: "Marcas", value: stats.brands, icon: Tags, color: "bg-purple-500" },
    { label: "Clientes", value: stats.customers, icon: Users, color: "bg-amber-500" },
    { label: "Pedidos", value: stats.orders, icon: ShoppingBag, color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
