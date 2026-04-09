"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, Package, FolderOpen, Tags, Users, ShoppingBag, LogOut, Menu, X, AlertTriangle, Filter } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderOpen },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/leads", label: "Leads LP", icon: Filter },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") { setAuthorized(true); return; }
    checkAdmin();
    loadAlerts();
  }, [pathname]);

  async function loadAlerts() {
    const [stock, pending] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).lte("stock_quantity", 5),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setLowStockCount(stock.count || 0);
    setPendingOrdersCount(pending.count || 0);
  }

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/admin/login"); return; }
    const { data: admin } = await supabase.from("admins").select("id").eq("id", user.id).single();
    if (!admin) { router.push("/admin/login"); return; }
    setAuthorized(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (!authorized) return <div className="min-h-screen flex items-center justify-center text-gray-400">Verificando...</div>;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0d1b3e] text-white shrink-0">
        <div className="p-4 flex items-center gap-2 border-b border-white/10">
          <Image src="/logo.png" alt="TornoMetal" width={40} height={40} className="rounded-lg" />
          <div>
            <span className="font-bold text-sm">TORNOMETAL</span>
            <span className="text-[10px] text-blue-300/50 block -mt-0.5">Painel Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const badge = item.href === "/admin/produtos" && lowStockCount > 0 ? lowStockCount
              : item.href === "/admin/pedidos" && pendingOrdersCount > 0 ? pendingOrdersCount
              : 0;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                  pathname === item.href ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
                <span className="flex items-center gap-3"><item.icon size={18} /> {item.label}</span>
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-400 transition w-full">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d1b3e] text-white h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="TornoMetal" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-sm">ADMIN</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-60 h-full bg-[#0d1b3e] text-white pt-14" onClick={(e) => e.stopPropagation()}>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const badge = item.href === "/admin/produtos" && lowStockCount > 0 ? lowStockCount
                  : item.href === "/admin/pedidos" && pendingOrdersCount > 0 ? pendingOrdersCount
                  : 0;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                      pathname === item.href ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white"
                    }`}>
                    <span className="flex items-center gap-3"><item.icon size={18} /> {item.label}</span>
                    {badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/10">
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-red-400 w-full">
                <LogOut size={18} /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 lg:p-6 p-4 pt-18 lg:pt-6 overflow-auto">{children}</main>
    </div>
  );
}
