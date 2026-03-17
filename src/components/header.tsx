"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 bg-[#0d1b3e]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-[72px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="TornoMetal"
              width={56}
              height={56}
              className="rounded-full"
              priority
            />
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg tracking-wide">
                TORNOMETAL
              </span>
              <span className="text-[10px] text-blue-300/60 block -mt-0.5 tracking-wider">
                Everton Lopes
              </span>
            </div>
          </Link>

          {/* Nav links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: "/", label: "HOME" },
              { href: "/loja", label: "TODOS OS PRODUTOS" },
              { href: "/revenda", label: "REVENDA" },
              { href: "/contato", label: "CONTATO" },
            ].map((link, i) => (
              <div key={link.href} className="flex items-center">
                {i > 0 && <span className="text-blue-400/30 mx-2">|</span>}
                <Link
                  href={link.href}
                  className="text-sm font-medium text-white/80 hover:text-white tracking-wide transition"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm">
            <div className="flex w-full bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="flex items-center pl-3 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2.5 w-full text-sm outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5">
            <div className="text-right">
              {user ? (
                <Link href="/minha-conta" className="group">
                  <span className="text-[11px] text-blue-300/50 block">Bem-vindo</span>
                  <span className="text-sm font-bold text-primary-light hover:text-white transition">Minha Conta</span>
                </Link>
              ) : (
                <Link href="/login" className="group">
                  <span className="text-[11px] text-blue-300/50 block">Entrar / Cadastrar</span>
                  <span className="text-sm font-bold text-primary-light hover:text-white transition">Minha Conta</span>
                </Link>
              )}
            </div>
            <Link href="/carrinho" className="relative text-white/80 hover:text-white transition">
              <ShoppingCart size={26} />
              <span className="absolute -top-2 -right-2 bg-primary-light text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/carrinho" className="relative text-white/80">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-light text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-white/80">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1b3e] border-t border-white/10 px-4 pb-4">
          <form onSubmit={handleSearch} className="flex mt-3 mb-4">
            <div className="flex w-full bg-white rounded-lg overflow-hidden">
              <div className="flex items-center pl-3 text-gray-400"><Search size={16} /></div>
              <input type="text" placeholder="Pesquisar produtos..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="px-3 py-2.5 w-full text-sm outline-none" />
            </div>
          </form>
          {[
            { href: "/", label: "Home" },
            { href: "/loja", label: "Todos os Produtos" },
            { href: "/revenda", label: "Revenda" },
            { href: "/contato", label: "Contato" },
          ].map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-white/70 hover:text-white border-b border-white/5 text-sm">
              {link.label}
            </Link>
          ))}
          <div className="mt-3">
            {user ? (
              <Link href="/minha-conta" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-primary-light text-sm font-medium py-2">
                <User size={16} /> Minha Conta
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center border border-white/20 text-white py-2.5 rounded-lg text-sm">Entrar</Link>
                <Link href="/cadastro" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center bg-primary-light text-white py-2.5 rounded-lg text-sm font-semibold">Cadastrar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
