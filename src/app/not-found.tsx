import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-500 mb-8">
          A página que você está procurando não existe ou foi removida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/loja" className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition">
            Ver Produtos
          </Link>
          <Link href="/" className="border-2 border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:border-gray-300 transition">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
