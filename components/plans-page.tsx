"use client";

import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Button, Card, Logo, Pill } from "./ui";
import { trackEvent } from "@/lib/marketing";

const plans = [
  { id: "free", name: "Gratuito", price: "R$ 0", note: "Para organizar o essencial", features: ["20 lançamentos por mês", "3 metas", "3 dívidas", "1 Plano a Dois"] },
  { id: "premium_monthly", name: "Premium Mensal", price: "R$ 27/mês", note: "Flexibilidade mês a mês", features: ["Lançamentos ilimitados", "Metas e dívidas ilimitadas", "Relatórios e projeções completas", "Plano a Dois completo"] },
  { id: "premium_annual", name: "Premium Anual", price: "R$ 147/ano", note: "R$ 12,25 por mês", popular: true, features: ["Tudo do Premium Mensal", "Economia de R$ 177 por ano", "12 meses de evolução", "Garantia de 30 dias"] },
];

export default function PlansPage() {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  useEffect(()=>{if(new URLSearchParams(window.location.search).get("checkout")==="success")trackEvent("Purchase",{currency:"BRL"})},[]);
  const checkout = async (plan: string) => {
    setLoading(plan); setError(""); trackEvent("InitiateCheckout", { content_name: plan });
    const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error || data.message || "Não foi possível iniciar o checkout."); setLoading(""); }
  };
  return <main className="min-h-screen bg-cream"><header className="container-page flex h-24 items-center justify-between"><Logo/><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={16}/>Voltar</Link></header><section className="container-page pb-24 pt-10"><div className="text-center"><Pill tone="neutral">Planos transparentes</Pill><h1 className="mt-5 font-display text-6xl">Escolha o espaço que você precisa.</h1><p className="mx-auto mt-5 max-w-2xl leading-7 text-ink/55">Comece gratuitamente e avance quando os limites deixarem de acompanhar sua vida.</p></div>{error&&<p role="alert" className="mx-auto mt-8 max-w-2xl rounded-2xl bg-peach/15 p-4 text-center text-sm font-bold text-[#8a4c2d]">{error}</p>}<div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">{plans.map((plan)=><Card key={plan.id} className={`relative p-8 ${plan.popular?"bg-forest text-white":""}`}>{plan.popular&&<span className="absolute right-5 top-5 rounded-full bg-light px-3 py-1 text-[10px] font-extrabold uppercase text-ink">Mais escolhido</span>}<Pill tone={plan.popular?"green":"neutral"}>{plan.name}</Pill><p className="mt-8 font-display text-5xl">{plan.price}</p><p className={`mt-3 text-sm ${plan.popular?"text-white/55":"text-ink/45"}`}>{plan.note}</p><ul className="my-8 grid gap-4">{plan.features.map((item)=><li key={item} className="flex gap-3 text-sm"><Check size={17} className={plan.popular?"text-light":"text-forest"}/>{item}</li>)}</ul>{plan.id==="free"?<Link href="/register"><Button variant="secondary" className="w-full">Começar grátis</Button></Link>:<Button onClick={()=>checkout(plan.id)} disabled={loading===plan.id} className={`w-full ${plan.popular?"!bg-white !text-forest":""}`}><Sparkles size={16}/>{loading===plan.id?"Abrindo checkout...":"Escolher plano"}</Button>}</Card>)}</div></section></main>;
}
