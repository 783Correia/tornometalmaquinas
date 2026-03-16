import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar } from "@/components/filter-sidebar";

export const dynamic = "force-dynamic";

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
    .select("*, categories(*), brands(*), product_images(*)", { count: "exact" })
    .eq("status", "publish")
    .order("created_at", { ascending: false })
    .range(offset, offset + PER_PAGE - 1);

  if (params.categoria) {
    const { data: cat } = await supabase
      .from("categories").select("id").eq("slug", params.categoria).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.marca) {
    const { data: brand } = await supabase
      .from("brands").select("id").eq("slug", params.marca).single();
    if (brand) query = query.eq("brand_id", brand.id);
  }

  if (params.busca) {
    query = query.ilike("name", `%${params.busca}%`);
  }

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count || 0) / PER_PAGE);

  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {params.busca
              ? `Resultados para "${params.busca}"`
              : params.categoria
              ? `Categoria: ${params.categoria}`
              : params.marca
              ? `Marca: ${params.marca}`
              : "Todos os Produtos"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{count || 0} produtos encontrados</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <FilterSidebar
            categories={categories || []}
            brands={brands || []}
            activeCategory={params.categoria}
            activeBrand={params.marca}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const qs = new URLSearchParams();
                      if (params.categoria) qs.set("categoria", params.categoria);
                      if (params.marca) qs.set("marca", params.marca);
                      if (params.busca) qs.set("busca", params.busca);
                      qs.set("pagina", p.toString());
                      return (
                        <a
                          key={p}
                          href={`/loja?${qs.toString()}`}
                          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                            p === page
                              ? "bg-primary text-white"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {p}
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
