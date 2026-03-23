import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Conta",
  description: "Crie sua conta na TornoMetal para comprar peças para plantadeiras online. Cadastro rápido e seguro.",
  robots: { index: false },
};

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
