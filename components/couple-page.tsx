"use client";

import { Heart, MessageCircleHeart, RefreshCw, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppShell from "./app-shell";
import { Button, Card, Input, Pill } from "./ui";
import { useFinancialProfile } from "@/lib/financial-storage";
import { useTransactions } from "@/lib/transactions-storage";
import { getPriorityDebt, useDebts } from "@/lib/debts-storage";
import { useGoals } from "@/lib/goals-storage";
import { saveCoupleMeetingDb } from "@/lib/db";

const KEY = "recomecar:couple:v1";
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CouplePage() {
  const { profile } = useFinancialProfile();
  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const { goals } = useGoals();
  const [partner, setPartner] = useState("");
  const [ritual, setRitual] = useState("Domingo, 19h");
  const [saved, setSaved] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      setPartner(data.partner || "");
      setRitual(data.ritual || "Domingo, 19h");
    } catch {}
  }, []);

  const month = new Date().toISOString().slice(0, 7);
  const monthItems = transactions.filter((item) => item.date.startsWith(month));
  const income = monthItems.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = monthItems.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const payments = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const balance = income - expenses - payments;
  const plannedExpenses = profile.fixedExpenses + profile.variableExpenses;
  const priorityDebt = getPriorityDebt(debts);
  const primaryGoal = goals[0];

  const agendas = useMemo(() => {
    const points: string[] = [];
    if (priorityDebt) {
      points.push(priorityDebt.priorityType === "Dívida emocional/urgente" || priorityDebt.urgencyReason
        ? `A dívida “${priorityDebt.name}” parece carregar um peso além dos números. Como ela tem afetado a tranquilidade de vocês e qual acordo traria mais segurança, sem julgamento?`
        : `A dívida “${priorityDebt.name}” está entre as prioridades atuais. Que decisão possível ajudaria a reduzir seus ${money(Math.max(0, priorityDebt.total - priorityDebt.paid))} sem comprometer o essencial do casal?`);
    }
    if (balance < 0) {
      points.push(`O saldo do mês está em ${money(balance)}. Quais ajustes poderiam ser escolhidos em conjunto, preservando as necessidades de cada um e evitando que a conversa vire culpa?`);
    } else if (plannedExpenses > 0 && expenses > plannedExpenses) {
      points.push(`Os gastos registrados ficaram acima do valor planejado. O que cada um sentiu ao perceber isso e que limite poderia ser combinado com respeito para o próximo mês?`);
    } else {
      points.push(`Ao olhar para as receitas de ${money(income)} e despesas de ${money(expenses)}, o que trouxe alívio, ansiedade ou surpresa? O que merece ser mantido com carinho?`);
    }
    if (primaryGoal) {
      points.push(`A meta “${primaryGoal.name}” ainda representa um sonho importante para os dois? Qual pequeno compromisso compartilhado ajudaria a aproximar os atuais ${money(primaryGoal.current)} dos ${money(primaryGoal.target)}?`);
    } else {
      points.push("Qual objetivo financeiro traria mais paz para a vida a dois neste momento e qual seria um primeiro passo pequeno o bastante para ambos sustentarem?");
    }
    if (points.length < 3) points.push("Que pequeno acordo financeiro os dois podem assumir nesta semana para aumentar a sensação de parceria e previsibilidade?");
    return points.slice(0, 3);
  }, [balance, expenses, income, plannedExpenses, primaryGoal, priorityDebt, version]);

  useEffect(() => {
    try {
      const previous = JSON.parse(localStorage.getItem(KEY) || "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...previous, partner, ritual, agendas, agendasUpdatedAt: new Date().toISOString() }));
      saveCoupleMeetingDb(agendas).catch(console.error);
    } catch {}
  }, [agendas, partner, ritual]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem(KEY, JSON.stringify({ partner, ritual, agendas, updatedAt: new Date().toISOString(), agendasUpdatedAt: new Date().toISOString() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell title="Plano a Dois" subtitle="Organize conversas e decisões compartilhadas.">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
        <Card className="bg-peach p-8"><Heart/><Pill tone="neutral"><span className="mr-1">♥</span>{partner ? `${profile.name} + ${partner}` : "Configure seu plano"}</Pill><h2 className="mt-6 font-display text-4xl">Dinheiro também é conversa.</h2><p className="mt-4 leading-7 text-ink/60">Registre o nome da pessoa parceira e um horário recorrente para conversar sobre metas, gastos e decisões.</p></Card>
        <Card className="p-7"><div className="flex items-center gap-3"><Users className="text-forest"/><h2 className="font-display text-3xl">Configuração do casal</h2></div><form onSubmit={save} className="mt-7 grid gap-5"><Input required label="Nome da pessoa parceira" value={partner} onChange={(event) => setPartner(event.target.value)} placeholder="Nome"/><Input required label="Ritual financeiro" value={ritual} onChange={(event) => setRitual(event.target.value)} placeholder="Ex.: Domingo, 19h"/><Button type="submit">{saved ? "Plano salvo" : "Salvar Plano a Dois"}</Button></form></Card>

        <Card className="p-7 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><MessageCircleHeart className="mt-1 text-forest"/><div><h2 className="font-display text-3xl">Reunião Financeira do Casal</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/50">Três conversas sugeridas pelos dados atuais. Falem sobre sentimentos, expectativas e acordos — nunca sobre quem errou.</p></div></div><Button variant="secondary" onClick={() => setVersion((current) => current + 1)}><RefreshCw size={16}/>Atualizar pautas</Button></div>
          <ol className="mt-7 grid gap-4 md:grid-cols-3">{agendas.map((agenda, index) => <li key={`${index}-${agenda}`} className="rounded-[24px] bg-cream p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-display text-lg text-white">{index + 1}</span><p className="mt-4 text-sm leading-7 text-ink/65">{agenda}</p></li>)}</ol>
        </Card>
      </div>
    </AppShell>
  );
}
