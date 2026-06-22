"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bot, ChevronDown, CreditCard, Flag, HandCoins, Heart, LayoutDashboard, Menu, Plus, ReceiptText, Settings, Target, X } from "lucide-react";
import { useState } from "react";
import { Button, Logo } from "./ui";
import { useFinancialProfile } from "@/lib/financial-storage";
import LegalFooter from "./legal-footer";

const links = [
  ["/dashboard", "Visão geral", LayoutDashboard],
  ["/transactions", "Movimentações", ReceiptText],
  ["/debts", "Dívidas", HandCoins],
  ["/goals", "Metas", Target],
  ["/couple", "Plano a Dois", Heart],
  ["/ai-plan", "Meu plano IA", Bot],
];

export default function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { profile } = useFinancialProfile();
  const initials = (profile.name || "Você").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-ink/8 bg-white p-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between"><Logo /><button className="lg:hidden" onClick={() => setOpen(false)}><X /></button></div>
        <div className="mt-9 rounded-2xl bg-cream p-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-peach/40 font-extrabold">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-extrabold">{profile.name || "Seu perfil"}</p><p className="text-xs text-ink/45">Plano Gratuito</p></div><ChevronDown className="ml-auto" size={16} /></div>
        </div>
        <nav className="mt-7 grid gap-1">
          {links.map(([href, label, Icon]) => {
            const I = Icon as typeof Flag;
            const active = path === href;
            return <Link key={String(href)} href={String(href)} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-forest text-white" : "text-ink/55 hover:bg-mist hover:text-forest"}`}><I size={19} />{String(label)}</Link>;
          })}
        </nav>
        <div className="absolute inset-x-5 bottom-5">
          <div className="mb-4 rounded-2xl bg-mist p-4"><p className="text-xs font-extrabold text-forest">Seu recomeço</p><div className="mt-2 h-2 rounded-full bg-white"><div className="h-2 w-[72%] rounded-full bg-forest" /></div><p className="mt-2 text-[11px] text-ink/45">Você concluiu 72% do seu plano</p></div>
          <Link href="/settings" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${path === "/settings" ? "bg-forest text-white" : "text-ink/55"}`}><Settings size={19} />Configurações</Link>
        </div>
      </aside>
      {open && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-ink/25 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-ink/8 bg-[#f7f7f3]/90 px-5 backdrop-blur-xl sm:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <div className="min-w-0"><h1 className="truncate font-display text-2xl sm:text-3xl">{title}</h1>{subtitle && <p className="hidden text-xs text-ink/45 sm:block">{subtitle}</p>}</div>
          <div className="ml-auto flex items-center gap-2"><button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-ink/55"><Bell size={19} /></button><Button className="hidden sm:flex"><Plus size={17} /> Nova movimentação</Button><Button className="!px-3 sm:hidden"><Plus size={18} /></Button></div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
        <LegalFooter />
      </div>
    </div>
  );
}
