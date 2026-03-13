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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-800 to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_50%)] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              Fábrica de Peças para Plantadeiras
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Peças com{" "}
              <span className="text-primary">Precisão</span> para o
              seu Plantio
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Fabricação própria de peças para plantadeiras Semeato, Jumil, John
              Deere, Massey, Case e mais. Qualidade garantida com envio para
              todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/loja"
                className="bg-primary text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-light hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Ver Produtos
              </Link>
              <Link
                href="/contato"
                className="border border-dark-500 px-8 py-3.5 rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Wrench,
              title: "Fabricação Própria",
              desc: "Peças fabricadas com precisão milimétrica",
            },
            {
              icon: Truck,
              title: "Envio Nacional",
              desc: "Entregamos em todo o Brasil",
            },
            {
              icon: ShieldCheck,
              title: "Garantia",
              desc: "Qualidade garantida em todas as peças",
            },
            {
              icon: Headphones,
              title: "Suporte Técnico",
              desc: "Atendimento especializado",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-6 bg-dark-800 rounded-xl border border-dark-600 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center">
                <item.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <section className="py-16 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              Marcas que Trabalhamos
            </h2>
            <p className="text-gray-500">
              Peças compatíveis com as principais marcas do mercado
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/loja?marca=${brand.slug}`}
                className="px-6 py-2.5 bg-dark-800 border border-dark-600 rounded-full text-sm font-medium text-gray-400 hover:bg-primary hover:text-black hover:border-primary hover:scale-105 transition-all"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos recentes */}
      <section className="py-16 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Produtos Recentes
              </h2>
              <p className="text-gray-500 mt-1">
                Confira as últimas peças adicionadas
              </p>
            </div>
            <Link
              href="/loja"
              className="text-primary font-medium hover:underline text-sm"
            >
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Categorias</h2>
            <p className="text-gray-500">
              Encontre a peça que precisa por categoria
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/loja?categoria=${category.slug}`}
                className="p-5 bg-dark-800 border border-dark-600 rounded-xl text-center text-sm font-medium text-gray-400 hover:bg-primary hover:text-black hover:border-primary hover:scale-105 transition-all"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-dark-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Não encontrou a peça que precisa?
          </h2>
          <p className="text-gray-400 mb-8">
            Entre em contato conosco pelo WhatsApp. Fabricamos peças sob medida
            para a sua plantadeira.
          </p>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-green-600 hover:scale-105 transition-all"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
