import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar } from "@/components/filter-sidebar";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    busca?: string;
    pagina?: string;
  }>;
};

const PER_PAGE = 20;

export default async function LojaPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.pagina || "1");
  const offset = (page - 1) * PER_PAGE;

  let query = supabase
    .from("products")
    .select("*, categories(*), brands(*), product_images(*)", {
      count: "exact",
    })
    .eq("status", "publish")
    .order("created_at", { ascending: false })
    .range(offset, offset + PER_PAGE - 1);

  if (params.categoria) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categoria)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.marca) {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", params.marca)
      .single();
    if (brand) query = query.eq("brand_id", brand.id);
  }

  if (params.busca) {
    query = query.ilike("name", `%${params.busca}%`);
  }

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count || 0) / PER_PAGE);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  const activeCategory = params.categoria;
  const activeBrand = params.marca;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Loja</h1>
      {params.busca && (
        <p className="text-gray-500 mb-4">
          Resultados para: &quot;{params.busca}&quot; ({count} encontrados)
        </p>
      )}
      {activeCategory && (
        <p className="text-gray-500 mb-4">
          Categoria:{" "}
          <span className="text-amber-600 font-medium">{activeCategory}</span>
        </p>
      )}
      {activeBrand && (
        <p className="text-gray-500 mb-4">
          Marca:{" "}
          <span className="text-amber-600 font-medium">{activeBrand}</span>
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <FilterSidebar
          categories={categories || []}
          brands={brands || []}
          activeCategory={activeCategory}
          activeBrand={activeBrand}
        />

        <div className="flex-1">
          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      const params2 = new URLSearchParams();
                      if (params.categoria)
                        params2.set("categoria", params.categoria);
                      if (params.marca) params2.set("marca", params.marca);
                      if (params.busca) params2.set("busca", params.busca);
                      params2.set("pagina", p.toString());

                      return (
                        <a
                          key={p}
                          href={`/loja?${params2.toString()}`}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            p === page
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {p}
                        </a>
                      );
                    }
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
