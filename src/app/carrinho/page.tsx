"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 text-gray-600" size={64} />
        <h1 className="text-2xl font-bold text-white mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">
          Você ainda não adicionou produtos ao carrinho.
        </p>
        <Link
          href="/loja"
          className="bg-primary text-black font-semibold px-6 py-3 rounded-xl hover:bg-primary-light transition"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Carrinho</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-dark-800 border border-dark-600 rounded-xl p-4"
          >
            <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-dark-700 shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                  Sem img
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/produto/${item.slug}`}
                className="font-medium text-sm text-gray-300 hover:text-primary line-clamp-2 transition"
              >
                {item.name}
              </Link>
              {item.sku && (
                <p className="text-xs text-gray-600 mt-0.5">
                  SKU: {item.sku}
                </p>
              )}
              <p className="text-primary font-bold mt-1">
                R$ {item.price.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-600 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center bg-dark-700 border border-dark-500 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-sm font-medium text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-2xl font-bold text-white">
            R$ {totalPrice().toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Frete calculado no checkout.
        </p>
        <Link
          href="/login"
          className="block w-full bg-primary text-black text-center font-semibold py-3.5 rounded-xl hover:bg-primary-light transition mb-3"
        >
          Finalizar Compra
        </Link>
        <div className="flex justify-between">
          <Link
            href="/loja"
            className="text-sm text-primary hover:underline"
          >
            Continuar comprando
          </Link>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:underline"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
