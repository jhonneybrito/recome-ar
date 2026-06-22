"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Heart, Home, Sparkles, Target, Wallet } from "lucide-react";
import { useState } from "react";
import { Button, Input, Logo } from "@/components/ui";

const goals = [
  [Home, "Sair das dívidas", "Quero voltar a respirar"],
  [Wallet, "Criar uma reserva", "Quero ter segurança"],
  [Target, "Realizar um sonho", "Quero planejar algo grande"],
  [Heart, "Organizar a vida a dois", "Quero caminhar em parceria"],
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(0);
  const total = 4;
  return (
    <main className="min-h-screen bg-cream">
      <header className="container-page flex h-24 items-center justify-between"><Logo /><span className="text-xs font-extrabold text-ink/40">Passo {step} de {total}</span></header>
      <div className="mx-auto h-1.5 max-w-2xl rounded-full bg-white"><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${step / total * 100}%` }} /></div>
      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          {step === 1 && <><p className="eyebrow">Antes dos números</p><h1 className="mt-4 font-display text-5xl leading-tight">O que faria você se sentir mais leve hoje?</h1><p className="mt-4 leading-7 text-ink/55">Não existe resposta certa. Isso só nos ajuda a começar pelo que mais importa.</p><div className="mt-9 grid gap-4 sm:grid-cols-2">{goals.map(([Icon,title,text], i) => { const I = Icon as typeof Home; return <button key={String(title)} onClick={() => setSelected(i)} className={`relative rounded-[24px] border-2 p-6 text-left transition ${selected === i ? "border-forest bg-white shadow-soft" : "border-transparent bg-white/60 hover:bg-white"}`}><I className="text-forest" /><p className="mt-6 font-display text-2xl">{String(title)}</p><p className="mt-2 text-sm text-ink/45">{String(text)}</p>{selected === i && <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-forest text-white"><Check size={14} /></span>}</button>})}</div></>}
          {step === 2 && <><p className="eyebrow">Sua realidade</p><h1 className="mt-4 font-display text-5xl">Vamos entender seu mês.</h1><p className="mt-4 text-ink/55">Valores aproximados já são suficientes. Você pode ajustar tudo depois.</p><div className="mt-9 grid gap-5 sm:grid-cols-2"><Input label="Renda mensal líquida" placeholder="R$ 0,00" /><Input label="Outras rendas" placeholder="R$ 0,00" /><Input label="Gastos fixos" placeholder="R$ 0,00" /><Input label="Gastos variáveis" placeholder="R$ 0,00" /></div></>}
          {step === 3 && <><p className="eyebrow">Seu momento</p><h1 className="mt-4 font-display text-5xl">Existe alguma dívida pesando agora?</h1><p className="mt-4 text-ink/55">Esses dados são privados e servem para priorizar seu plano.</p><div className="mt-9 grid gap-5"><Input label="Valor total aproximado" placeholder="R$ 0,00" /><label className="grid gap-2 text-sm font-bold text-ink/80">Tipo principal<select className="focus-ring rounded-2xl border border-ink/10 bg-white px-4 py-3.5"><option>Cartão de crédito</option><option>Empréstimo</option><option>Financiamento</option><option>Não tenho dívidas</option></select></label></div></>}
          {step === 4 && <div className="rounded-[36px] bg-white p-8 text-center shadow-soft sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mist text-forest"><Sparkles /></span><p className="eyebrow mt-7">Tudo pronto</p><h1 className="mt-3 font-display text-5xl">Seu primeiro plano está nascendo.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-ink/55">Organizamos seus dados e encontramos três movimentos possíveis para você começar sem se sobrecarregar.</p><Link href="/dashboard"><Button className="mt-8 px-8 py-4">Ver meu painel <ArrowRight size={17} /></Button></Link></div>}
          {step < 4 && <div className="mt-10 flex justify-between"><Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}><ArrowLeft size={17} /> Voltar</Button><Button onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={17} /></Button></div>}
        </div>
      </section>
    </main>
  );
}
