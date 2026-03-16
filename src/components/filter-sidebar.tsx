import Link from "next/link";
import type { Category, Brand } from "@/lib/supabase";

type Props = {
  categories: Category[];
  brands: Brand[];
  activeCategory?: string;
  activeBrand?: string;
};

export function FilterSidebar({ categories, brands, activeCategory, activeBrand }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0 space-y-4">
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
          {categories
            .filter((c) => c.slug !== "sem-categoria")
            .map((cat) => (
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
    </aside>
  );
}
