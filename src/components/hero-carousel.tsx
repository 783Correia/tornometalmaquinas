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
    align: "left" as const,
    overlay: "gradient-right" as const,
  },
  {
    image: "/banner-2.png",
    alt: "Peças TornoMetal com durabilidade garantida",
    title: "Durabilidade que",
    subtitle: "Garante sua Produtividade",
    description: "Peças fabricadas com os melhores materiais para máxima resistência",
    cta: "Conhecer Peças",
    href: "/loja",
    align: "left" as const,
    overlay: "none" as const,
  },
  {
    image: "/banner-3.png",
    alt: "Peças para Semeato, Jumil, Imasa, Tatu e mais",
    title: "Catálogo Completo",
    subtitle: "para sua Plantadeira",
    description: "Compatível com Semeato, Jumil, Imasa, Tatu e mais marcas",
    cta: "Ver Marcas",
    href: "/loja",
    align: "right" as const,
    overlay: "none" as const,
  },
  {
    image: "/banner-4.png",
    alt: "Inovação e precisão em peças agrícolas TornoMetal",
    title: "Inovação e Precisão",
    subtitle: "em Cada Peça",
    description: "Tecnologia de ponta na fabricação de peças agrícolas de reposição",
    cta: "Comprar Agora",
    href: "/loja",
    align: "left" as const,
    overlay: "gradient-right" as const,
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
            {/* Mobile: taller ratio / Desktop: wide banner */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[1440/480]">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />

              {/* Overlay */}
              {slide.overlay === "gradient-right" && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              )}
              {slide.overlay === "none" && (
                <div className="absolute inset-0 bg-black/10 md:bg-transparent" />
              )}

              {/* Text content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
                  <div
                    className={`max-w-[280px] sm:max-w-sm md:max-w-lg ${
                      slide.align === "right" ? "ml-auto text-right" : ""
                    }`}
                  >
                    <h2
                      className={`text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg ${
                        slide.overlay === "none"
                          ? "text-gray-900"
                          : "text-white"
                      }`}
                    >
                      {slide.title}
                      <br />
                      <span
                        className={
                          slide.overlay === "none"
                            ? "text-primary"
                            : "text-blue-400"
                        }
                      >
                        {slide.subtitle}
                      </span>
                    </h2>
                    <p
                      className={`mt-2 md:mt-4 text-xs sm:text-sm md:text-base drop-shadow-md max-w-md ${
                        slide.overlay === "none"
                          ? "text-gray-600"
                          : "text-gray-200"
                      } ${slide.align === "right" ? "ml-auto" : ""}`}
                    >
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className={`inline-block mt-3 md:mt-5 font-semibold px-5 py-2 md:px-8 md:py-3 rounded-xl transition-all hover:scale-105 shadow-lg text-xs sm:text-sm md:text-base ${
                        slide.overlay === "none"
                          ? "bg-primary text-white hover:bg-primary-dark"
                          : "bg-white text-primary hover:bg-blue-50"
                      }`}
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
        className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 md:p-2 rounded-full shadow-md transition-all hover:scale-110"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 md:p-2 rounded-full shadow-md transition-all hover:scale-110"
        aria-label="Próximo"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
              i === current
                ? "bg-white scale-110 shadow-md"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
