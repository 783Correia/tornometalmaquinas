"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category, Brand } from "@/lib/supabase";

type Props = {
  categories: Category[];
  brands: Brand[];
  activeCategory?: string;
  activeBrand?: string;
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

export function FilterSidebar({ categories, brands, activeCategory, activeBrand }: Props) {
  const filteredCategories = categories.filter((c) => c.slug !== "sem-categoria");
  const hasActiveFilter = !!activeCategory || !!activeBrand;

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-3 md:space-y-4">
      {/* Mobile: collapsible / Desktop: always open */}
      <div className="md:hidden space-y-3">
        <CollapsibleSection title="Categorias" defaultOpen={!!activeCategory}>
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
        </CollapsibleSection>

        <CollapsibleSection title="Marcas" defaultOpen={!!activeBrand}>
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
        </CollapsibleSection>

        {hasActiveFilter && (
          <Link
            href="/loja"
            className="block text-center text-sm text-primary font-medium py-2 hover:underline"
          >
            Limpar filtros
          </Link>
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
            Categorias
          </h3>
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
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
            Marcas
          </h3>
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
        </div>
      </div>
    </aside>
  );
}
