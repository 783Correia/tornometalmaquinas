import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";

export const metadata: Metadata = {
  title: {
    default: "TornoMetal Everton Lopes | Peças para Plantadeiras",
    template: "%s | TornoMetal",
  },
  description:
    "Fábrica de peças para plantadeiras em Passo Fundo/RS. Peças de reposição para Semeato, Jumil, John Deere, Massey, Imasa e mais. Envio para todo o Brasil.",
  keywords: [
    "peças para plantadeiras",
    "peças agrícolas",
    "peças de reposição",
    "Semeato",
    "Jumil",
    "Imasa",
    "Tatu Marchesan",
    "TornoMetal",
    "Passo Fundo",
    "condutor de sementes",
    "dosador",
    "telescópio",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "TornoMetal Everton Lopes | Peças para Plantadeiras",
    description:
      "Fábrica de peças para plantadeiras em Passo Fundo/RS. Mais de 25 anos de tradição e qualidade.",
    url: SITE_URL,
    siteName: "TornoMetal Everton Lopes",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "TornoMetal Everton Lopes",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
