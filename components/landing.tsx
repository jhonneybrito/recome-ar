"use client";

import Link from "next/link";
import { ArrowRight, Check, CreditCard, Heart, Home, MessageCircleHeart, PiggyBank, Plane, ShieldCheck, Sparkles, Target, WalletCards } from "lucide-react";
import { Button, Logo } from "./ui";

const registerHref = "/register";
const heroImage = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=80";
const phraseCards = ["Você gasta demais", "Você nunca me conta nada", "A gente nunca sai do lugar", "Cadê o dinheiro?"];
const offerItems = ["App Recomeçar", "Guia digital para o casal", "Checklist de conversa", "Planejamento financeiro do casal", "Bônus de organização em 7 dias"];
const chips = ["Visão do mês", "Metas do casal", "Dívidas", "Cartão de crédito", "Viagens", "Reserva financeira", "Gráficos", "Evolução"];
const transformation = [
  { icon: MessageCircleHeart, title: "Menos brigas", text: "Conversas com menos cobrança." },
  { icon: Heart, title: "Mais diálogo", text: "Decisões feitas em dupla." },
  { icon: Target, title: "Objetivos claros", text: "Cada real ganha direção." },
  { icon: Plane, title: "Viagens", text: "Sonhos saem do improviso." },
  { icon: Home, title: "Casa própria", text: "Planos grandes ficam visíveis." },
  { icon: PiggyBank, title: "Reserva", text: "Mais calma para imprevistos." },
  { icon: CreditCard, title: "Cartão no limite", text: "Uso com mais consciência." },
  { icon: Sparkles, title: "Tranquilidade", text: "Paz para olhar o futuro." },
];

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" fill="none" aria-hidden="true">
      <path d="M236 72A112 112 0 1 0 248 199" stroke="currentColor" strokeWidth="34" strokeLinecap="round"/>
      <path d="m91 184 48-48 34 34 76-76" stroke="#FF7658" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="249" cy="94" r="21" fill="#DDF36A" stroke="#102D27" strokeWidth="12"/>
    </svg>
  );
}

function CTA({ children = "Quero o Recomeçar por R$ 27,90", light = false }: { children?: string; light?: boolean }) {
  return (
    <Link href={registerHref} className="inline-flex">
      <Button className={("!rounded-full px-7 py-4 text-sm sm:px-9 " + (light ? "!bg-white !text-forest hover:!bg-cream" : "")).trim()}>
        {children} <ArrowRight size={17}/>
      </Button>
    </Link>
  );
}

function MiniMockup() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <BrandMark className="absolute -left-16 -top-16 hidden w-40 text-sage/20 sm:block"/>
      <div className="brand-grid rounded-[34px] border border-ink/10 bg-cream p-3 shadow-soft">
        <div className="relative overflow-hidden rounded-[26px] bg-ink p-5 text-white sm:p-7">
          <BrandMark className="absolute -right-16 -top-20 w-64 text-white/5"/>
          <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-light">Plano do casal</p><h3 className="mt-2 font-display text-3xl">Julho com clareza</h3></div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">2 pessoas</span>
          </div>
          <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
            {[["Receitas", "R$ 8.400"], ["Despesas", "R$ 5.120"], ["Sonhos", "R$ 1.200"]].map(([label, value], index) => (
              <div key={label} className={(index === 2 ? "bg-light text-ink" : "bg-white/8 text-white") + " rounded-2xl p-4"}><p className="text-xs opacity-50">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>
            ))}
          </div>
          <div className="relative mt-5 rounded-2xl bg-white p-4 text-ink"><b className="text-forest">Próximo passo:</b> separar R$ 300 para a viagem antes de usar o cartão.</div>
        </div>
      </div>
      <div className="absolute -bottom-10 right-4 hidden w-44 rotate-2 rounded-[28px] border border-ink/10 bg-paper p-3 shadow-soft sm:block">
        <div className="rounded-[20px] bg-mist p-4"><WalletCards className="text-forest"/><p className="mt-8 text-xs font-bold text-ink/45">Meta viagem</p><p className="font-display text-3xl">42%</p><div className="mt-3 h-2 rounded-full bg-ink/10"><div className="h-full w-[42%] rounded-full bg-forest"/></div></div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-paper text-ink">
      <section className="relative min-h-[94vh] overflow-hidden bg-ink text-white">
        <img src={heroImage} alt="Casal conversando com calma em casa" className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high"/>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,45,39,.95),rgba(16,45,39,.74),rgba(16,45,39,.48))]"/>
        <div className="brand-noise absolute inset-0 opacity-25"/>
        <BrandMark className="absolute -right-28 -top-28 w-[520px] text-white/10"/>
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-ink/70 to-transparent"/>
        <header className="container-page relative z-10 flex h-24 items-center justify-between">
          <div className="[&_span]:!text-white [&_span_span]:!text-peach"><Logo/></div>
          <CTA light>Começar hoje</CTA>
        </header>
        <div className="container-page relative z-10 flex min-h-[calc(94vh-96px)] items-center py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3"><span className="h-px w-10 bg-peach"/><p className="text-[11px] font-extrabold uppercase tracking-[.24em] text-light">Recomeçar para casais</p></div>
            <h1 className="mt-6 max-w-5xl font-display text-[3.5rem] leading-[.9] tracking-[-.05em] sm:text-7xl lg:text-[6.7rem]">Pare de brigar por <span className="relative italic text-light">dinheiro<span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-peach/80"/></span> dentro de casa.</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/76 sm:text-xl">Em 7 dias, vocês organizam as finanças do casal com um plano simples, o app Recomeçar e um guia prático para conversar sobre dinheiro sem estresse.</p>
            <div className="mt-9"><CTA light/></div>
            <p className="mt-4 text-xs font-bold text-white/55">Entrega digital + aplicativo + guia + bônus - Comece hoje</p>
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center"><p className="eyebrow">Quando o dinheiro vira tensão</p><h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">Se o dinheiro virou motivo de discussão, algo precisa mudar.</h2></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{phraseCards.map((phrase, index) => <div key={phrase} className={(index === 1 ? "bg-light" : "bg-white") + " rounded-[26px] border border-ink/10 p-6 text-center font-display text-2xl italic shadow-sm"}>“{phrase}”</div>)}</div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-lg leading-8 text-ink/58">A falta de clareza financeira gera culpa, cobrança e distância. Mas isso pode mudar hoje.</p>
      </section>

      <section className="brand-grid bg-cream py-20 sm:py-28"><div className="container-page grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="eyebrow">O mecanismo</p><h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">O dinheiro não precisa separar vocês.</h2></div><div className="rounded-[32px] bg-white/80 p-8 shadow-sm"><p className="text-xl leading-9 text-ink/60">O Recomeçar mostra receitas, despesas, dívidas, metas e próximos passos do casal em uma visão simples. Assim, as conversas deixam de virar cobrança e passam a virar plano.</p></div></div></section>

      <section className="container-page py-20 sm:py-32"><div className="mx-auto max-w-3xl text-center"><p className="eyebrow">App + guia prático</p><h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Tudo o que vocês precisam para organizar a vida financeira juntos.</h2></div><div className="mt-14"><MiniMockup/></div><div className="mx-auto mt-20 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">{chips.map((item) => <div key={item} className="rounded-full bg-mist px-5 py-3 text-center text-sm font-extrabold text-forest">{item}</div>)}</div></section>

      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-28"><BrandMark className="absolute -bottom-28 -right-20 w-[460px] text-white/5"/><div className="container-page relative"><div className="max-w-3xl"><p className="eyebrow !text-light">Transformação</p><h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">O que muda quando vocês enxergam o dinheiro juntos.</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{transformation.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-[26px] border border-white/10 bg-white/5 p-6"><Icon className="text-light"/><h3 className="mt-7 font-display text-3xl">{title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{text}</p></div>)}</div></div></section>

      <section className="container-page py-20 sm:py-28"><div className="grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="eyebrow">Você recebe hoje</p><h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Um combo simples para começar a conversa certa.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-ink/58">Sem planilhas complicadas. Sem excesso de teoria. Um caminho prático para olhar o dinheiro com maturidade.</p></div><div className="brand-grid rounded-[34px] bg-cream p-3 shadow-soft"><div className="rounded-[28px] bg-white p-6 sm:p-8">{offerItems.map((item) => <div key={item} className="flex items-center gap-4 border-b border-ink/8 py-4 last:border-0"><span className="grid h-9 w-9 place-items-center rounded-full bg-light"><Check size={17}/></span><b>{item}</b></div>)}</div></div></div></section>

      <section className="container-page pb-20 sm:pb-28"><div className="relative overflow-hidden rounded-[42px] bg-forest p-8 text-center text-white shadow-soft sm:p-14"><BrandMark className="absolute -right-16 -top-24 w-80 text-white/7"/><div className="relative"><p className="eyebrow !text-light">Oferta de lançamento</p><div className="mt-5 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-sm font-extrabold text-white/65"><span>De <span className="line-through decoration-peach decoration-2">R$ 127,00</span></span><span className="h-1.5 w-1.5 rounded-full bg-light"/><span>por apenas</span></div><h2 className="mt-4 font-display text-5xl sm:text-7xl">R$ 27,90</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/62">App Recomeçar + guia digital + checklist de conversa + planejamento do casal.</p><div className="mt-9"><CTA light>Quero o Recomeçar agora</CTA></div><p className="mt-5 text-xs font-bold text-white/52"><ShieldCheck size={15} className="mr-1 inline"/> 7 dias de garantia + pagamento seguro + acesso imediato</p></div></div></section>

      <section className="brand-grid bg-cream py-20 sm:py-28"><div className="container-page grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div className="relative mx-auto w-full max-w-md"><div className="absolute -left-5 -top-5 h-24 w-24 rounded-full bg-light/70 blur-2xl"/><div className="relative overflow-hidden rounded-[38px] border border-ink/10 bg-white p-3 shadow-soft"><img src="/claudia-mourao-expert.png" alt="Claudia Mourão, mentora de casais" className="h-[520px] w-full rounded-[30px] object-cover object-[50%_42%]" loading="lazy"/><div className="absolute bottom-7 left-7 right-7 rounded-[24px] bg-ink/88 p-5 text-white backdrop-blur"><p className="font-display text-3xl">Claudia Mourão</p><p className="mt-2 text-xs font-bold text-white/55">Pastora, mãe e mentora de casais</p></div></div></div><div><p className="eyebrow">Autoridade</p><h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Claudia Mourão</h2><p className="mt-5 max-w-2xl text-xl leading-9 text-ink/60">Mentora de casais. Ajudando famílias a conversarem sobre dinheiro com mais clareza, maturidade e propósito.</p><div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm"><p className="font-display text-3xl leading-tight text-forest">“Com planejamento, os sonhos cabem no orçamento.”</p><p className="mt-4 text-sm leading-6 text-ink/55">A presença da expert reforça o lado humano da proposta: dinheiro como conversa, acordo e construção do futuro juntos.</p></div></div></div></section>

      <section className="bg-light py-16"><div className="container-page flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left"><div><p className="eyebrow">Comece com uma conversa melhor</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">Paz dentro de casa também se planeja.</h2></div><CTA>Quero começar agora</CTA></div></section>

      <footer className="bg-ink py-10 text-white"><div className="container-page flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div className="[&_span]:!text-white [&_span_span]:!text-peach"><Logo/><p className="mt-4 max-w-sm text-sm leading-6 text-white/45">Clareza financeira para casais que querem planejar o futuro sem transformar a casa em campo de batalha.</p></div><div className="text-xs text-white/40"><nav className="mb-4 flex flex-wrap gap-4 font-bold text-white/65"><Link href="/terms">Termos</Link><Link href="/privacy">Privacidade</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contato</Link></nav><p>© 2026 Recomeçar. Clareza para seguir.</p></div></div></footer>
    </main>
  );
}
