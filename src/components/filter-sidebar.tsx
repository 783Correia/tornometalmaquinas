"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category, Brand } from "@/lib/supabase";

type Props = {
  categories: Category[];
  brands: Brand[];
  activeCategory?: string;
  activeBrand?: string;
  priceMin?: string;
  priceMax?: string;
  inStockOnly?: boolean;
  sortBy?: string;
};

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 -mt-1">{children}</div>}
    </div>
  );
}

function PriceFilter({ priceMin, priceMax }: { priceMin?: string; priceMax?: string }) {
  const router = useRouter();
  const [min, setMin] = useState(priceMin || "");
  const [max, setMax] = useState(priceMax || "");

  function apply() {
    const url = new URL(window.location.href);
    if (min) url.searchParams.set("preco_min", min);
    else url.searchParams.delete("preco_min");
    if (max) url.searchParams.set("preco_max", max);
    else url.searchParams.delete("preco_max");
    url.searchParams.delete("pagina");
    router.push(url.pathname + url.search);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-primary transition"
        />
        <input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-primary transition"
        />
      </div>
      <button
        onClick={apply}
        className="w-full bg-gray-900 text-white text-xs font-medium py-2 rounded-lg hover:bg-gray-800 transition"
      >
        Filtrar
      </button>
    </div>
  );
}

function SortSelect({ sortBy }: { sortBy?: string }) {
  const router = useRouter();

  function handleSort(value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("ordem", value);
    else url.searchParams.delete("ordem");
    url.searchParams.delete("pagina");
    router.push(url.pathname + url.search);
  }

  return (
    <select
      value={sortBy || ""}
      onChange={(e) => handleSort(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-primary transition bg-white"
    >
      <option value="">Mais recentes</option>
      <option value="preco_asc">Menor preço</option>
      <option value="preco_desc">Maior preço</option>
      <option value="nome">Nome A-Z</option>
    </select>
  );
}

function StockToggle({ inStockOnly }: { inStockOnly?: boolean }) {
  const router = useRouter();

  function toggle() {
    const url = new URL(window.location.href);
    if (inStockOnly) url.searchParams.delete("estoque");
    else url.searchParams.set("estoque", "1");
    url.searchParams.delete("pagina");
    router.push(url.pathname + url.search);
  }

  return (
    <button
      onClick={toggle}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
        inStockOnly
          ? "bg-green-50 text-green-700 font-medium border border-green-200"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {inStockOnly ? "✓ " : ""}Apenas em estoque
    </button>
  );
}

function CategoryList({ categories, activeCategory, activeBrand }: { categories: Category[]; activeCategory?: string; activeBrand?: string }) {
  const filteredCategories = categories.filter((c) => c.slug !== "sem-categoria");

  return (
    <ul className="space-y-0.5">
      <li>
        <Link
          href="/loja"
          className={`block px-3 py-2 rounded-lg text-sm transition ${
            !activeCategory && !activeBrand
              ? "bg-primary text-white font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-primary"
          }`}
        >
          Todas
        </Link>
      </li>
      {filteredCategories.map((cat) => (
        <li key={cat.id}>
          <Link
            href={`/loja?categoria=${cat.slug}`}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              activeCategory === cat.slug
                ? "bg-primary text-white font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function BrandList({ brands, activeBrand }: { brands: Brand[]; activeBrand?: string }) {
  return (
    <ul className="space-y-0.5">
      {brands.map((brand) => (
        <li key={brand.id}>
          <Link
            href={`/loja?marca=${brand.slug}`}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              activeBrand === brand.slug
                ? "bg-primary text-white font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            {brand.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FilterSidebar({ categories, brands, activeCategory, activeBrand, priceMin, priceMax, inStockOnly, sortBy }: Props) {
  const hasActiveFilter = !!activeCategory || !!activeBrand || !!priceMin || !!priceMax || !!inStockOnly;

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-3 md:space-y-4">
      {/* Mobile: collapsible */}
      <div className="md:hidden space-y-3">
        <CollapsibleSection title="Ordenar" defaultOpen={false}>
          <SortSelect sortBy={sortBy} />
        </CollapsibleSection>

        <CollapsibleSection title="Categorias" defaultOpen={!!activeCategory}>
          <CategoryList categories={categories} activeCategory={activeCategory} activeBrand={activeBrand} />
        </CollapsibleSection>

        <CollapsibleSection title="Marcas" defaultOpen={!!activeBrand}>
          <BrandList brands={brands} activeBrand={activeBrand} />
        </CollapsibleSection>

        <CollapsibleSection title="Preço" defaultOpen={!!priceMin || !!priceMax}>
          <PriceFilter priceMin={priceMin} priceMax={priceMax} />
        </CollapsibleSection>

        <CollapsibleSection title="Disponibilidade" defaultOpen={false}>
          <StockToggle inStockOnly={inStockOnly} />
        </CollapsibleSection>

        {hasActiveFilter && (
          <Link href="/loja" className="block text-center text-sm text-primary font-medium py-2 hover:underline">
            Limpar filtros
          </Link>
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Ordenar</h3>
          <SortSelect sortBy={sortBy} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Categorias</h3>
          <CategoryList categories={categories} activeCategory={activeCategory} activeBrand={activeBrand} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Marcas</h3>
          <BrandList brands={brands} activeBrand={activeBrand} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Preço</h3>
          <PriceFilter priceMin={priceMin} priceMax={priceMax} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Disponibilidade</h3>
          <StockToggle inStockOnly={inStockOnly} />
        </div>

        {hasActiveFilter && (
          <Link href="/loja" className="block text-center text-sm text-primary font-medium py-2 hover:underline">
            Limpar todos os filtros
          </Link>
        )}
      </div>
    </aside>
  );
}
