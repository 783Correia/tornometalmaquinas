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
        <ShoppingBag className="mx-auto mb-4 text-gray-300" size={64} />
        <h1 className="text-2xl font-bold mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">
          Você ainda não adicionou produtos ao carrinho.
        </p>
        <Link
          href="/loja"
          className="bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-white border rounded-xl p-4"
          >
            <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem img
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/produto/${item.slug}`}
                className="font-medium text-sm hover:text-amber-600 line-clamp-2"
              >
                {item.name}
              </Link>
              {item.sku && (
                <p className="text-xs text-gray-400 mt-0.5">
                  SKU: {item.sku}
                </p>
              )}
              <p className="text-amber-600 font-bold mt-1">
                R$ {item.price.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1.5 hover:bg-gray-100"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1.5 hover:bg-gray-100"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-2xl font-bold">
            R$ {totalPrice().toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Frete calculado no checkout.
        </p>
        <button className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 transition mb-2">
          Finalizar Compra
        </button>
        <div className="flex justify-between">
          <Link
            href="/loja"
            className="text-sm text-amber-600 hover:underline"
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
