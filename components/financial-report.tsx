"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Bot, CalendarDays, CheckCircle2, Lightbulb, PiggyBank, ShieldCheck, Sparkles, Target } from "lucide-react";
import AppShell from "./app-shell";
import { Card, Pill } from "./ui";
import {
  calculateAnnualProjection, calculateFinancialHealth, calculateIncomeCommitment,
  calculateMonthlyBalance, calculateMonthlyExpenses, calculateTotalIncome,
  estimateDebtPayoffTime, estimateGoalTime, formatDuration, getEstimatedDate,
} from "@/lib/financial-calculations";
import { useFinancialProfile } from "@/lib/financial-storage";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateText = (date: Date | null) => date ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date) : "Ainda sem data";

export default function FinancialReport() {
  const { profile } = useFinancialProfile();
  const income = calculateTotalIncome(profile);
  const expenses = calculateMonthlyExpenses(profile);
  const balance = calculateMonthlyBalance(profile);
  const commitment = calculateIncomeCommitment(profile);
  const health = calculateFinancialHealth(profile);
  const annual = calculateAnnualProjection(profile);
  const goalContribution = Math.max(0, balance * 0.7);
  const extraDebtPayment = Math.max(0, balance * 0.3);
  const goalMonths = estimateGoalTime(profile.goalAmount, profile.currentSavings, goalContribution);
  const debtMonths = estimateDebtPayoffTime(profile.debtTotal, profile.debtMonthlyPayments + extraDebtPayment);
  const potentialMonthlySaving = Math.max(0, profile.variableExpenses * 0.1);

  const emotionalMessage = balance < 0
    ? `${profile.name}, estar no negativo não define sua capacidade. Seu plano começa recuperando ${money(Math.abs(balance))} de espaço mensal, sem tentar resolver tudo de uma vez.`
    : commitment > 80
      ? `${profile.name}, seu mês está muito comprometido. Há progresso possível, mas ele precisa começar com proteção e menos pressão.`
      : `${profile.name}, existe espaço real no seu orçamento. Agora o desafio é dar destino ao saldo antes que ele desapareça nas urgências do mês.`;

  const steps = balance <= 0
    ? [
        ["1", "Interromper o déficit", `Reduza ao menos ${money(Math.min(Math.abs(balance) + potentialMonthlySaving, expenses * 0.1))} nos gastos variáveis para voltar ao zero.`],
        ["2", "Proteger as parcelas", `Mantenha ${money(profile.debtMonthlyPayments)} reservado no início do mês para evitar juros e atrasos.`],
        ["3", "Criar uma margem mínima", "Depois do equilíbrio, guarde o primeiro valor livre antes de antecipar qualquer meta."],
      ]
    : [
        ["1", "Proteger o mês", `Mantenha ${money(balance * 0.3)} como margem para imprevistos e decisões reais.`],
        ["2", profile.debtTotal > 0 ? "Acelerar a dívida" : "Fortalecer sua reserva", profile.debtTotal > 0 ? `Use ${money(extraDebtPayment)} extras por mês. A estimativa de quitação passa a ser ${formatDuration(debtMonths)}.` : `Direcione ${money(goalContribution)} por mês para sua meta.`],
        ["3", `Avançar em “${profile.mainGoal}”`, `Com ${money(goalContribution)} mensais, a data estimada é ${dateText(getEstimatedDate(goalMonths))}.`],
      ];

  return (
    <AppShell title="Relatório Financeiro Real" subtitle="Diagnóstico gerado com os dados salvos no seu onboarding.">
      <div className="mx-auto grid max-w-6xl gap-5">
        <Card className="overflow-hidden bg-forest p-8 text-white sm:p-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div><Pill tone={health.color}><Sparkles size={13} className="mr-1"/> Saúde {health.label.toLowerCase()}</Pill><h2 className="mt-5 max-w-3xl font-display text-4xl sm:text-5xl">Seu foco agora é {balance >= 0 ? "transformar saldo em direção." : "recuperar espaço no mês."}</h2><p className="mt-4 max-w-3xl leading-7 text-white/60">{emotionalMessage}</p></div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white/10"><Bot size={28}/></span>
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-3">
          <Card><p className="text-xs font-bold text-ink/40">Comprometimento da renda</p><p className="mt-2 font-display text-4xl">{commitment.toFixed(0)}%</p><p className="mt-2 text-xs text-ink/45">{commitment > 80 ? "Ponto de atenção prioritário" : "Dentro de uma faixa administrável"}</p></Card>
          <Card><p className="text-xs font-bold text-ink/40">Economia potencial</p><p className="mt-2 font-display text-4xl text-forest">{money(potentialMonthlySaving)}<span className="text-sm">/mês</span></p><p className="mt-2 text-xs text-ink/45">reduzindo 10% dos gastos variáveis</p></Card>
          <Card><p className="text-xs font-bold text-ink/40">Saldo anual no plano</p><p className="mt-2 font-display text-4xl">{money(annual.planned.balance)}</p><p className="mt-2 text-xs text-ink/45">{money(annual.potentialSavings)} acima do cenário atual</p></Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-7">
            <div className="flex items-center gap-3"><AlertTriangle className="text-peach"/><h2 className="font-display text-3xl">Pontos de atenção</h2></div>
            <ul className="mt-6 grid gap-4 text-sm leading-6 text-ink/60">
              <li className="flex gap-3"><span>•</span><span>{commitment.toFixed(0)}% da renda já está comprometida antes de novas escolhas.</span></li>
              <li className="flex gap-3"><span>•</span><span>{profile.debtTotal > 0 ? `Há ${money(profile.debtTotal)} em dívidas, com ${money(profile.debtMonthlyPayments)} de parcelas mensais.` : "Você não informou dívidas ativas."}</span></li>
              <li className="flex gap-3"><span>•</span><span>{balance > 0 ? `${money(balance)} ficam livres por mês, mas precisam de destino para não virarem gasto invisível.` : `O mês fecha com déficit de ${money(Math.abs(balance))}.`}</span></li>
            </ul>
          </Card>
          <Card className="bg-mist p-7">
            <div className="flex items-center gap-3"><Lightbulb className="text-forest"/><h2 className="font-display text-3xl">Oportunidades</h2></div>
            <ul className="mt-6 grid gap-4 text-sm leading-6 text-ink/60">
              <li className="flex gap-3"><CheckCircle2 className="mt-1 shrink-0 text-forest" size={16}/><span>Uma redução de 10% nos gastos variáveis libera {money(potentialMonthlySaving)} por mês.</span></li>
              <li className="flex gap-3"><CheckCircle2 className="mt-1 shrink-0 text-forest" size={16}/><span>Sua meta de {money(profile.goalAmount)} pode ser alcançada em {formatDuration(goalMonths)}.</span></li>
              <li className="flex gap-3"><CheckCircle2 className="mt-1 shrink-0 text-forest" size={16}/><span>O cenário anual planejado melhora o saldo em {money(annual.potentialSavings)}.</span></li>
            </ul>
          </Card>
        </div>

        <Card className="p-7">
          <h2 className="font-display text-3xl">Próximos passos personalizados</h2>
          <div className="mt-6 grid gap-4">{steps.map(([number,title,text])=><div key={number} className="flex gap-5 rounded-2xl border border-ink/8 p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-light font-display text-xl">{number}</span><div><h3 className="font-display text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{text}</p></div></div>)}</div>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-7"><PiggyBank className="text-forest"/><p className="mt-5 text-xs font-bold text-ink/40">Meta principal</p><h3 className="mt-2 font-display text-3xl">{profile.mainGoal}</h3><p className="mt-3 text-sm text-ink/55">Estimativa: {formatDuration(goalMonths)} · {dateText(getEstimatedDate(goalMonths))}</p></Card>
          <Card className="p-7"><CalendarDays className="text-forest"/><p className="mt-5 text-xs font-bold text-ink/40">Quitação das dívidas</p><h3 className="mt-2 font-display text-3xl">{formatDuration(debtMonths)}</h3><p className="mt-3 text-sm text-ink/55">{debtMonths === 0 ? "Nenhuma dívida informada." : `Previsão: ${dateText(getEstimatedDate(debtMonths))}`}</p></Card>
        </div>

        <div className="rounded-[28px] border border-dashed border-forest/25 bg-mist/50 p-6 text-center"><ShieldCheck className="mx-auto text-forest"/><p className="mt-3 text-sm font-bold">As análises têm caráter exclusivamente educativo e informativo. Não constituem consultoria financeira, recomendação de investimento ou garantia de resultado. As decisões financeiras permanecem sob responsabilidade do usuário.</p><Link href="/onboarding" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-forest">Atualizar meus dados <ArrowRight size={16}/></Link></div>
      </div>
    </AppShell>
  );
}
