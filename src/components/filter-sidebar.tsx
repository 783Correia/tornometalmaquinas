import Link from "next/link";
import type { Category, Brand } from "@/lib/supabase";

type Props = {
  categories: Category[];
  brands: Brand[];
  activeCategory?: string;
  activeBrand?: string;
};

export function FilterSidebar({
  categories,
  brands,
  activeCategory,
  activeBrand,
}: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">
          Categorias
        </h3>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/loja"
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                !activeCategory && !activeBrand
                  ? "bg-primary text-black font-medium"
                  : "text-gray-400 hover:bg-dark-700 hover:text-white"
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
                      ? "bg-primary text-black font-medium"
                      : "text-gray-400 hover:bg-dark-700 hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">
          Marcas
        </h3>
        <ul className="space-y-0.5">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/loja?marca=${brand.slug}`}
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  activeBrand === brand.slug
                    ? "bg-primary text-black font-medium"
                    : "text-gray-400 hover:bg-dark-700 hover:text-white"
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
