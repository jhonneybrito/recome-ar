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
const TRANSACTIONS_UPDATED_EVENT = "recomecar:transactions-updated";
const initialTransactions: FinancialTransaction[] = [];

export function notifyTransactionsUpdated() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(TRANSACTIONS_UPDATED_EVENT));
}

export function normalizeTransactionType(type: unknown): TransactionType {
  const value = String(type || "").trim().toLowerCase();
  if (["income", "receita", "entrada", "in", "credit", "credito", "crédito"].includes(value)) return "income";
  return "expense";
}

export function loadTransactions(): FinancialTransaction[] {
  if (typeof window === "undefined") return initialTransactions;
  if (isSupabaseConfigured) return initialTransactions;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as FinancialTransaction[] : initialTransactions;
    return parsed.map((transaction) => ({ ...transaction, type: normalizeTransactionType(transaction.type) }));
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
  notifyTransactionsUpdated();
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  const refreshRemote = useCallback(async () => {
    const remote = await getTransactionsDb();
    if (remote) {
      setTransactions(remote.map((transaction) => ({ ...transaction, type: normalizeTransactionType(transaction.type) })));
      setInitialized(true);
    }
    setReady(true);
    return remote;
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      setTransactions([]);
      setInitialized(false);
      refreshRemote().catch((error) => { console.error("[transactions] erro ao carregar movimentações", error); setReady(true); });
      const syncRemote = () => { refreshRemote().catch((error) => console.error("[transactions] erro ao recarregar movimentações", error)); };
      window.addEventListener(TRANSACTIONS_UPDATED_EVENT, syncRemote);
      return () => window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, syncRemote);
    }

    const sync = () => {
      setTransactions(loadTransactions());
      setInitialized(hasStoredTransactions());
      setReady(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(TRANSACTIONS_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, sync);
    };
  }, [refreshRemote]);

  const addTransaction = useCallback(async (transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    const normalized = { ...transaction, type: normalizeTransactionType(transaction.type) };
    if (isSupabaseConfigured) {
      await saveTransactionDb(normalized);
      console.info("[transactions] movimentação salva", { action: "create", type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
      await refreshRemote();
      notifyTransactionsUpdated();
      return;
    }
    const current = loadTransactions();
    console.info("[transactions] movimentação salva", { action: "create-local", type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
    const next = [{ ...normalized, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current];
    setTransactions(next);
    saveTransactions(next);
  }, [refreshRemote]);

  const removeTransaction = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      await deleteTransactionDb(id);
      console.info("[transactions] movimentação excluída", { id });
      await refreshRemote();
      notifyTransactionsUpdated();
      return;
    }
    console.info("[transactions] movimentação excluída", { action: "delete-local", id });
    const next = loadTransactions().filter((transaction) => transaction.id !== id);
    setTransactions(next);
    saveTransactions(next);
  }, [refreshRemote]);

  const updateTransaction = useCallback(async (id: string, transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    const normalized = { ...transaction, type: normalizeTransactionType(transaction.type) };
    if (isSupabaseConfigured) {
      await saveTransactionDb(normalized, id);
      console.info("[transactions] movimentação salva", { action: "update", id, type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
      await refreshRemote();
      notifyTransactionsUpdated();
      return;
    }
    console.info("[transactions] movimentação salva", { action: "update-local", id, type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
    const next = loadTransactions().map((item) => item.id === id ? { ...item, ...normalized } : item);
    setTransactions(next);
    saveTransactions(next);
  }, [refreshRemote]);

  return { transactions, addTransaction, updateTransaction, removeTransaction, initialized, ready, refreshTransactions: refreshRemote };
}
