"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { ShippingCalculator } from "@/components/shipping-calculator";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore();
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingName, setShippingName] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 text-gray-300" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">Você ainda não adicionou produtos ao carrinho.</p>
        <Link href="/loja" className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition">
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrinho</h1>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/produto/${item.slug}`} className="font-medium text-sm text-gray-800 hover:text-primary line-clamp-2 transition">
                  {item.name}
                </Link>
                {item.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                <p className="text-primary font-bold mt-1">R$ {item.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-500 hover:text-primary">
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-500 hover:text-primary">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Calcular Frete</h2>
          <ShippingCalculator
            products={items.map((item) => ({
              weight: item.weight || 0.3,
              width: 11,
              height: 11,
              length: 16,
              quantity: item.quantity,
              price: item.price,
            }))}
            onSelect={(opt) => { setShippingCost(opt.price); setShippingName(`${opt.company} - ${opt.name}`); }}
          />
        </div>

        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">R$ {totalPrice().toFixed(2).replace(".", ",")}</span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frete ({shippingName})</span>
                <span className="text-gray-900">R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary">R$ {(totalPrice() + shippingCost).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
          <Link href="/checkout" className="block w-full bg-primary text-white text-center font-semibold py-3.5 rounded-xl hover:bg-primary-dark transition mb-3">
            Finalizar Compra
          </Link>
          <div className="flex justify-between">
            <Link href="/loja" className="text-sm text-primary hover:underline">Continuar comprando</Link>
            <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Limpar carrinho</button>
          </div>
        </div>
      </div>
    </div>
  );
}
