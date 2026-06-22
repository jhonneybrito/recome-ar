import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/cookie-banner";

export const metadata: Metadata = {
  title: "Recomeçar — sua vida financeira, no seu ritmo",
  description: "Organização financeira simples, acolhedora e inteligente para você ou para o casal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}<CookieBanner/></body>
    </html>
  );
}
