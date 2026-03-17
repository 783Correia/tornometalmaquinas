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
    const amount = 180;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-8 md:py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Categorias</h2>
          <p className="text-sm md:text-base text-gray-500">Encontre a peça que precisa por categoria</p>
        </div>

        <div className="relative overflow-hidden">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-200 text-primary p-1.5 md:p-2 rounded-full hover:scale-110 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide px-12 md:px-16 py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/loja?categoria=${cat.slug}`}
                className="flex flex-col items-center gap-2 md:gap-3 shrink-0 group"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-3 md:border-4 border-blue-100 group-hover:border-primary/40 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-lg">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full rounded-full p-1.5 md:p-2"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl text-primary/30 font-bold">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors text-center max-w-[80px] md:max-w-none leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
            {/* Spacer to prevent last item from being cut */}
            <div className="shrink-0 w-4 md:w-8" aria-hidden="true" />
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-200 text-primary p-1.5 md:p-2 rounded-full hover:scale-110 transition-all"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
