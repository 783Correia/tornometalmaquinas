"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/banner-1.png",
    alt: "TornoMetal - 25 anos de tradição em peças agrícolas",
    title: "25 Anos de Tradição",
    subtitle: "e Qualidade no Campo",
    description: "Peças agrícolas de reposição com precisão milimétrica desde 1999",
    cta: "Ver Catálogo",
    href: "/loja",
  },
  {
    image: "/banner-2.png",
    alt: "Peças TornoMetal com durabilidade garantida",
    title: "Durabilidade que",
    subtitle: "Garante sua Produtividade",
    description: "Peças fabricadas com os melhores materiais para máxima resistência no campo",
    cta: "Conhecer Peças",
    href: "/loja",
  },
  {
    image: "/banner-3.png",
    alt: "Peças para Semeato, Jumil, Imasa, Tatu e mais",
    title: "Catálogo Completo",
    subtitle: "para sua Plantadeira",
    description: "Peças compatíveis com Semeato, Jumil, Imasa, Tatu Marchesan e mais marcas",
    cta: "Ver Marcas",
    href: "/loja",
  },
  {
    image: "/banner-4.png",
    alt: "Inovação e precisão em peças agrícolas TornoMetal",
    title: "Inovação e Precisão",
    subtitle: "em Cada Peça",
    description: "Tecnologia de ponta aplicada na fabricação de peças agrícolas de reposição",
    cta: "Comprar Agora",
    href: "/loja",
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
    <section className="relative w-full overflow-hidden bg-gray-900">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full shrink-0 relative">
            <div className="relative w-full" style={{ aspectRatio: "1440/480" }}>
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* SEO-friendly HTML text overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                  <div className="max-w-xl">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                      {slide.title}
                      <br />
                      <span className="text-blue-400">{slide.subtitle}</span>
                    </h2>
                    <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-200 drop-shadow-md max-w-md">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className="inline-block mt-4 md:mt-6 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 md:px-8 md:py-3 rounded-xl transition-all hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
