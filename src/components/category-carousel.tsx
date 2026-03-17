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
    const amount = window.innerWidth < 640 ? 160 : 250;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-8 md:py-10 bg-gray-50 w-full overflow-hidden">
      <div className="text-center mb-6 md:mb-10 px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Categorias</h2>
        <p className="text-sm md:text-base text-gray-500">Encontre a peça que precisa por categoria</p>
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-200 text-primary p-2.5 md:p-2.5 rounded-full hover:scale-110 transition-all"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-5 md:gap-7 overflow-x-auto px-6 md:px-12 py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/loja?categoria=${cat.slug}`}
              className="flex flex-col items-center gap-2 md:gap-3 shrink-0 group/item"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-3 md:border-4 border-blue-100 group-hover/item:border-primary/40 flex items-center justify-center overflow-hidden transition-all group-hover/item:scale-105 group-hover/item:shadow-lg">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={112}
                    height={112}
                    className="object-contain w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl text-primary/30 font-bold">
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 group-hover/item:text-primary transition-colors text-center max-w-[80px] md:max-w-[100px] leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-200 text-primary p-2.5 md:p-2.5 rounded-full hover:scale-110 transition-all"
          aria-label="Próximo"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </section>
  );
}
