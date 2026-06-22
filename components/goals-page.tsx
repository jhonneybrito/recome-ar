"use client";

import { CalendarDays, Flag, PiggyBank, Target } from "lucide-react";
import AppShell from "./app-shell";
import { Card, Pill, ProgressBar } from "./ui";
import { calculateMonthlyBalance, estimateGoalTime, formatDuration, getEstimatedDate } from "@/lib/financial-calculations";
import { useFinancialProfile } from "@/lib/financial-storage";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GoalsPage() {
  const { profile } = useFinancialProfile();
  const balance = calculateMonthlyBalance(profile);
  const contribution = Math.max(0, balance * 0.7);
  const months = estimateGoalTime(profile.goalAmount, profile.currentSavings, contribution);
  const date = getEstimatedDate(months);
  const progress = profile.goalAmount > 0 ? Math.min(100, profile.currentSavings / profile.goalAmount * 100) : 100;

  return (
    <AppShell title="Metas" subtitle="Sua projeção muda automaticamente quando renda, despesas ou objetivo mudam.">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="bg-forest p-8 text-white"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Flag/></span><Pill tone="peach">{profile.mainGoal}</Pill></div><h2 className="mt-8 font-display text-4xl">{money(profile.currentSavings)} de {money(profile.goalAmount)}</h2><p className="mt-2 text-sm text-white/50">Progresso construído até agora</p><div className="mt-7"><ProgressBar value={progress} color="bg-light"/></div><div className="mt-3 flex justify-between text-xs font-bold"><span>{progress.toFixed(0)}% concluído</span><span>{money(contribution)}/mês</span></div></Card>
        <div className="grid gap-5">
          <Card><CalendarDays className="text-forest"/><p className="mt-5 text-xs font-bold text-ink/40">Data estimada</p><p className="mt-2 font-display text-3xl">{date ? new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(date) : "Aguardando saldo"}</p><p className="mt-2 text-xs text-ink/45">{formatDuration(months)}</p></Card>
          <Card className="bg-light"><PiggyBank className="text-forest"/><p className="mt-5 text-xs font-bold text-ink/40">Falta acumular</p><p className="mt-2 font-display text-3xl">{money(Math.max(0,profile.goalAmount-profile.currentSavings))}</p></Card>
        </div>
        <Card className="p-7 lg:col-span-2"><div className="flex items-center gap-3"><Target className="text-forest"/><h2 className="font-display text-3xl">Como esta projeção foi calculada</h2></div><p className="mt-4 max-w-3xl text-sm leading-7 text-ink/55">O Recomeçar direciona 70% do saldo mensal positivo para sua meta e mantém 30% como margem ou aceleração de dívidas. Hoje isso representa {money(contribution)} por mês. Se o saldo estiver negativo, a projeção fica pausada até o orçamento voltar ao equilíbrio.</p></Card>
      </div>
    </AppShell>
  );
}
