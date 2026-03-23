import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Analytics } from "@/components/analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";

export const metadata: Metadata = {
  title: {
    default: "TornoMetal Everton Lopes | Peças para Plantadeiras - Passo Fundo/RS",
    template: "%s | TornoMetal Everton Lopes",
  },
  description:
    "Fábrica de peças para plantadeiras em Passo Fundo/RS. Peças de reposição para Semeato, Jumil, John Deere, Massey, Imasa, Vence Tudo, Kuhn, Marchesan e mais. Condutores, dosadores, telescópios, engrenagens. Envio para todo o Brasil.",
  keywords: [
    "peças para plantadeiras",
    "peças agrícolas",
    "peças de reposição plantadeira",
    "condutor de sementes",
    "condutor de adubo",
    "dosador de sementes",
    "dosador de adubo",
    "telescópio plantadeira",
    "engrenagem plantadeira",
    "Semeato",
    "Jumil",
    "Imasa",
    "Tatu Marchesan",
    "John Deere",
    "Massey Ferguson",
    "Vence Tudo",
    "Kuhn",
    "AGCO",
    "Valtra",
    "TornoMetal",
    "Torno Metal Everton Lopes",
    "peças plantadeira Passo Fundo",
    "fábrica peças agrícolas RS",
    "comprar peças plantadeira online",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "TornoMetal Everton Lopes | Peças para Plantadeiras",
    description:
      "Fábrica de peças para plantadeiras em Passo Fundo/RS. Mais de 25 anos de tradição e qualidade. Envio para todo o Brasil.",
    url: SITE_URL,
    siteName: "TornoMetal Everton Lopes",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "TornoMetal Everton Lopes - Peças para Plantadeiras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TornoMetal Everton Lopes | Peças para Plantadeiras",
    description: "Fábrica de peças para plantadeiras em Passo Fundo/RS. Mais de 25 anos. Envio para todo Brasil.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TornoMetal Everton Lopes",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description: "Fábrica de peças para plantadeiras em Passo Fundo/RS. Mais de 25 anos de tradição.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Passo Fundo",
                addressRegion: "RS",
                addressCountry: "BR",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+55-54-3315-3969",
                contactType: "sales",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
