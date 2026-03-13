import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & about */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">TM</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">TornoMetal</span>
                <span className="text-xs text-gray-500 block -mt-1">
                  Everton Lopes
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              A maior e melhor fábrica de peças para plantadeiras. Qualidade e
              precisão para o agronegócio brasileiro.
            </p>
          </div>

          {/* Navigation */}
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
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { slug: "condutor", name: "Condutores" },
                { slug: "telescopio", name: "Telescópios" },
                { slug: "bocal", name: "Bocais" },
                { slug: "revestimento", name: "Revestimentos" },
                { slug: "base", name: "Bases" },
                { slug: "dosador", name: "Dosadores" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/loja?categoria=${cat.slug}`}
                    className="text-gray-500 hover:text-primary transition"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>Everton Lopes</li>
              <li>tornometalevertonlopes.com.br</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-600 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} TornoMetal Everton Lopes. Todos
            os direitos reservados.
          </p>
          <p>
            Desenvolvido com tecnologia de ponta
          </p>
        </div>
      </div>
    </footer>
  );
}
