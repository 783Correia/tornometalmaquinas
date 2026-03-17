import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenda | TornoMetal Everton Lopes",
  description:
    "Fabricante direto de peças para plantadeiras Semeato, Vence Tudo e outras marcas. +150 referências em estoque. Preço de fábrica para revendas e oficinas.",
};

export default function RevendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
