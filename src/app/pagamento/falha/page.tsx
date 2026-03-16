"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { Suspense } from "react";

function Content() {
  const params = useSearchParams();
  const orderId = params.get("order");

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-red-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento não aprovado</h1>
          {orderId && <p className="text-lg text-gray-500 mb-2">Pedido #{orderId}</p>}
          <p className="text-gray-500 mb-6">
            Houve um problema com seu pagamento. Tente novamente ou escolha outra forma de pagamento.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/carrinho" className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition">
              <RefreshCw size={18} /> Tentar Novamente
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:border-gray-300 transition">
              <Home size={18} /> Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>}><Content /></Suspense>;
}
