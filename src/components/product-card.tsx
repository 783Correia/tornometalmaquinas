"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/supabase";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const sortedImages = (product.product_images || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const image = sortedImages[0];

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
      length: product.length,
      width: product.width,
      height: product.height,
    });
  }

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
    >
      <div className="aspect-square relative bg-gray-50 overflow-hidden p-2">
        {image ? (
          <Image
            src={image.src}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            Sem imagem
          </div>
        )}
        {product.sale_price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            OFERTA
          </span>
        )}
      </div>
      <div className="p-3 md:p-3.5">
        <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
          {product.brands && (
            <span className="text-[11px] md:text-xs font-semibold text-primary bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-full truncate max-w-[120px] md:max-w-none">
              {product.brands.name}
            </span>
          )}
          {product.categories && (
            <span className="text-[11px] md:text-xs text-gray-400 hidden sm:inline">
              {product.categories.name}
            </span>
          )}
        </div>
        <h3 className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 mb-1.5 md:mb-2 group-hover:text-primary transition min-h-[32px] md:min-h-[40px]">
          {product.name}
        </h3>
        {product.sku && (
          <p className="text-[11px] md:text-xs text-gray-400 mb-1.5 md:mb-2 hidden sm:block">SKU: {product.sku}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            {product.sale_price ? (
              <div>
                <span className="text-[11px] md:text-xs text-gray-400 line-through">
                  R$ {product.regular_price.toFixed(2)}
                </span>
                <span className="text-base md:text-lg font-bold text-success block -mt-0.5">
                  R$ {product.sale_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-base md:text-lg font-bold text-gray-900">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="p-2.5 md:p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition hover:scale-105 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
