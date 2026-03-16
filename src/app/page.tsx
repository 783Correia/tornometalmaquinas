import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { Wrench, Truck, ShieldCheck, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  const { data } = await supabase
    .from("products")
    .select("*, categories(*), brands(*), product_images(*)")
    .eq("status", "publish")
    .order("created_at", { ascending: false })
    .limit(8);
  return data || [];
}

async function getBrands() {
  const { data } = await supabase.from("brands").select("*").order("name");
  return data || [];
}

async function getCategories() {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .neq("slug", "sem-categoria")
    .order("name");
  return data || [];
}

export default async function Home() {
  const [products, brands, categories] = await Promise.all([
    getFeaturedProducts(),
    getBrands(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0tMjQgMTJjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Peças para Plantadeiras com{" "}
              <span className="text-accent">Precisão</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              A maior e melhor fábrica de peças para plantadeiras. Semeato,
              Jumil, John Deere, Massey, Case e mais. Qualidade garantida com
              envio para todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/loja"
                className="bg-white text-primary font-semibold px-7 py-3 rounded-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
              >
                Ver Produtos
              </Link>
              <Link
                href="/contato"
                className="border-2 border-white/30 text-white px-7 py-3 rounded-xl hover:bg-white/10 transition-all"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Wrench, title: "Fabricação Própria", desc: "Peças fabricadas com precisão milimétrica" },
            { icon: Truck, title: "Envio Nacional", desc: "Entregamos em todo o Brasil" },
            { icon: ShieldCheck, title: "Garantia", desc: "Qualidade garantida em todas as peças" },
            { icon: Headphones, title: "Suporte Técnico", desc: "Atendimento especializado" },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-xl flex items-center justify-center">
                <item.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Marcas que Trabalhamos</h2>
            <p className="text-gray-500">Peças compatíveis com as principais marcas do mercado</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/loja?marca=${brand.slug}`}
                className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-primary hover:text-white hover:border-primary hover:scale-105 transition-all"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos recentes */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Produtos Recentes</h2>
              <p className="text-gray-500 mt-1">Confira as últimas peças adicionadas</p>
            </div>
            <Link href="/loja" className="text-primary font-medium hover:underline text-sm">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Categorias</h2>
            <p className="text-gray-500">Encontre a peça que precisa por categoria</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/loja?categoria=${category.slug}`}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-primary hover:text-white hover:border-primary hover:scale-105 transition-all shadow-sm"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Não encontrou a peça que precisa?
          </h2>
          <p className="text-blue-100 mb-8">
            Entre em contato conosco pelo WhatsApp. Fabricamos peças sob medida para a sua plantadeira.
          </p>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
