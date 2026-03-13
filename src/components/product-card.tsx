"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/supabase";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.product_images?.[0];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.sale_price || product.price,
      image: image?.src || "",
      sku: product.sku,
      weight: product.weight,
    });
  }

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group bg-dark-800 rounded-xl border border-dark-600 overflow-hidden hover:border-primary/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all"
    >
      <div className="aspect-square relative bg-dark-700 overflow-hidden">
        {image ? (
          <Image
            src={image.src}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            Sem imagem
          </div>
        )}
        {product.sale_price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            OFERTA
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-primary font-medium mb-1">
          {product.categories?.name}
          {product.brands && (
            <span className="text-gray-500"> | {product.brands.name}</span>
          )}
        </p>
        <h3 className="text-sm font-medium text-gray-300 line-clamp-2 mb-2 group-hover:text-white transition">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            {product.sale_price ? (
              <>
                <span className="text-xs text-gray-600 line-through">
                  R$ {product.regular_price.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-primary ml-1">
                  R$ {product.sale_price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-white">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="p-2 bg-primary text-black rounded-lg hover:bg-primary-light transition hover:scale-105"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
