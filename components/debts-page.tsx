"use client";

import { CalendarClock, CreditCard, HandCoins, TrendingDown } from "lucide-react";
import AppShell from "./app-shell";
import { Card, Pill, ProgressBar } from "./ui";
import { calculateMonthlyBalance, estimateDebtPayoffTime, formatDuration, getEstimatedDate } from "@/lib/financial-calculations";
import { useFinancialProfile } from "@/lib/financial-storage";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function DebtsPage() {
  const { profile } = useFinancialProfile();
  const balance = calculateMonthlyBalance(profile);
  const extra = Math.max(0, balance * 0.3);
  const currentMonths = estimateDebtPayoffTime(profile.debtTotal, profile.debtMonthlyPayments);
  const plannedMonths = estimateDebtPayoffTime(profile.debtTotal, profile.debtMonthlyPayments + extra);
  const savedMonths = currentMonths !== null && plannedMonths !== null ? Math.max(0, currentMonths - plannedMonths) : 0;
  const payoffDate = getEstimatedDate(plannedMonths);

  return (
    <AppShell title="Dívidas" subtitle="Prazos calculados com o total e as parcelas informados no onboarding.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="bg-forest p-7 text-white md:col-span-2"><p className="text-xs font-bold text-white/50">Total em aberto</p><p className="mt-2 font-display text-5xl">{money(profile.debtTotal)}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/45">Parcelas atuais</p><b className="mt-1 block text-xl">{money(profile.debtMonthlyPayments)}/mês</b></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/45">Previsão no plano</p><b className="mt-1 block text-xl">{payoffDate ? new Intl.DateTimeFormat("pt-BR",{month:"short",year:"numeric"}).format(payoffDate) : "Sem previsão"}</b></div></div></Card>
        <Card className="p-7"><HandCoins className="text-forest"/><p className="mt-5 text-xs font-bold text-ink/40">Aceleração possível</p><p className="mt-1 font-display text-3xl text-forest">+ {money(extra)}</p><p className="mt-2 text-sm leading-6 text-ink/50">por mês, preservando 70% do saldo para sua meta e margem.</p></Card>
        <Card className="p-7 md:col-span-3"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-3xl">Caminho de quitação</h2><p className="mt-1 text-sm text-ink/45">{profile.debtType}</p></div><Pill tone={profile.debtTotal > 0 ? "peach" : "green"}>{profile.debtTotal > 0 ? "Em andamento" : "Sem dívidas"}</Pill></div><div className="mt-7 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-cream p-5"><CreditCard className="text-forest"/><p className="mt-4 text-xs font-bold text-ink/40">Ritmo atual</p><b className="mt-1 block text-xl">{formatDuration(currentMonths)}</b></div><div className="rounded-2xl bg-mist p-5"><TrendingDown className="text-forest"/><p className="mt-4 text-xs font-bold text-ink/40">Com o plano</p><b className="mt-1 block text-xl">{formatDuration(plannedMonths)}</b></div><div className="rounded-2xl bg-light p-5"><CalendarClock className="text-forest"/><p className="mt-4 text-xs font-bold text-ink/40">Tempo recuperado</p><b className="mt-1 block text-xl">{savedMonths} {savedMonths === 1 ? "mês" : "meses"}</b></div></div><div className="mt-7"><div className="mb-2 flex justify-between text-xs font-bold"><span>Compromisso mensal sugerido</span><span>{money(profile.debtMonthlyPayments + extra)}</span></div><ProgressBar value={profile.debtTotal ? Math.min(100,(profile.debtMonthlyPayments+extra)/profile.debtTotal*100*12) : 100}/></div></Card>
      </div>
    </AppShell>
  );
}
