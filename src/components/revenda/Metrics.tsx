"use client"

import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/animations"

const metrics = [
  { value: "+150", label: "Referências" },
  { value: "25+", label: "Anos fabricando" },
  { value: "500+", label: "Clientes ativos" },
  { value: "Brasil", label: "Todo atendido" },
]

export function RevendaMetrics() {
  return (
    <section className="bg-[#0A1628] border-b border-white/[0.06]">
      <motion.div
        className="max-w-[1120px] mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {metrics.map((item, i) => (
          <motion.div
            key={item.label}
            className={`text-center md:py-2 ${
              i < metrics.length - 1 ? "md:border-r md:border-white/[0.06]" : ""
            }`}
            variants={fadeUp}
          >
            <span className="block text-2xl md:text-3xl font-semibold text-white">
              {item.value}
            </span>
            <span className="block text-[12px] text-white/30 mt-1 uppercase tracking-wider font-medium">
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
