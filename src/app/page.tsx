import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { Wrench, Truck, ShieldCheck, Phone } from "lucide-react";

export const revalidate = 60;

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
  const { data } = await supabase
    .from("brands")
    .select("*")
    .order("name");
  return data || [];
}

async function getCategories() {
  const { data } = await supabase
    .from("categories")
    .select("*")
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
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Peças para{" "}
              <span className="text-amber-500">Plantadeiras</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              A maior e melhor fábrica de peças para plantadeiras. Semeato,
              Jumil, John Deere, Massey e mais. Qualidade e precisão para o
              campo.
            </p>
            <div className="flex gap-4">
              <Link
                href="/loja"
                className="bg-amber-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-amber-400 transition"
              >
                Ver Produtos
              </Link>
              <Link
                href="/contato"
                className="border border-gray-600 px-6 py-3 rounded-lg hover:border-amber-500 hover:text-amber-500 transition"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: Wrench,
              title: "Fabricação Própria",
              desc: "Peças fabricadas com precisão",
            },
            {
              icon: Truck,
              title: "Envio Nacional",
              desc: "Entregamos em todo o Brasil",
            },
            {
              icon: ShieldCheck,
              title: "Garantia",
              desc: "Qualidade garantida",
            },
            {
              icon: Phone,
              title: "Suporte",
              desc: "Atendimento especializado",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <item.icon className="mx-auto mb-3 text-amber-500" size={32} />
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Marcas que Trabalhamos
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/loja?marca=${brand.slug}`}
                className="px-5 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-amber-500 hover:text-white transition"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos recentes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Produtos Recentes</h2>
            <Link
              href="/loja"
              className="text-amber-600 font-medium hover:underline text-sm"
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
          <h2 className="text-2xl font-bold text-center mb-8">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories
              .filter((c) => c.slug !== "sem-categoria")
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/loja?categoria=${category.slug}`}
                  className="p-4 bg-gray-100 rounded-xl text-center text-sm font-medium hover:bg-amber-500 hover:text-white transition"
                >
                  {category.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
