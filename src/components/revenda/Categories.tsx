"use client"

import { motion } from "framer-motion"
import { fadeUp, fadeUpGrouped } from "@/lib/animations"

const WHATSAPP_URL = "https://wa.me/555433153969?text=Ol%C3%A1%2C%20sou%20revendedor%20e%20gostaria%20de%20consultar%20disponibilidade"

const chips = [
  "Base", "Batente", "Bocal", "Bucha", "Calota", "Chaveta",
  "Condutor", "Dosador", "Engrenagem", "Fixador", "Flange", "Interruptor",
  "Lingueta", "Mancal", "Mangote", "Manopla", "Obstacularizador",
  "Pinhão Conduzido/Coroa", "Pinhão Dosador", "Revestimento", "Rolete",
  "Tampa", "Telescópio", "Tubo", "Voltante",
]

export function RevendaCategories() {
  return (
    <section id="categorias" className="bg-[#F7F8FA] py-16 md:py-24">
      <div className="max-w-[1120px] mx-auto px-5">
        <motion.div
          className="max-w-[480px]"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B8DC0]">
            Catálogo
          </span>
          <h2
            className="mt-4 font-semibold text-[#0F172A] leading-[1.2]"
            style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
          >
            Mais de 150 referências organizadas por categoria
          </h2>
          <p className="mt-3 text-[#475569] text-[15px]">
            Para as principais marcas de plantadeiras do mercado.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <motion.span
              key={chip}
              className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-2 text-[13px] text-[#334155] font-medium transition-all duration-200 hover:bg-[#0A1628] hover:text-white hover:border-[#0A1628] cursor-default"
              variants={fadeUpGrouped}
              custom={Math.floor(i / 6)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {chip}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="mt-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0A1628] text-white px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-[#162240]"
          >
            Consultar Disponibilidade
          </a>
        </motion.div>
      </div>
    </section>
  )
}
