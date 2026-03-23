import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesse sua conta TornoMetal para comprar peças para plantadeiras e acompanhar seus pedidos.",
  robots: { index: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
