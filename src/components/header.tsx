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
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-black text-xs font-medium text-center py-1.5 px-4">
        Peças para Plantadeiras com entrega para todo o Brasil
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">TM</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white">TornoMetal</span>
              <span className="text-xs text-gray-500 block -mt-1">
                Everton Lopes
              </span>
            </div>
          </Link>

          {/* Search - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-dark-700 border border-dark-500 rounded-xl overflow-hidden flex-1 max-w-lg mx-6"
          >
            <input
              type="text"
              placeholder="Buscar peças por nome, SKU ou marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent px-4 py-2.5 w-full text-sm outline-none placeholder-gray-500 text-white"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-black hover:bg-primary-light transition"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Auth */}
            {user ? (
              <Link
                href="/minha-conta"
                className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition"
              >
                <User size={18} />
                <span className="max-w-[100px] truncate">Minha Conta</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition"
              >
                <LogIn size={18} />
                <span>Entrar</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/carrinho"
              className="relative p-2 text-gray-400 hover:text-primary transition"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm pb-3">
          <Link href="/" className="text-gray-400 hover:text-primary transition">
            Início
          </Link>
          <Link href="/loja" className="text-gray-400 hover:text-primary transition">
            Todos os Produtos
          </Link>
          <Link href="/loja?categoria=condutor" className="text-gray-400 hover:text-primary transition">
            Condutores
          </Link>
          <Link href="/loja?categoria=telescopio" className="text-gray-400 hover:text-primary transition">
            Telescópios
          </Link>
          <Link href="/loja?categoria=bocal" className="text-gray-400 hover:text-primary transition">
            Bocais
          </Link>
          <Link href="/loja?categoria=revestimento" className="text-gray-400 hover:text-primary transition">
            Revestimentos
          </Link>
          <Link href="/contato" className="text-gray-400 hover:text-primary transition">
            Contato
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-4 pb-4">
          <form onSubmit={handleSearch} className="flex mt-3 mb-4">
            <input
              type="text"
              placeholder="Buscar peças..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-dark-700 px-4 py-2.5 w-full text-sm rounded-l-xl outline-none text-white"
            />
            <button
              type="submit"
              className="bg-primary px-4 rounded-r-xl text-black"
            >
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
              className="block py-2.5 text-gray-400 hover:text-primary border-b border-dark-700"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3">
            {user ? (
              <Link
                href="/minha-conta"
                onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-dark-700 text-primary py-2.5 rounded-xl text-sm"
              >
                <User size={16} /> Minha Conta
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-dark-700 text-white py-2.5 rounded-xl text-sm"
                >
                  <LogIn size={16} /> Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-black py-2.5 rounded-xl text-sm font-semibold"
                >
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
