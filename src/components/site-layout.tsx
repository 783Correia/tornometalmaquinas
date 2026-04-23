"use client";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { WhatsAppButton } from "./whatsapp-button";

export function SiteLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      {footer}
      <WhatsAppButton />
    </>
  );
}
