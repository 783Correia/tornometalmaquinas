"use client"

import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/animations"

const WHATSAPP_URL = "https://wa.me/555433153969?text=Ol%C3%A1%2C%20sou%20revendedor%20e%20gostaria%20de%20consultar%20estoque%20e%20pre%C3%A7os"

export function RevendaHero() {
  return (
    <section className="relative overflow-hidden bg-[#0A1628]">
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(27,141,192,0.15), transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-[1120px] mx-auto px-5 pt-32 pb-20 md:pt-40 md:pb-28"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2BAAD4] mb-5"
          variants={fadeUp}
        >
          Fabricante direto · Passo Fundo, RS
        </motion.span>

        <motion.h1
          className="font-semibold text-white leading-[1.15] max-w-[680px]"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          variants={fadeUp}
        >
          Quem Revende Peça para Plantadeira Sabe o Valor de um Fornecedor que{" "}
          <span className="text-[#2BAAD4]">Não Decepciona</span>
        </motion.h1>

        <motion.p
          className="mt-5 text-white/40 text-[15px] md:text-base leading-relaxed max-w-[520px]"
          variants={fadeUp}
        >
          Fabricante direto de peças para Semeato, Vence Tudo e outras marcas.
          Preço de fábrica, +150 referências em estoque e entrega que cumpre
          prazo — pedido após pedido.
        </motion.p>

        <motion.div className="mt-8 flex gap-3 flex-wrap" variants={fadeUp}>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#20BD5A]"
          >
            Consultar Estoque e Preços
          </a>
          <a
            href="#categorias"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition-all duration-200 hover:text-white hover:border-white/25"
          >
            Ver Catálogo
          </a>
        </motion.div>
      </motion.div>

      <div className="h-px bg-white/[0.06]" />
    </section>
  )
}
