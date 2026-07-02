import type { DebtRecord } from "./debts-storage";
import type { FinancialProfile } from "./financial-calculations";
import type { FinancialTransaction, TransactionType } from "./transactions-storage";

export type FinancialTotals = {
  monthKey: string;
  transactions: FinancialTransaction[];
  incomes: FinancialTransaction[];
  expenses: FinancialTransaction[];
  income: number;
  expensesTotal: number;
  debtPayments: number;
  debtTotal: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
};

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function normalizeTransactionTypeForTotals(type: unknown): TransactionType {
  const value = String(type || "").trim().toLowerCase();
  if (["income", "receita", "entrada", "revenue", "in", "credit", "credito", "crédito"].includes(value)) return "income";
  return "expense";
}

export function normalizeTransactionForTotals(transaction: FinancialTransaction): FinancialTransaction {
  return {
    ...transaction,
    amount: Number(transaction.amount) || 0,
    type: normalizeTransactionTypeForTotals(transaction.type),
    date: transaction.date || new Date().toISOString().slice(0, 10),
  };
}

export function calculateFinancialTotals(params: {
  transactions: FinancialTransaction[];
  debts?: DebtRecord[];
  profile?: FinancialProfile;
  monthKey?: string;
  useProfileFallback?: boolean;
}): FinancialTotals {
  const monthKey = params.monthKey || getCurrentMonthKey();
  const normalizedTransactions = params.transactions.map(normalizeTransactionForTotals);
  const monthTransactions = normalizedTransactions.filter((item) => String(item.date || "").slice(0, 7) === monthKey);
  const incomes = monthTransactions.filter((item) => item.type === "income");
  const expenses = monthTransactions.filter((item) => item.type === "expense");
  const incomeFromTransactions = incomes.reduce((sum, item) => sum + item.amount, 0);
  const expensesFromTransactions = expenses.reduce((sum, item) => sum + item.amount, 0);
  const profile = params.profile;
  const shouldUseFallback = Boolean(params.useProfileFallback && profile && normalizedTransactions.length === 0);
  const income = shouldUseFallback ? Math.max(0, profile!.monthlyIncome) + Math.max(0, profile!.otherIncome) : incomeFromTransactions;
  const expensesTotal = shouldUseFallback ? Math.max(0, profile!.fixedExpenses) + Math.max(0, profile!.variableExpenses) : expensesFromTransactions;
  const debtPayments = params.debts
    ? params.debts.reduce((sum, item) => sum + Number(item.monthlyPayment || 0), 0)
    : Math.max(0, profile?.debtMonthlyPayments || 0);
  const debtTotal = params.debts
    ? params.debts.reduce((sum, item) => sum + Math.max(0, Number(item.total || 0) - Number(item.paid || 0)), 0)
    : Math.max(0, profile?.debtTotal || 0);

  return {
    monthKey,
    transactions: monthTransactions,
    incomes,
    expenses,
    income,
    expensesTotal,
    debtPayments,
    debtTotal,
    balance: income - expensesTotal - debtPayments,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
  };
}

export function logFinancialTotalsDebug(context: string, totals: FinancialTotals) {
  if (typeof window === "undefined") return;
  console.info(`[financial-totals:${context}] dados carregados`, {
    monthKey: totals.monthKey,
    transactions: totals.transactions.length,
    incomeCount: totals.incomeCount,
    expenseCount: totals.expenseCount,
    income: totals.income,
    expenses: totals.expensesTotal,
    debtPayments: totals.debtPayments,
    debtTotal: totals.debtTotal,
    balance: totals.balance,
  });
}
