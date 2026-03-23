import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

async function getTopCategories() {
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .neq("slug", "sem-categoria")
    .order("name")
    .limit(8);
  return data || [];
}

export async function Footer() {
  const categories = await getTopCategories();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="TornoMetal" width={48} height={48} className="rounded-lg" />
              <div>
                <span className="text-lg font-bold text-white">TornoMetal</span>
                <span className="text-xs text-gray-500 block -mt-1">Everton Lopes</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Fábrica de peças para plantadeiras em Passo Fundo/RS. Qualidade e
              precisão para o agronegócio brasileiro há mais de 25 anos.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "Início" },
                { href: "/loja", label: "Loja" },
                { href: "/contato", label: "Contato" },
                { href: "/login", label: "Minha Conta" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/loja?categoria=${cat.slug}`} className="hover:text-primary transition">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/termos" className="hover:text-primary transition">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-primary transition">Política de Privacidade</Link></li>
              <li><Link href="/trocas" className="hover:text-primary transition">Trocas e Devoluções</Link></li>
              <li><Link href="/contato" className="hover:text-primary transition">Contato</Link></li>
              <li className="pt-2 text-gray-500">Tel: (54) 3315-3969</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} TornoMetal Everton Lopes. Todos os direitos reservados.</p>
          <p>Passo Fundo, RS - Brasil</p>
        </div>
      </div>
    </footer>
  );
}
