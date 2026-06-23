"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bot, CalendarClock, Flag, HeartPulse, Landmark, Trophy, Wallet } from "lucide-react";
import AppShell from "@/components/app-shell";
import { Card, Pill, ProgressBar } from "@/components/ui";
import {
  calculateAnnualProjection, calculateDebtMonthlyPayments, calculateDebtTotal,
  calculateFinancialHealth, calculateFutureSavings, calculateIncomeCommitment,
  calculateMonthlyBalance, calculateMonthlyExpenses, calculateTotalIncome,
  estimateDebtPayoffTime, estimateGoalTime, formatDuration, getEstimatedDate,
} from "@/lib/financial-calculations";
import { useFinancialProfile } from "@/lib/financial-storage";
import GamificationSummary from "@/components/gamification-summary";
import { useGamification } from "@/lib/gamification-storage";
import { useTransactions } from "@/lib/transactions-storage";
import { useDebts } from "@/lib/debts-storage";
import { useGoals } from "@/lib/goals-storage";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const monthYear = (date: Date | null) => date ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date) : "depende de criar saldo mensal";

export default function Dashboard() {
  const { profile } = useFinancialProfile();
  const { state: gamification } = useGamification();
  const { transactions, initialized: transactionsInitialized } = useTransactions();
  const { debts, initialized: debtsInitialized } = useDebts();
  const { goals, initialized: goalsInitialized } = useGoals();
  const currentMonth = new Date().toISOString().slice(0,7);
  const monthTransactions = transactions.filter((item)=>item.date.startsWith(currentMonth));
  const monthIncomes = monthTransactions.filter((item)=>item.type==="income");
  const monthExpenses = monthTransactions.filter((item)=>item.type==="expense");
  const income = transactionsInitialized ? monthIncomes.reduce((sum,item)=>sum+item.amount,0) : calculateTotalIncome(profile);
  const expenses = transactionsInitialized ? monthExpenses.reduce((sum,item)=>sum+item.amount,0) : calculateMonthlyExpenses(profile);
  const payments = debtsInitialized ? debts.reduce((sum,item)=>sum+item.monthlyPayment,0) : calculateDebtMonthlyPayments(profile);
  const debt = debtsInitialized ? debts.reduce((sum,item)=>sum+Math.max(0,item.total-item.paid),0) : calculateDebtTotal(profile);
  const balance = income - expenses - payments;
  const derivedProfile = { ...profile, monthlyIncome: income, otherIncome: 0, fixedExpenses: 0, variableExpenses: expenses, debtTotal: debt, debtMonthlyPayments: payments };
  const commitment = calculateIncomeCommitment(derivedProfile);
  const health = calculateFinancialHealth(derivedProfile);
  const goalContribution = Math.max(0, balance * 0.7);
  const primaryGoal = goalsInitialized ? goals[0] : undefined;
  const goalTarget = goalsInitialized ? primaryGoal?.target ?? 0 : profile.goalAmount;
  const goalCurrent = goalsInitialized ? primaryGoal?.current ?? 0 : profile.currentSavings;
  const goalTitle = goalsInitialized ? primaryGoal?.name ?? "Defina sua próxima meta" : profile.mainGoal;
  const goalMonths = estimateGoalTime(goalTarget, goalCurrent, primaryGoal?.monthlyContribution || goalContribution);
  const payoffMonths = estimateDebtPayoffTime(debt, payments + Math.max(0, balance * 0.3));
  const annual = calculateAnnualProjection(derivedProfile);

  const future = [1, 3, 5].map((years) => ({
    years,
    value: calculateFutureSavings(goalCurrent, goalContribution, years),
  }));

  return (
    <AppShell title={`Olá, ${profile.name || "por aqui"}`} subtitle="Os indicadores combinam seu planejamento com os registros financeiros do mês.">
      <div className="grid gap-5">
        {transactionsInitialized && (!monthIncomes.length || !monthExpenses.length) && <div className="rounded-2xl border border-sage/30 bg-mist px-5 py-4 text-sm leading-6 text-ink/60"><b className="text-forest">Seu retrato ainda está sendo construído.</b> {!monthIncomes.length && "Cadastre ao menos uma receita do mês. "}{!monthExpenses.length && "Cadastre suas despesas à medida que acontecerem. "}Os indicadores mostram somente as movimentações realmente cadastradas.</div>}
        {!transactionsInitialized && <div className="rounded-2xl border border-sage/30 bg-mist px-5 py-4 text-sm leading-6 text-ink/60"><b className="text-forest">Visão inicial do onboarding.</b> Cadastre sua primeira movimentação para o painel passar a usar exclusivamente seu histórico real.</div>}
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {[
            ["Saldo mensal", money(balance), Wallet, balance >= 0 ? "Espaço disponível no mês" : "Valor a reorganizar com calma", balance >= 0 ? "green" : "peach"],
            ["Receita mensal", money(income), ArrowUpRight, transactionsInitialized ? `${monthIncomes.length} registros no mês` : "Valor do onboarding", "green"],
            ["Despesas mensais", money(expenses), ArrowDownRight, `${income ? Math.round(expenses / income * 100) : 0}% da renda`, "peach"],
            ["Patrimônio acumulado", money(profile.accumulatedNetWorth), Landmark, profile.netWorthGoal > 0 ? `${Math.min(100,profile.accumulatedNetWorth/profile.netWorthGoal*100).toFixed(0)}% da meta patrimonial` : "Atualize sua meta", "green"],
          ].map(([label,value,Icon,note,tone]) => { const I=Icon as typeof Wallet; return <Card key={String(label)}><div className="flex items-center justify-between gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone==="peach"?"bg-peach/20 text-[#9a532f]":"bg-mist text-forest"}`}><I size={18}/></span><span className="text-right text-[11px] font-bold text-ink/45">{String(note)}</span></div><p className="mt-5 text-xs font-bold text-ink/40">{String(label)}</p><p className="mt-1 font-display text-2xl">{String(value)}</p></Card>})}
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl">Evolução das metas principais</h2><p className="mt-1 text-xs text-ink/40">Uma visão rápida do que está avançando agora</p></div><Link href="/goals" className="flex items-center gap-1 text-xs font-extrabold text-forest">Ver detalhes <ArrowRight size={14}/></Link></div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { title: goalTitle, current: goalCurrent, target: goalTarget, progress: goalTarget > 0 ? goalCurrent / goalTarget * 100 : 100, note: `${money(goalCurrent)} de ${money(goalTarget)}`, icon: Flag, color: "bg-forest" },
                  { title: "Quitar dívidas", current: Math.max(0, debt - payments), target: debt || 1, progress: debt > 0 ? Math.min(100, payments / debt * 100) : 100, note: debt > 0 ? `${money(debt)} em aberto` : "Nenhuma dívida cadastrada", icon: Landmark, color: "bg-peach" },
                  { title: "Missões da semana", current: gamification.missions.filter((mission) => mission.completed).length, target: gamification.missions.length, progress: gamification.missions.filter((mission) => mission.completed).length / gamification.missions.length * 100, note: `${gamification.missions.filter((mission) => mission.completed).length} de ${gamification.missions.length} concluídas`, icon: Trophy, color: "bg-light" },
                ].map((goal) => {
                  const Icon = goal.icon;
                  return <div key={goal.title} className="rounded-[22px] border border-ink/8 bg-cream/60 p-5"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${goal.color} ${goal.color === "bg-forest" ? "text-white" : "text-ink"}`}><Icon size={18}/></span><b className="text-sm text-forest">{Math.min(100,goal.progress).toFixed(0)}%</b></div><h3 className="mt-5 font-display text-xl">{goal.title}</h3><p className="mb-3 mt-1 text-xs text-ink/45">{goal.note}</p><ProgressBar value={goal.progress} color={goal.color}/></div>;
                })}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between"><div><h2 className="font-display text-2xl">Projeção anual</h2><p className="mt-1 text-xs text-ink/40">Situação atual versus redução de 10% nos gastos variáveis</p></div><Pill tone={annual.planned.balance > annual.current.balance ? "green" : "neutral"}>+ {money(annual.potentialSavings)}</Pill></div>
              <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="text-left text-xs text-ink/40"><tr><th className="pb-3">Em 12 meses</th><th>Atual</th><th>Plano de Recomeço</th></tr></thead><tbody className="divide-y divide-ink/5">{[["Receitas",annual.current.income,annual.planned.income],["Despesas",annual.current.expenses,annual.planned.expenses],["Parcelas",annual.current.debtPayments,annual.planned.debtPayments],["Saldo anual",annual.current.balance,annual.planned.balance]].map(([label,current,planned])=><tr key={String(label)}><td className="py-4 font-bold">{String(label)}</td><td>{money(Number(current))}</td><td className="font-extrabold text-forest">{money(Number(planned))}</td></tr>)}</tbody></table></div>
            </Card>

            <div className="grid gap-5 md:grid-cols-3">
              {future.map(({years,value})=><Card key={years} className={years===3?"bg-light":""}><p className="text-xs font-bold uppercase tracking-wider text-ink/40">Em {years} {years===1?"ano":"anos"}</p><p className="mt-3 font-display text-3xl">{money(value)}</p><p className="mt-2 text-xs leading-5 text-ink/45">mantendo {money(goalContribution)} por mês, com projeção conservadora.</p></Card>)}
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <GamificationSummary />
            <Card className="bg-forest p-6 text-white">
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><HeartPulse/></span><Pill tone={health.color}>{health.score}/100</Pill></div>
              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-white/45">Saúde financeira</p><h2 className="mt-2 font-display text-4xl">{health.label}</h2><p className="mt-3 text-sm leading-6 text-white/60">{health.message}</p>
              <div className="mt-5"><ProgressBar value={health.score} color="bg-light"/></div>
              <p className="mt-4 text-xs text-white/45">{commitment.toFixed(0)}% da renda está comprometida.</p>
            </Card>

            <Card>
              <CalendarClock className="text-forest"/>
              <h2 className="mt-5 font-display text-2xl">Prazos reais</h2>
              <div className="mt-5 grid gap-5">
                <div><p className="text-xs font-bold text-ink/40">Quitar dívidas</p><b className="mt-1 block">{formatDuration(payoffMonths)}</b><p className="mt-1 text-xs text-ink/45">{monthYear(getEstimatedDate(payoffMonths))}</p></div>
                <div><p className="text-xs font-bold text-ink/40">Atingir {money(goalTarget)}</p><b className="mt-1 block">{formatDuration(goalMonths)}</b><p className="mt-1 text-xs text-ink/45">{monthYear(getEstimatedDate(goalMonths))}</p></div>
              </div>
            </Card>

            <Card className="bg-mist">
              <Bot className="text-forest"/>
              <h2 className="mt-5 font-display text-2xl">Seu próximo movimento</h2>
              <p className="mt-3 text-sm leading-6 text-ink/55">{balance > 0 ? `Você pode direcionar até ${money(goalContribution)} para “${goalTitle}” e preservar o restante como margem de tranquilidade.` : "Seu primeiro movimento pode ser apenas observar e escolher um gasto para revisar. Não é preciso resolver tudo de uma vez."}</p>
              <Link href="/ai-plan" className="mt-5 flex items-center gap-2 text-sm font-extrabold text-forest">Ver relatório completo <ArrowRight size={16}/></Link>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
