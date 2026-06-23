"use client";

import { useCallback, useEffect, useState } from "react";

export type TransactionType = "income" | "expense";

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
}

export const incomeCategories = ["Salário", "Renda extra", "Freelance", "Investimentos", "Benefícios", "Venda", "Reembolso", "Outras receitas"];
export const expenseCategories = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Contas da casa", "Lazer", "Compras", "Dívidas e parcelas", "Assinaturas", "Impostos", "Cuidados pessoais", "Filhos e família", "Pets", "Viagens", "Doações", "Outras despesas"];

const STORAGE_KEY = "recomecar:transactions:v1";

const initialTransactions: FinancialTransaction[] = [];

export function loadTransactions(): FinancialTransaction[] {
  if (typeof window === "undefined") return initialTransactions;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

export function hasStoredTransactions() {
  return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveTransactions(transactions: FinancialTransaction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  window.dispatchEvent(new Event("recomecar:transactions-updated"));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setTransactions(loadTransactions());
      setInitialized(hasStoredTransactions());
      setReady(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("recomecar:transactions-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("recomecar:transactions-updated", sync);
    };
  }, []);

  const addTransaction = useCallback((transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    const current = loadTransactions();
    const next = [{ ...transaction, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current];
    setTransactions(next);
    saveTransactions(next);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    const next = loadTransactions().filter((transaction) => transaction.id !== id);
    setTransactions(next);
    saveTransactions(next);
  }, []);

  const updateTransaction = useCallback((id: string, transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    const next = loadTransactions().map((item) => item.id === id ? { ...item, ...transaction } : item);
    setTransactions(next);
    saveTransactions(next);
  }, []);

  return { transactions, addTransaction, updateTransaction, removeTransaction, initialized, ready };
}
