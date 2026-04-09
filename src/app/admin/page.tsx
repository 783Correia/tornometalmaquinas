"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Package, FolderOpen, Tags, Users, ShoppingBag,
  DollarSign, Clock, AlertTriangle, TrendingUp, Eye, Filter,
} from "lucide-react";

type RecentOrder = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  payment_status?: string;
  customers?: { full_name: string };
};

type LowStockProduct = {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processando", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0, categories: 0, brands: 0, customers: 0, orders: 0,
    revenue: 0, pendingOrders: 0, monthRevenue: 0, monthOrders: 0,
    leadsNovos: 0, leadsTotal: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [p, c, b, cu, orders, pendingOrders, monthOrders, lowStockProducts, recent, leadsNovos, leadsTotal] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("brands").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total, status"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id, total, status").gte("created_at", monthStart),
        supabase.from("products").select("id, name, sku, stock_quantity").lte("stock_quantity", 5).order("stock_quantity", { ascending: true }).limit(10),
        supabase.from("orders").select("id, status, total, created_at, payment_status, customers(full_name)").order("created_at", { ascending: false }).limit(8),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);

      const allOrders = orders.data || [];
      const paidOrders = allOrders.filter((o) => o.status !== "cancelled");
      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      const mOrders = monthOrders.data || [];
      const mPaid = mOrders.filter((o) => o.status !== "cancelled");
      const mRevenue = mPaid.reduce((sum, o) => sum + Number(o.total || 0), 0);

      setStats({
        products: p.count || 0,
        categories: c.count || 0,
        brands: b.count || 0,
        customers: cu.count || 0,
        orders: allOrders.length,
        revenue: totalRevenue,
        pendingOrders: pendingOrders.count || 0,
        monthRevenue: mRevenue,
        monthOrders: mPaid.length,
        leadsNovos: leadsNovos.count || 0,
        leadsTotal: leadsTotal.count || 0,
      });

      setLowStock((lowStockProducts.data as LowStockProduct[]) || []);
      setRecentOrders((recent.data as unknown as RecentOrder[]) || []);
    }
    load();
  }, []);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(stats.revenue)}</p>
          <p className="text-sm text-gray-500">Receita Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(stats.monthRevenue)}</p>
          <p className="text-sm text-gray-500">Receita do Mês ({stats.monthOrders} pedidos)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} className="text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
          <p className="text-sm text-gray-500">Pedidos Pendentes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mb-3">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">{lowStock.length}</p>
          <p className="text-sm text-gray-500">Produtos Estoque Baixo</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Produtos", value: stats.products, icon: Package, color: "bg-blue-500", href: "/admin/produtos" },
          { label: "Categorias", value: stats.categories, icon: FolderOpen, color: "bg-green-500", href: "/admin/categorias" },
          { label: "Marcas", value: stats.brands, icon: Tags, color: "bg-purple-500", href: "/admin/marcas" },
          { label: "Clientes", value: stats.customers, icon: Users, color: "bg-amber-500", href: "/admin/clientes" },
          { label: "Pedidos", value: stats.orders, icon: ShoppingBag, color: "bg-red-500", href: "/admin/pedidos" },
          { label: `Leads LP (${stats.leadsNovos} novos)`, value: stats.leadsTotal, icon: Filter, color: "bg-indigo-500", href: "/admin/leads" },
        ].map((c) => (
          <Link key={c.label} href={c.href} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-primary/30 transition group">
            <div className={`w-9 h-9 ${c.color} rounded-lg flex items-center justify-center mb-2`}>
              <c.icon size={18} className="text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 group-hover:text-primary transition">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Eye size={14} /> Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Nenhum pedido ainda.</p>
            ) : (
              recentOrders.map((order) => {
                const st = statusLabels[order.status] || statusLabels.pending;
                return (
                  <Link key={order.id} href="/admin/pedidos" className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm">#{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${st.color}`}>{st.label}</span>
                      <span className="text-sm text-gray-500 truncate">{(order.customers as any)?.full_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-sm text-gray-900">{fmt(Number(order.total))}</span>
                      <span className="text-[11px] text-gray-400">{new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" /> Estoque Baixo
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Estoque OK para todos os produtos.</p>
            ) : (
              lowStock.map((p) => (
                <Link key={p.id} href={`/admin/produtos/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.sku || "Sem SKU"}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-2 ${
                    p.stock_quantity === 0 ? "text-red-500" : "text-yellow-600"
                  }`}>
                    {p.stock_quantity} un
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
