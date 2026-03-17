"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"

export function RevendaAbout() {
  return (
    <section id="sobre" className="bg-[#0E1E33] py-16 md:py-24">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="max-w-[640px]">
          <motion.span
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2BAAD4]"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            Por que a Torno Metal
          </motion.span>

          <motion.h2
            className="mt-4 font-semibold text-white leading-[1.2]"
            style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            Seu cliente pediu.
            <br />
            Você tem. Simples assim.
          </motion.h2>

          <motion.p
            className="mt-5 text-white/40 text-[15px] leading-[1.8]"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            Quem trabalha com reposição de peças para plantadeiras sabe que o
            problema raramente é vender — é ter o produto certo, na hora certa,
            com margem que vale a pena.
          </motion.p>

          <motion.p
            className="mt-4 text-white/40 text-[15px] leading-[1.8]"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            A Torno Metal existe pra resolver exatamente isso. Fabricamos direto,
            mantemos estoque das principais referências do mercado e atendemos
            quem compra com consistência — não com promessa.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
