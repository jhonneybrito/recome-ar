import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LegalFooter from "./legal-footer";
import { Logo } from "./ui";

export type LegalSection = { title: string; paragraphs?: string[]; items?: string[] };

export default function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="container-page flex h-24 items-center justify-between"><Logo/><Link href="/" className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={16}/> Voltar</Link></header>
      <main className="container-page pb-24 pt-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[36px] bg-forest p-8 text-white sm:p-12"><ShieldCheck className="text-light"/><p className="mt-7 text-xs font-extrabold uppercase tracking-[.2em] text-light">{eyebrow}</p><h1 className="mt-4 font-display text-5xl sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl leading-7 text-white/60">{intro}</p><p className="mt-7 text-xs text-white/40">Última atualização: 22 de junho de 2026</p></div>
          <div className="mt-10 grid gap-8">{sections.map((section,index)=><section key={section.title} className="border-b border-ink/10 pb-8"><div className="flex gap-5"><span className="pt-1 font-display text-2xl text-peach">{String(index+1).padStart(2,"0")}</span><div><h2 className="font-display text-3xl">{section.title}</h2>{section.paragraphs?.map((p)=><p key={p} className="mt-4 leading-7 text-ink/60">{p}</p>)}{section.items && <ul className="mt-4 grid gap-3">{section.items.map((item)=><li key={item} className="flex gap-3 leading-7 text-ink/60"><span className="text-peach">•</span>{item}</li>)}</ul>}</div></div></section>)}</div>
          <div className="mt-10 rounded-[24px] bg-cream p-6 text-sm leading-6 text-ink/55"><b className="text-ink">Nota importante:</b> este documento é uma versão inicial de transparência para o MVP. Antes da operação comercial, revise razão social, CNPJ, endereço, encarregado de dados e procedimentos internos com assessoria jurídica especializada.</div>
        </div>
      </main>
      <LegalFooter/>
    </div>
  );
}
