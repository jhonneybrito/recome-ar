"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteTransactionDb, getTransactionsDb, saveTransactionDb } from "./db";
import { isSupabaseConfigured } from "./supabase/config";

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
  if (isSupabaseConfigured) return initialTransactions;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

export function hasStoredTransactions() {
  return typeof window !== "undefined" && !isSupabaseConfigured && window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveTransactions(transactions: FinancialTransaction[]) {
  if (typeof window === "undefined" || isSupabaseConfigured) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  window.dispatchEvent(new Event("recomecar:transactions-updated"));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      setTransactions([]);
      setInitialized(false);
      getTransactionsDb()
        .then((remote) => {
          setTransactions(remote || []);
          setInitialized(true);
          setReady(true);
        })
        .catch((error) => { console.error(error); setReady(true); });
      return;
    }

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

  const refreshRemote = useCallback(async () => {
    const remote = await getTransactionsDb();
    if (remote) { setTransactions(remote); setInitialized(true); }
    return remote;
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    if (isSupabaseConfigured) { await saveTransactionDb(transaction); await refreshRemote(); return; }
    const current = loadTransactions();
    const next = [{ ...transaction, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current];
    setTransactions(next);
    saveTransactions(next);
  }, [refreshRemote]);

  const removeTransaction = useCallback(async (id: string) => {
    if (isSupabaseConfigured) { await deleteTransactionDb(id); await refreshRemote(); return; }
    const next = loadTransactions().filter((transaction) => transaction.id !== id);
    setTransactions(next);
    saveTransactions(next);
  }, [refreshRemote]);

  const updateTransaction = useCallback(async (id: string, transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    if (isSupabaseConfigured) { await saveTransactionDb(transaction, id); await refreshRemote(); return; }
    const next = loadTransactions().map((item) => item.id === id ? { ...item, ...transaction } : item);
    setTransactions(next);
    saveTransactions(next);
  }, [refreshRemote]);

  return { transactions, addTransaction, updateTransaction, removeTransaction, initialized, ready };
}
