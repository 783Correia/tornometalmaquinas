import Image from "next/image"
import Link from "next/link"

const WHATSAPP_URL = "https://wa.me/555433153969?text=Ol%C3%A1%2C%20sou%20revendedor%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"

export function RevendaFooter() {
  return (
    <footer id="footer" className="bg-[#0A1628] border-t border-white/[0.06]">
      <div className="max-w-[1120px] mx-auto px-5 pt-14 pb-8">
        <div className="grid md:grid-cols-4 gap-10 pb-10 border-b border-white/[0.06]">
          <div className="md:col-span-2">
            <Image
              src="/Logo_Torno_Metal_white.png"
              alt="Torno Metal Everton Lopes"
              width={140}
              height={40}
              className="h-9 w-auto"
            />
            <p className="text-white/30 text-[13px] mt-3 max-w-[280px] leading-relaxed">
              Fabricante de peças para plantadeiras. Atendendo revendas e oficinas em todo o Brasil.
            </p>
            <p className="text-white/20 text-[12px] mt-3 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#2BAAD4] inline-block" />
              Passo Fundo, RS
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4 block">
              Navegação
            </span>
            <nav className="flex flex-col gap-2">
              <a href="#sobre" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">Sobre</a>
              <a href="#beneficios" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">Benefícios</a>
              <a href="#categorias" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">Catálogo</a>
              <a href="#depoimentos" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">Depoimentos</a>
              <Link href="/" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">Loja Online</Link>
            </nav>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4 block">
              Contato
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-white/30 text-[13px]">Tel: (54) 3315-3969</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/15 text-[12px]">
            &copy; {new Date().getFullYear()} Torno Metal Everton Lopes. Todos os direitos reservados.
          </p>
          <p className="text-white/15 text-[12px]">
            Passo Fundo, RS - Brasil
          </p>
        </div>
      </div>
    </footer>
  )
}
