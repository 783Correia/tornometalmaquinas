"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, ChevronLeft } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import type { Product } from "@/lib/supabase";
import { ProductReviews } from "@/components/product-reviews";
import { ShippingCalculator } from "@/components/shipping-calculator";
import { trackViewItem, trackAddToCart } from "@/lib/gtag";

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      sku: product.sku,
      category: product.categories?.name,
      brand: product.brands?.name,
    })
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const images = (product.product_images || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const currentImage = images[selectedImage];

  function handleAdd() {
    const price = product.sale_price || product.price
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        image: images[0]?.src || "",
        sku: product.sku,
        weight: product.weight,
        length: product.length,
        width: product.width,
        height: product.height,
      });
    }
    trackAddToCart({
      id: product.id,
      name: product.name,
      price,
      quantity,
      sku: product.sku,
      category: product.categories?.name,
      brand: product.brands?.name,
    })
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/loja" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
          <ChevronLeft size={16} /> Voltar para loja
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square relative bg-white rounded-xl overflow-hidden mb-3 border border-gray-100 p-3">
                {currentImage ? (
                  <Image src={currentImage.src} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">Sem imagem</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 px-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 sm:w-18 sm:h-18 relative rounded-lg overflow-hidden shrink-0 border-2 transition ${
                        i === selectedImage ? "border-primary" : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ minWidth: 56, minHeight: 56 }}
                    >
                      <Image src={img.src} alt="" fill className="object-contain" sizes="72px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {product.brands && (
                <Link href={`/loja?marca=${product.brands.slug}`} className="inline-block text-sm text-primary font-semibold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                  {product.brands.name}
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-2">{product.name}</h1>

              {product.categories && (
                <Link href={`/loja?categoria=${product.categories.slug}`} className="text-sm text-gray-500 hover:text-primary">
                  {product.categories.name}
                </Link>
              )}

              {product.sku && <p className="text-sm text-gray-400 mt-2">SKU: {product.sku}</p>}

              <div className="mt-2">
                {product.stock_quantity > 0 ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Em estoque ({product.stock_quantity} un)</span>
                ) : (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Fora de estoque</span>
                )}
              </div>

              <div className="mt-6 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {product.sale_price ? (
                  <div>
                    <span className="text-sm text-gray-400 line-through">R$ {Number(product.regular_price || product.price || 0).toFixed(2)}</span>
                    <span className="text-3xl font-bold text-success ml-2">R$ {Number(product.sale_price).toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">R$ {Number(product.price || 0).toFixed(2)}</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-6">
                <div className="flex items-center justify-center border-2 border-gray-200 rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3.5 text-gray-500 hover:text-primary transition">
                    <Minus size={18} />
                  </button>
                  <span className="px-5 font-medium text-gray-900 text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3.5 text-gray-500 hover:text-primary transition">
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={product.stock_quantity <= 0}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl transition-all shadow-sm ${
                    product.stock_quantity <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : added ? "bg-success text-white" : "bg-primary text-white hover:bg-primary-dark hover:scale-[1.02]"
                  }`}
                >
                  <ShoppingCart size={20} />
                  {product.stock_quantity <= 0 ? "Indisponível" : added ? "Adicionado!" : "Adicionar ao Carrinho"}
                </button>
              </div>

              {/* Calculadora de frete */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                <h3 className="font-semibold mb-3 text-sm text-gray-900">Calcular Frete</h3>
                <ShippingCalculator
                  products={[{
                    weight: product.weight || 0.3,
                    width: product.width || 11,
                    height: product.height || 11,
                    length: product.length || 16,
                    quantity,
                    price: product.sale_price || product.price,
                  }]}
                />
              </div>

              {(product.weight > 0 || product.length > 0) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-semibold mb-3 text-sm text-gray-900">Especificações</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {product.weight > 0 && (
                      <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-gray-500">Peso</span>
                        <span className="font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    {product.length > 0 && (
                      <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-gray-500">Comp.</span>
                        <span className="font-medium">{product.length} cm</span>
                      </div>
                    )}
                    {product.width > 0 && (
                      <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-gray-500">Larg.</span>
                        <span className="font-medium">{product.width} cm</span>
                      </div>
                    )}
                    {product.height > 0 && (
                      <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-gray-500">Alt.</span>
                        <span className="font-medium">{product.height} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição do Produto</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
