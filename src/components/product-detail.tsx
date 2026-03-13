"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Minus, Plus, ChevronLeft } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import type { Product } from "@/lib/supabase";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const images = product.product_images || [];
  const currentImage = images[selectedImage];

  function handleAdd() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.sale_price || product.price,
        image: images[0]?.src || "",
        sku: product.sku,
        weight: product.weight,
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/loja"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 mb-6"
      >
        <ChevronLeft size={16} /> Voltar para loja
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden mb-3">
            {currentImage ? (
              <Image
                src={currentImage.src}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Sem imagem
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 relative rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    i === selectedImage
                      ? "border-amber-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brands && (
            <Link
              href={`/loja?marca=${product.brands.slug}`}
              className="text-sm text-amber-600 font-medium hover:underline"
            >
              {product.brands.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mt-1 mb-2">
            {product.name}
          </h1>

          {product.categories && (
            <Link
              href={`/loja?categoria=${product.categories.slug}`}
              className="text-sm text-gray-500 hover:text-amber-600"
            >
              {product.categories.name}
            </Link>
          )}

          {product.sku && (
            <p className="text-sm text-gray-400 mt-2">SKU: {product.sku}</p>
          )}

          <div className="mt-6 mb-6">
            {product.sale_price ? (
              <div>
                <span className="text-sm text-gray-400 line-through">
                  R$ {product.regular_price.toFixed(2)}
                </span>
                <span className="text-3xl font-bold text-amber-600 ml-2">
                  R$ {product.sale_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-amber-600 transition"
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </button>
          </div>

          {/* Details */}
          {(product.weight > 0 || product.length > 0) && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2 text-sm">Especificações</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                {product.weight > 0 && (
                  <div>
                    <span className="text-gray-400">Peso:</span>{" "}
                    {product.weight} kg
                  </div>
                )}
                {product.length > 0 && (
                  <div>
                    <span className="text-gray-400">Comp.:</span>{" "}
                    {product.length} cm
                  </div>
                )}
                {product.width > 0 && (
                  <div>
                    <span className="text-gray-400">Larg.:</span>{" "}
                    {product.width} cm
                  </div>
                )}
                {product.height > 0 && (
                  <div>
                    <span className="text-gray-400">Alt.:</span>{" "}
                    {product.height} cm
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Descrição</h2>
          <div
            className="prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
