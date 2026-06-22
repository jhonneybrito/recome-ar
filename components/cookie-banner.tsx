"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui";

const KEY = "recomecar:cookie-consent:v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(!window.localStorage.getItem(KEY)), []);

  const save = (analytics: boolean) => {
    window.localStorage.setItem(KEY, JSON.stringify({ essential: true, analytics, savedAt: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-4xl rounded-[24px] border border-ink/10 bg-white p-5 shadow-[0_24px_70px_rgba(16,45,39,.22)] sm:p-6" aria-label="Preferências de cookies">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex-1"><p className="font-display text-2xl">Sua privacidade importa.</p><p className="mt-2 text-sm leading-6 text-ink/55">Usamos cookies essenciais para o funcionamento. Com sua autorização, poderemos usar cookies analíticos e de desempenho. Leia a <Link href="/cookies" className="font-bold text-forest underline">Política de Cookies</Link>.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row"><Button variant="secondary" onClick={() => save(false)}>Somente essenciais</Button><Button onClick={() => save(true)}>Aceitar todos</Button></div>
      </div>
    </aside>
  );
}
