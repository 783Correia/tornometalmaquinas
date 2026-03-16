import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { HeroCarousel } from "@/components/hero-carousel";
import { CategoryCarousel } from "@/components/category-carousel";
import { Wrench, Truck, ShieldCheck, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  // Get recent products that have images
  const { data } = await supabase
    .from("products")
    .select("*, categories(*), brands(*), product_images(*)")
    .eq("status", "publish")
    .order("created_at", { ascending: false })
    .limit(40);

  // Filter only products with at least one image
  const withImages = (data || []).filter(
    (p) => p.product_images && p.product_images.length > 0
  );
  return withImages.slice(0, 8);
}

async function getBrands() {
  const { data } = await supabase.from("brands").select("*").order("name");
  return data || [];
}

async function getCategoriesWithImages() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .neq("slug", "sem-categoria")
    .order("name");

  if (!categories) return [];

  // Get one product image per category
  const result = await Promise.all(
    categories.map(async (cat) => {
      const { data: products } = await supabase
        .from("products")
        .select("product_images(src)")
        .eq("category_id", cat.id)
        .eq("status", "publish")
        .limit(1);
      const image = products?.[0]?.product_images?.[0]?.src || null;
      return { ...cat, image };
    })
  );

  return result;
}

export default async function Home() {
  const [products, brands, categories] = await Promise.all([
    getFeaturedProducts(),
    getBrands(),
    getCategoriesWithImages(),
  ]);

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Diferenciais */}
      <section className="py-8 md:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Wrench, title: "Fabricação Própria", desc: "Peças fabricadas com precisão milimétrica" },
            { icon: Truck, title: "Envio Nacional", desc: "Entregamos em todo o Brasil" },
            { icon: ShieldCheck, title: "Garantia", desc: "Qualidade garantida em todas as peças" },
            { icon: Headphones, title: "Suporte Técnico", desc: "Atendimento especializado" },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
                <item.icon className="text-primary w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="font-semibold text-xs md:text-sm text-gray-900 mb-0.5 md:mb-1">{item.title}</h3>
              <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <section className="py-8 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-5 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Marcas que Trabalhamos</h2>
            <p className="text-sm md:text-base text-gray-500">Peças compatíveis com as principais marcas</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/loja?marca=${brand.slug}`}
                className="px-3.5 py-2 md:px-5 md:py-2.5 bg-white border-2 border-gray-200 rounded-full text-xs md:text-sm font-medium text-gray-700 hover:bg-primary hover:text-white hover:border-primary hover:scale-105 transition-all"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias - Carrossel circular */}
      <CategoryCarousel categories={categories} />

      {/* Produtos recentes */}
      <section className="py-8 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Produtos Recentes</h2>
              <p className="text-sm md:text-base text-gray-500 mt-0.5 md:mt-1">Confira as últimas peças adicionadas</p>
            </div>
            <Link href="/loja" className="text-primary font-medium hover:underline text-xs md:text-sm">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="py-8 md:py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-5 md:mb-8">Sobre a TornoMetal</h2>
          <div className="space-y-5 text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">Tornometal (Everton Lopes): Tradição e Qualidade em Peças Agrícolas</strong>
            </p>
            <p>
              Com mais de 25 anos de história, a <strong>Tornometal</strong> é uma empresa familiar localizada em Passo Fundo, no Rio Grande do Sul, reconhecida pela excelência na fabricação de peças agrícolas de reposição para plantadeiras. Ao longo de sua trajetória, construiu uma reputação sólida baseada na qualidade de seus produtos, no atendimento dedicado e no compromisso com a satisfação de cada cliente.
            </p>
            <p>
              No mercado agrícola, onde confiança e durabilidade são essenciais, a Tornometal se destaca por oferecer soluções robustas e eficientes que atendem produtores rurais e revendas em todo o Brasil. Cada peça é desenvolvida com rigor técnico, garantindo alto desempenho, resistência e compatibilidade para diferentes modelos de equipamentos.
            </p>
            <p>
              Mais do que entregar produtos, a empresa valoriza o relacionamento com seus clientes. Guiada pelos princípios da família <strong>Everton Lopes</strong>, a Tornometal mantém um atendimento próximo, profissional e sempre voltado a entender as necessidades reais do campo.
            </p>
            <p>
              A Tornometal é a sua parceira confiável em peças agrícolas de reposição, tradição, experiência e qualidade que fazem a diferença na produtividade do seu negócio.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-14 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">
            Não encontrou a peça que precisa?
          </h2>
          <p className="text-blue-100 mb-5 md:mb-8 text-sm md:text-base">
            Entre em contato conosco pelo WhatsApp. Fabricamos peças sob medida para a sua plantadeira.
          </p>
          <a
            href="https://wa.me/555433153969?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
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
