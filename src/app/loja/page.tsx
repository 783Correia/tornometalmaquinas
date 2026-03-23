import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Loja - Peças para Plantadeiras",
  description:
    "Compre peças para plantadeiras online. Condutores, dosadores, telescópios, engrenagens e mais. Semeato, John Deere, Massey, Imasa, Jumil. Entrega para todo o Brasil.",
  alternates: { canonical: "https://tornometalevertonlopes.com.br/loja" },
  openGraph: {
    title: "Loja TornoMetal - Peças para Plantadeiras",
    description: "Catálogo completo de peças para plantadeiras. Mais de 160 produtos disponíveis.",
    url: "https://tornometalevertonlopes.com.br/loja",
  },
};

type Props = {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    busca?: string;
    pagina?: string;
    preco_min?: string;
    preco_max?: string;
    estoque?: string;
    ordem?: string;
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

  if (params.preco_min) {
    query = query.gte("price", Number(params.preco_min));
  }

  if (params.preco_max) {
    query = query.lte("price", Number(params.preco_max));
  }

  if (params.estoque === "1") {
    query = query.gt("stock_quantity", 0);
  }

  if (params.ordem === "preco_asc") {
    query = query.order("price", { ascending: true });
  } else if (params.ordem === "preco_desc") {
    query = query.order("price", { ascending: false });
  } else if (params.ordem === "nome") {
    query = query.order("name", { ascending: true });
  }

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count || 0) / PER_PAGE);

  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  const siteUrl = "https://tornometalevertonlopes.com.br";
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Peças para Plantadeiras - TornoMetal",
    description: "Catálogo completo de peças para plantadeiras",
    url: `${siteUrl}/loja`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: count || 0,
      itemListElement: (products || []).map((p, i) => ({
        "@type": "ListItem",
        position: offset + i + 1,
        url: `${siteUrl}/produto/${p.slug}`,
        name: p.name,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Loja", item: `${siteUrl}/loja` },
      ...(params.categoria ? [{ "@type": "ListItem", position: 3, name: params.categoria, item: `${siteUrl}/loja?categoria=${params.categoria}` }] : []),
      ...(params.marca ? [{ "@type": "ListItem", position: 3, name: params.marca, item: `${siteUrl}/loja?marca=${params.marca}` }] : []),
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
          <ol className="flex items-center gap-1.5">
            <li><a href="/" className="hover:text-primary transition">Início</a></li>
            <li>/</li>
            {params.categoria || params.marca ? (
              <>
                <li><a href="/loja" className="hover:text-primary transition">Loja</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">{params.categoria || params.marca}</li>
              </>
            ) : (
              <li className="text-gray-900 font-medium">Loja</li>
            )}
          </ol>
        </nav>

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
            priceMin={params.preco_min}
            priceMax={params.preco_max}
            inStockOnly={params.estoque === "1"}
            sortBy={params.ordem}
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
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const qs = new URLSearchParams();
                      if (params.categoria) qs.set("categoria", params.categoria);
                      if (params.marca) qs.set("marca", params.marca);
                      if (params.busca) qs.set("busca", params.busca);
                      if (params.preco_min) qs.set("preco_min", params.preco_min);
                      if (params.preco_max) qs.set("preco_max", params.preco_max);
                      if (params.estoque) qs.set("estoque", params.estoque);
                      if (params.ordem) qs.set("ordem", params.ordem);
                      qs.set("pagina", p.toString());
                      return (
                        <a
                          key={p}
                          href={`/loja?${qs.toString()}`}
                          className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
