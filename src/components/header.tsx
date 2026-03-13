"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-500">
              TornoMetal
            </span>
            <span className="text-sm text-gray-400 hidden sm:block">
              Everton Lopes
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-800 rounded-lg overflow-hidden flex-1 max-w-md mx-8"
          >
            <input
              type="text"
              placeholder="Buscar peças..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent px-4 py-2 w-full text-sm outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-3 py-2 text-gray-400 hover:text-amber-500"
            >
              <Search size={18} />
            </button>
          </form>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-amber-500 transition">
              Início
            </Link>
            <Link href="/loja" className="hover:text-amber-500 transition">
              Loja
            </Link>
            <Link href="/contato" className="hover:text-amber-500 transition">
              Contato
            </Link>
            <Link href="/carrinho" className="relative hover:text-amber-500 transition">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800">
            <form onSubmit={handleSearch} className="flex mt-3 mb-3">
              <input
                type="text"
                placeholder="Buscar peças..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-800 px-4 py-2 w-full text-sm rounded-l-lg outline-none"
              />
              <button
                type="submit"
                className="bg-amber-500 px-3 rounded-r-lg text-black"
              >
                <Search size={18} />
              </button>
            </form>
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-amber-500"
            >
              Início
            </Link>
            <Link
              href="/loja"
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-amber-500"
            >
              Loja
            </Link>
            <Link
              href="/contato"
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-amber-500"
            >
              Contato
            </Link>
            <Link
              href="/carrinho"
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-amber-500"
            >
              Carrinho ({totalItems})
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
