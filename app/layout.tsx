import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/cookie-banner";
import MetaPixel from "@/components/meta-pixel";

export const metadata: Metadata = {
  title: "Recomeçar para Casais — organize dinheiro sem brigas",
  description: "App, guia e planejamento para casais organizarem finanças, reduzirem estresse e conversarem sobre dinheiro com clareza.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}<CookieBanner/><MetaPixel/></body>
    </html>
  );
}
