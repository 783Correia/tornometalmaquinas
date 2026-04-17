"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar a loja</h2>
        <p className="text-gray-500 mb-6">Não foi possível carregar os produtos. Tente novamente.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition">
            Tentar novamente
          </button>
          <Link href="/" className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition">
            Início
          </Link>
        </div>
      </div>
    </div>
  );
}
