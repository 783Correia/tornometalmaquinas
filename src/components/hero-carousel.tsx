"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/banner-1.png",
    alt: "25 Anos de Tradição e Qualidade no Campo - Peças agrícolas de reposição desde 1999",
  },
  {
    image: "/banner-2.png",
    alt: "Peças TornoMetal - Durabilidade que garante a produtividade da sua lavoura",
  },
  {
    image: "/banner-3.png",
    alt: "Catálogo completo de peças para Semeato, Jumil, Imasa, Tatu e mais plantadeiras",
  },
  {
    image: "/banner-4.png",
    alt: "Inovação e precisão em cada peça - Tecnologia TornoMetal para sua colheita",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-gray-100">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full shrink-0 relative">
            <Link href="/loja">
              <div className="relative w-full" style={{ aspectRatio: "1440/480" }}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i === 0}
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all hover:scale-110"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all hover:scale-110"
        aria-label="Próximo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white scale-110 shadow-md" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
