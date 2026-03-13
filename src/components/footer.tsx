import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-amber-500 font-bold text-lg mb-3">
              TornoMetal
            </h3>
            <p className="text-sm">
              A maior e melhor fábrica de peças para plantadeiras. Semeato,
              Jumil, John Deere, Massey e mais.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/loja" className="hover:text-amber-500 transition">
                  Loja
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-amber-500 transition">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>Everton Lopes</li>
              <li>tornometalevertonlopes.com.br</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} TornoMetal Everton Lopes. Todos os
          direitos reservados.
        </div>
      </div>
    </footer>
  );
}
