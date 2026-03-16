"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CategoryWithImage = {
  id: number;
  name: string;
  slug: string;
  image?: string;
};

export function CategoryCarousel({ categories }: { categories: CategoryWithImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Categorias</h2>
          <p className="text-gray-500">Encontre a peça que precisa por categoria</p>
        </div>

        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-200 text-primary p-2 rounded-full hover:scale-110 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide px-12 py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/loja?categoria=${cat.slug}`}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-100 group-hover:border-primary/40 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-lg">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={144}
                      height={144}
                      className="object-cover w-full h-full rounded-full p-2"
                    />
                  ) : (
                    <span className="text-3xl text-primary/30 font-bold">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-200 text-primary p-2 rounded-full hover:scale-110 transition-all"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
