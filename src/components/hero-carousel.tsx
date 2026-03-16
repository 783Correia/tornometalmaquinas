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
    textPosition: "left" as const,
    theme: "dark" as const, // dark bg = white text
  },
  {
    image: "/banner-2.png",
    alt: "Peças TornoMetal com durabilidade garantida",
    title: "Durabilidade que",
    subtitle: "Garante sua Produtividade",
    description: "Peças fabricadas com os melhores materiais para máxima resistência",
    cta: "Conhecer Peças",
    href: "/loja",
    textPosition: "left-box" as const,
    theme: "light" as const, // light bg = dark text
  },
  {
    image: "/banner-3.png",
    alt: "Peças para Semeato, Jumil, Imasa, Tatu e mais",
    title: "Catálogo Completo",
    subtitle: "para sua Plantadeira",
    description: "Compatível com Semeato, Jumil, Imasa, Tatu e mais marcas",
    cta: "Ver Marcas",
    href: "/loja",
    textPosition: "right-box" as const,
    theme: "light" as const,
  },
  {
    image: "/banner-4.png",
    alt: "Inovação e precisão em peças agrícolas TornoMetal",
    title: "Inovação e Precisão",
    subtitle: "em Cada Peça",
    description: "Tecnologia de ponta na fabricação de peças agrícolas de reposição",
    cta: "Comprar Agora",
    href: "/loja",
    textPosition: "left" as const,
    theme: "dark" as const,
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
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  const isLight = (theme: string) => theme === "light";

  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full shrink-0 relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[1440/480]">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />

              {/* Overlay only for dark theme slides */}
              {!isLight(slide.theme) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              )}

              {/* Text content */}
              <div
                className={`absolute inset-0 flex items-center ${
                  slide.textPosition === "right-box"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-6 sm:px-10 md:px-16 lg:px-20 w-full max-w-7xl mx-auto flex ${
                    slide.textPosition === "right-box"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[260px] sm:max-w-xs md:max-w-md lg:max-w-lg ${
                      slide.textPosition === "right-box" ? "text-right" : ""
                    }`}
                  >
                    <h2
                      className={`text-lg sm:text-xl md:text-3xl lg:text-5xl font-extrabold leading-tight ${
                        isLight(slide.theme) ? "text-gray-900" : "text-white drop-shadow-lg"
                      }`}
                    >
                      {slide.title}
                      <br />
                      <span className={isLight(slide.theme) ? "text-primary" : "text-blue-400"}>
                        {slide.subtitle}
                      </span>
                    </h2>
                    <p
                      className={`mt-1.5 sm:mt-2 md:mt-3 text-[11px] sm:text-xs md:text-sm lg:text-base ${
                        isLight(slide.theme) ? "text-gray-600" : "text-gray-200 drop-shadow-md"
                      } ${slide.textPosition === "right-box" ? "ml-auto" : ""} max-w-sm`}
                    >
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className={`inline-block mt-2.5 sm:mt-3 md:mt-5 font-semibold px-4 py-1.5 sm:px-5 sm:py-2 md:px-7 md:py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg text-xs sm:text-sm md:text-base ${
                        isLight(slide.theme)
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
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 md:p-2.5 rounded-full shadow-md transition-all hover:scale-110"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 md:p-2.5 rounded-full shadow-md transition-all hover:scale-110"
        aria-label="Próximo"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
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
