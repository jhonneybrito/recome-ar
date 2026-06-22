"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import AppShell from "./app-shell";
import { Card, Pill } from "./ui";
import { useFinancialProfile } from "@/lib/financial-storage";
import { useTransactions } from "@/lib/transactions-storage";
import { useDebts } from "@/lib/debts-storage";
import { useGoals } from "@/lib/goals-storage";
import {
  calculateAnnualProjection,
  calculateFinancialHealth,
  calculateIncomeCommitment,
  estimateDebtPayoffTime,
  estimateGoalTime,
  formatDuration,
} from "@/lib/financial-calculations";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FinancialReport() {
  const { profile } = useFinancialProfile();
  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const { goals } = useGoals();
  const month = new Date().toISOString().slice(0, 7);
  const items = transactions.filter((transaction) => transaction.date.startsWith(month));
  const incomeItems = items.filter((transaction) => transaction.type === "income");
  const expenseItems = items.filter((transaction) => transaction.type === "expense");
  const income = incomeItems.length
    ? incomeItems.reduce((sum, transaction) => sum + transaction.amount, 0)
    : profile.monthlyIncome + profile.otherIncome;
  const expenses = expenseItems.length
    ? expenseItems.reduce((sum, transaction) => sum + transaction.amount, 0)
    : profile.fixedExpenses + profile.variableExpenses;
  const hasIncompleteMonth = incomeItems.length === 0 || expenseItems.length === 0;
  const debtTotal = debts.reduce((sum, debt) => sum + Math.max(0, debt.total - debt.paid), 0);
  const payments = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const data = {
    ...profile,
    monthlyIncome: income,
    otherIncome: 0,
    fixedExpenses: 0,
    variableExpenses: expenses,
    debtTotal,
    debtMonthlyPayments: payments,
  };
  const balance = income - expenses - payments;
  const health = calculateFinancialHealth(data);
  const commitment = calculateIncomeCommitment(data);
  const annual = calculateAnnualProjection(data);
  const goal = goals[0];
  const goalMonths = goal
    ? estimateGoalTime(goal.target, goal.current, goal.monthlyContribution)
    : null;
  const debtMonths = estimateDebtPayoffTime(debtTotal, payments + Math.max(0, balance * 0.3));

  const nextSteps = [
    balance < 0
      ? "Escolher uma despesa possível de revisar, sem tentar mudar tudo de uma vez."
      : "Separar uma parte do saldo antes de assumir novos gastos.",
    debtTotal > 0
      ? "Olhar primeiro para a dívida com maior taxa, preservando o essencial."
      : "Manter espaço no orçamento para evitar novas dívidas.",
    goal
      ? "Criar um lembrete gentil para a contribuição mensal da meta."
      : "Cadastrar uma primeira meta pequena e significativa.",
  ];

  return (
    <AppShell
      title="Relatório Financeiro Real"
      subtitle="Uma leitura acolhedora dos seus registros, compromissos e objetivos."
    >
      <div className="mx-auto grid max-w-6xl gap-5">
        {hasIncompleteMonth && (
          <div className="rounded-2xl border border-sage/35 bg-mist/70 p-4 text-sm text-forest">
            Ainda faltam alguns registros deste mês. Para não deixar sua visão vazia, usamos os
            valores do seu planejamento inicial onde necessário.
          </div>
        )}

        <Card className="bg-forest p-8 text-white">
          <Pill tone={health.color}>
            <Sparkles size={13} className="mr-1" />
            Saúde {health.label}
          </Pill>
          <h2 className="mt-5 font-display text-5xl">
            {balance >= 0
              ? "Seu mês tem espaço para escolhas."
              : "Seu mês pede um pouco mais de cuidado."}
          </h2>
          <p className="mt-4 max-w-3xl text-white/60">{health.message}</p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-ink/40">Saldo mensal</p>
            <p className="mt-2 font-display text-4xl">{money(balance)}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink/40">Comprometimento</p>
            <p className="mt-2 font-display text-4xl">{commitment.toFixed(0)}%</p>
          </Card>
          <Card>
            <p className="text-xs text-ink/40">Saldo anual projetado</p>
            <p className="mt-2 font-display text-4xl">{money(annual.current.balance)}</p>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-7">
            <h2 className="font-display text-3xl">Dados considerados</h2>
            <ul className="mt-5 grid gap-3 text-sm text-ink/60">
              <li>Receitas do mês: <b>{money(income)}</b></li>
              <li>Despesas do mês: <b>{money(expenses)}</b></li>
              <li>Dívidas em aberto: <b>{money(debtTotal)}</b></li>
              <li>Parcelas mensais: <b>{money(payments)}</b></li>
            </ul>
          </Card>
          <Card className="bg-mist p-7">
            <h2 className="font-display text-3xl">Previsões</h2>
            <ul className="mt-5 grid gap-3 text-sm text-ink/60">
              <li>Quitação das dívidas: <b>{formatDuration(debtMonths)}</b></li>
              <li>
                {goal
                  ? <>Meta “{goal.name}”: <b>{formatDuration(goalMonths)}</b></>
                  : "Cadastre uma meta para gerar sua previsão."}
              </li>
              <li>Patrimônio atual: <b>{money(profile.accumulatedNetWorth)}</b></li>
            </ul>
          </Card>
        </div>

        <Card className="p-7">
          <h2 className="font-display text-3xl">Próximos passos</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {nextSteps.map((text, index) => (
              <div key={text} className="rounded-2xl bg-cream p-5">
                <b className="font-display text-2xl text-peach">0{index + 1}</b>
                <p className="mt-3 text-sm leading-6 text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="rounded-[28px] border border-dashed border-forest/25 bg-mist/50 p-6 text-center">
          <ShieldCheck className="mx-auto text-forest" />
          <p className="mt-3 text-sm font-bold">
            Análises educativas e informativas. Você decide o que faz sentido para sua realidade.
          </p>
          <Link
            href="/transactions"
            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-forest"
          >
            Atualizar movimentações <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
