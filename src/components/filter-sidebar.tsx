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
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
          Categorias
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/loja"
              className={`block px-3 py-1.5 rounded text-sm transition ${
                !activeCategory
                  ? "bg-amber-500 text-white"
                  : "hover:bg-gray-100"
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
                  className={`block px-3 py-1.5 rounded text-sm transition ${
                    activeCategory === cat.slug
                      ? "bg-amber-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
          Marcas
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/loja"
              className={`block px-3 py-1.5 rounded text-sm transition ${
                !activeBrand
                  ? "bg-amber-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Todas
            </Link>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/loja?marca=${brand.slug}`}
                className={`block px-3 py-1.5 rounded text-sm transition ${
                  activeBrand === brand.slug
                    ? "bg-amber-500 text-white"
                    : "hover:bg-gray-100"
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
