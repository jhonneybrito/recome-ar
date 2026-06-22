"use client";

import Link from "next/link";
import {
  ArrowRight, BrainCircuit, Check, Heart, Menu, MoveUpRight,
  ShieldCheck, Sparkles, TrendingUp, WalletCards, X
} from "lucide-react";
import { useState } from "react";
import { Button, Card, CheckItem, Logo, Pill, ProgressBar } from "./ui";

function OrbitMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" fill="none" aria-hidden="true">
      <path d="M236 72A112 112 0 1 0 248 199" stroke="currentColor" strokeWidth="34" strokeLinecap="round"/>
      <path d="m91 184 48-48 34 34 76-76" stroke="#FF7658" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="249" cy="94" r="21" fill="#DDF36A" stroke="#102D27" strokeWidth="12"/>
    </svg>
  );
}

export default function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="overflow-hidden bg-paper">
      <div className="bg-ink px-5 py-2 text-center text-[10px] font-extrabold uppercase tracking-[.22em] text-white">
        Seu dinheiro pode ter direção, sem deixar de ter vida.
      </div>

      <header className="container-page flex h-24 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 text-xs font-extrabold uppercase tracking-[.08em] text-ink/55 md:flex">
          <a className="transition hover:text-peach" href="#metodo">Método</a>
          <a className="transition hover:text-peach" href="#para-quem">Vida real</a>
          <a className="transition hover:text-peach" href="#planos">Planos</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login"><Button variant="ghost">Entrar</Button></Link>
          <Link href="/register"><Button>Começar agora <ArrowRight size={16}/></Button></Link>
        </div>
        <button aria-label="Abrir menu" className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X/> : <Menu/>}
        </button>
      </header>
      {open && (
        <div className="container-page grid gap-4 border-y border-ink/10 py-6 text-sm font-bold md:hidden">
          <a href="#metodo">Método</a><a href="#para-quem">Vida real</a><a href="#planos">Planos</a><Link href="/login">Entrar</Link>
        </div>
      )}

      <section className="container-page pb-16 pt-8 lg:pb-24">
        <div className="brand-grid relative overflow-hidden rounded-[32px] border border-ink/10 bg-cream sm:rounded-[44px]">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-light/65 blur-3xl"/>
          <div className="relative grid min-h-[680px] lg:grid-cols-[1.08fr_.92fr]">
            <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-peach"/>
                <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-ink/55">Inteligência financeira para a vida real</span>
              </div>
              <h1 className="mt-8 max-w-3xl font-display text-[3.8rem] font-medium leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[6.25rem]">
                Recomeçar é dar <span className="relative italic text-forest">direção<span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-light -z-0 opacity-80"/></span> ao que importa.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-ink/60 sm:text-lg">
                Uma experiência financeira humana, inteligente e compartilhável. Para transformar números em decisões — e decisões em uma vida mais leve.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding"><Button className="w-full !rounded-full px-8 py-4 sm:w-auto">Criar meu primeiro plano <ArrowRight size={17}/></Button></Link>
                <a href="#metodo"><Button variant="ghost" className="w-full !rounded-full border border-ink/15 px-8 py-4 sm:w-auto">Conhecer o método</Button></a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-bold text-ink/45">
                <span className="flex items-center gap-2"><ShieldCheck size={15}/> Dados protegidos</span>
                <span className="flex items-center gap-2"><Check size={15}/> Sem cartão</span>
                <span className="flex items-center gap-2"><Check size={15}/> Cancele quando quiser</span>
              </div>
            </div>

            <div className="relative flex min-h-[530px] items-center justify-center overflow-hidden bg-forest p-6 sm:p-10 lg:min-h-0">
              <div className="brand-noise absolute inset-0 opacity-20"/>
              <OrbitMark className="absolute -right-12 -top-10 w-[360px] text-white/10"/>
              <div className="relative w-full max-w-md rotate-[-1.5deg] rounded-[32px] border border-white/20 bg-paper p-5 shadow-[0_40px_90px_rgba(0,0,0,.3)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-ink/35">Hoje, 22 de junho</p><h2 className="mt-1 font-display text-2xl">Seu mês tem espaço.</h2></div>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-light text-xs font-extrabold">MS</span>
                </div>
                <div className="mt-5 rounded-[24px] bg-ink p-5 text-white">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em] text-white/45"><span>Disponível para decidir</span><WalletCards size={17}/></div>
                  <p className="mt-3 font-display text-4xl">R$ 3.840<span className="text-xl">,00</span></p>
                  <div className="mt-6 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white/65"><TrendingUp size={14} className="text-light"/> R$ 740 a mais que no mês passado</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-mist p-4"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-ink/35">Reserva</p><p className="my-2 font-display text-2xl">68%</p><ProgressBar value={68}/></div>
                  <div className="rounded-[20px] bg-peach p-4 text-ink"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] opacity-55">Próximo gesto</p><p className="mt-2 text-sm font-extrabold leading-5">Antecipar uma parcela.</p></div>
                </div>
              </div>
              <div className="absolute bottom-7 right-5 rotate-3 rounded-full bg-light px-5 py-3 text-xs font-extrabold text-ink shadow-xl sm:right-8">clareza → ação</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-6">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          <span className="eyebrow">Uma nova relação com</span>
          {["dinheiro", "tempo", "escolhas", "futuro"].map((item, index) => (
            <span key={item} className="flex items-center gap-12 font-display text-2xl italic text-ink/70">
              {item}{index < 3 && <span className="h-2 w-2 rounded-full bg-peach"/>}
            </span>
          ))}
        </div>
      </section>

      <section id="metodo" className="bg-ink py-24 text-white sm:py-32">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-light/40 text-light"><MoveUpRight/></span>
              <p className="eyebrow mt-8 !text-light">Método Recomeçar</p>
            </div>
            <h2 className="font-display text-5xl leading-[1.02] tracking-[-.035em] sm:text-7xl">Não controlamos a sua vida. <span className="italic text-sage">Organizamos possibilidades.</span></h2>
          </div>
          <div className="mt-16 grid border-t border-white/15 md:grid-cols-3">
            {[
              [BrainCircuit, "01", "Entender", "Sua realidade entra antes dos números: momento, pressões, sonhos e prioridades."],
              [TrendingUp, "02", "Enxergar", "Traduzimos complexidade em uma visão clara do agora e do que pode mudar."],
              [Sparkles, "03", "Avançar", "A inteligência cria próximos passos possíveis, ajustados conforme a vida acontece."],
            ].map(([Icon, n, title, text], index) => {
              const I = Icon as typeof BrainCircuit;
              return (
                <article key={String(n)} className={`py-8 md:px-7 md:py-10 ${index > 0 ? "border-t border-white/15 md:border-l md:border-t-0" : ""}`}>
                  <div className="flex items-center justify-between"><I className="text-light"/><span className="font-display text-4xl text-white/15">{String(n)}</span></div>
                  <h3 className="mt-14 font-display text-4xl">{String(title)}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="para-quem" className="container-page py-24 sm:py-32">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative min-h-[570px] overflow-hidden rounded-[36px] bg-peach p-8 sm:p-12">
            <OrbitMark className="absolute -bottom-24 -right-20 w-[430px] text-ink/10"/>
            <Pill tone="neutral"><Heart size={13} className="mr-2"/> Plano a Dois</Pill>
            <h2 className="relative mt-8 max-w-md font-display text-5xl leading-[1.02] sm:text-6xl">Dinheiro também é uma conversa sobre futuro.</h2>
            <p className="relative mt-6 max-w-md leading-7 text-ink/65">Cada pessoa preserva sua individualidade. O casal ganha linguagem, visão e metas em comum.</p>
            <ul className="relative mt-10 grid gap-4"><CheckItem>Objetivos individuais e compartilhados</CheckItem><CheckItem>Conversas guiadas, sem julgamento</CheckItem><CheckItem>Acordos claros para decisões importantes</CheckItem></ul>
          </div>
          <div className="flex flex-col justify-between rounded-[36px] border border-ink/10 bg-cream p-8 sm:p-12">
            <div>
              <p className="eyebrow">Vida real, sem performance</p>
              <h2 className="mt-5 font-display text-5xl leading-[1.02] sm:text-6xl">Você não precisa virar outra pessoa para cuidar melhor do dinheiro.</h2>
            </div>
            <div className="mt-14 grid gap-3 sm:grid-cols-2">
              {["Sair das dívidas", "Criar uma reserva", "Planejar a dois", "Parar de viver no susto"].map((item, index) => (
                <div key={item} className={`rounded-[22px] border border-ink/10 p-5 ${index === 1 ? "bg-light" : "bg-white"}`}>
                  <span className="text-[10px] font-extrabold text-ink/30">0{index + 1}</span>
                  <p className="mt-5 font-extrabold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="bg-cream py-24 sm:py-32">
        <div className="container-page">
          <div className="text-center"><p className="eyebrow">Planos transparentes</p><h2 className="mt-5 font-display text-5xl sm:text-6xl">Comece no seu ritmo.</h2><p className="mx-auto mt-4 max-w-lg text-ink/50">Sem letras miúdas, sem culpa e sem transformar sua vida em uma planilha.</p></div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
            <Card className="p-8 sm:p-10">
              <div className="flex items-center justify-between"><Pill tone="neutral">Individual</Pill><span className="text-xs font-bold text-ink/35">Para você</span></div>
              <p className="mt-8 font-display text-5xl">R$ 19,90<span className="font-sans text-sm text-ink/35"> /mês</span></p>
              <p className="mt-4 text-sm text-ink/50">Clareza para organizar sua própria jornada.</p>
              <ul className="my-9 grid gap-3"><CheckItem>Dashboard completo</CheckItem><CheckItem>Metas e dívidas</CheckItem><CheckItem>Plano inteligente mensal</CheckItem></ul>
              <Link href="/register"><Button variant="secondary" className="w-full !rounded-full">Começar grátis</Button></Link>
            </Card>
            <Card className="relative overflow-hidden bg-forest p-8 text-white sm:p-10">
              <OrbitMark className="absolute -bottom-20 -right-20 w-72 text-white/5"/>
              <div className="relative flex items-center justify-between"><Pill>Plano a Dois</Pill><span className="rounded-full bg-light px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink">Mais escolhido</span></div>
              <p className="relative mt-8 font-display text-5xl">R$ 24,90<span className="font-sans text-sm text-white/35"> /mês</span></p>
              <p className="relative mt-4 text-sm text-white/50">Planos, sonhos e tranquilidade construídos juntos.</p>
              <ul className="relative my-9 grid gap-3 [&_li]:text-white/70"><CheckItem>Tudo do Individual</CheckItem><CheckItem>Visão compartilhada</CheckItem><CheckItem>Metas do casal</CheckItem></ul>
              <Link href="/register"><Button className="relative w-full !rounded-full !bg-white !text-forest">Começar a dois <ArrowRight size={16}/></Button></Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-light py-16">
        <div className="container-page flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div><p className="eyebrow">O próximo passo pode ser pequeno</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">Mas precisa apontar para algum lugar.</h2></div>
          <Link href="/onboarding"><Button className="shrink-0 !rounded-full px-8 py-4">Começar meu recomeço <ArrowRight size={17}/></Button></Link>
        </div>
      </section>

      <footer className="bg-ink py-12 text-white">
        <div className="container-page flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="[&_span]:!text-white [&_span_span]:!text-peach"><Logo/><p className="mt-5 max-w-sm text-sm leading-6 text-white/40">Inteligência financeira que respeita o tempo, as escolhas e a vida de cada pessoa.</p></div>
          <p className="text-xs text-white/30">© 2026 Recomeçar. Clareza para seguir.</p>
        </div>
      </footer>
    </main>
  );
}
