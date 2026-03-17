"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"

const WHATSAPP_URL = "https://wa.me/555433153969?text=Ol%C3%A1%2C%20sou%20revendedor%20e%20gostaria%20de%20fazer%20um%20pedido"

export function RevendaCTAFinal() {
  return (
    <section className="bg-[#0E1E33] py-16 md:py-24 border-t border-white/[0.06]">
      <motion.div
        className="max-w-[1120px] mx-auto px-5"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-[520px]">
            <h2
              className="font-semibold text-white leading-[1.2]"
              style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
            >
              Faça seu primeiro pedido — ou mande a lista do que você já compra em outro lugar.
            </h2>
            <p className="mt-4 text-white/35 text-[15px] leading-relaxed">
              A gente verifica o que temos em estoque, passa os preços e você
              decide. Sem compromisso, sem enrolação.
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#20BD5A]"
            >
              Falar no WhatsApp agora
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
