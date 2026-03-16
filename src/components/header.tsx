"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X, User, LogIn } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-white text-xs font-medium text-center py-1.5 px-4">
        Peças para Plantadeiras com entrega para todo o Brasil
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Main header */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">TM</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-900">TornoMetal</span>
              <span className="text-xs text-gray-500 block -mt-1">Everton Lopes</span>
            </div>
          </Link>

          {/* Search - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xl"
          >
            <div className="flex w-full border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary transition">
              <input
                type="text"
                placeholder="Buscar peças por nome, SKU ou marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2.5 w-full text-sm outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-5 bg-primary text-white hover:bg-primary-dark transition"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/minha-conta"
                className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <User size={18} />
                <span>Minha Conta</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <LogIn size={18} />
                <span>Entrar</span>
              </Link>
            )}

            <Link
              href="/carrinho"
              className="relative p-2.5 text-gray-600 hover:text-primary transition rounded-lg hover:bg-gray-50"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-1 pb-2 -mx-2">
          {[
            { href: "/", label: "Início" },
            { href: "/loja", label: "Todos os Produtos" },
            { href: "/loja?categoria=condutor", label: "Condutores" },
            { href: "/loja?categoria=telescopio", label: "Telescópios" },
            { href: "/loja?categoria=bocal", label: "Bocais" },
            { href: "/loja?categoria=revestimento", label: "Revestimentos" },
            { href: "/contato", label: "Contato" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 shadow-lg">
          <form onSubmit={handleSearch} className="flex mt-3 mb-4">
            <input
              type="text"
              placeholder="Buscar peças..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-2 border-gray-200 px-4 py-2.5 w-full text-sm rounded-l-xl outline-none focus:border-primary"
            />
            <button type="submit" className="bg-primary px-4 rounded-r-xl text-white">
              <Search size={18} />
            </button>
          </form>
          {[
            { href: "/", label: "Início" },
            { href: "/loja", label: "Todos os Produtos" },
            { href: "/loja?categoria=condutor", label: "Condutores" },
            { href: "/loja?categoria=telescopio", label: "Telescópios" },
            { href: "/loja?categoria=bocal", label: "Bocais" },
            { href: "/contato", label: "Contato" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-gray-700 hover:text-primary border-b border-gray-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3">
            {user ? (
              <Link href="/minha-conta" onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-primary py-2.5 rounded-xl text-sm font-medium">
                <User size={16} /> Minha Conta
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm">
                  <LogIn size={16} /> Entrar
                </Link>
                <Link href="/cadastro" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
