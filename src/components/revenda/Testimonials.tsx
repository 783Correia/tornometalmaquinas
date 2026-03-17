"use client"

import { motion } from "framer-motion"
import { fadeUp, staggerWide } from "@/lib/animations"

const testimonials = [
  {
    text: "Comecei comprando algumas referências pra testar. Hoje a Torno Metal é um dos nossos fornecedores fixos. Preço bom, entrega certa e nunca me deixaram na mão.",
    initial: "G",
    name: "Gilberto R.",
    role: "Revenda de peças · Passo Fundo, RS",
  },
  {
    text: "Na época do plantio não dá pra brincar com prazo. A Torno Metal sempre entregou dentro do combinado. Isso vale mais do que qualquer desconto pontual.",
    initial: "M",
    name: "Marcos T.",
    role: "Oficina mecânica · Não-Me-Toque, RS",
  },
  {
    text: "Catálogo completo, atendimento rápido e peça que encaixa certo. Não tem o que reclamar.",
    initial: "R",
    name: "Renata S.",
    role: "Distribuidora de peças · Carazinho, RS",
  },
]

export function RevendaTestimonials() {
  return (
    <section id="depoimentos" className="bg-[#0A1628] py-16 md:py-24">
      <div className="max-w-[1120px] mx-auto px-5">
        <motion.span
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2BAAD4]"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          Quem já compra
        </motion.span>

        <motion.h2
          className="mt-4 font-semibold text-white leading-[1.2] max-w-[480px]"
          style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          O que dizem as revendas e oficinas que trabalham com a Torno Metal
        </motion.h2>

        <motion.div
          className="mt-12 grid md:grid-cols-3 gap-4"
          variants={staggerWide}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              className="rounded-xl p-6 bg-white/[0.03] border border-white/[0.06] transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
              variants={fadeUp}
            >
              <p className="text-white/60 text-[14px] leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2BAAD4]/10 flex items-center justify-center text-[#2BAAD4] text-xs font-bold">
                  {t.initial}
                </div>
                <div>
                  <p className="text-white text-[13px] font-medium">{t.name}</p>
                  <p className="text-white/30 text-[12px]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
