import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com a TornoMetal Everton Lopes. Telefone: (54) 3315-3969. Peças para plantadeiras em Passo Fundo/RS. Orçamentos e atendimento personalizado.",
  alternates: { canonical: "https://tornometalevertonlopes.com.br/contato" },
  openGraph: {
    title: "Contato - TornoMetal Everton Lopes",
    description: "Fale conosco para tirar dúvidas ou fazer orçamentos de peças para plantadeiras.",
    url: "https://tornometalevertonlopes.com.br/contato",
  },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
