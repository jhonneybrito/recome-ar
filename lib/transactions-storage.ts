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

let transactionsCache: FinancialTransaction[] = initialTransactions;
let initializedCache = false;
let readyCache = false;
let remoteRefreshPromise: Promise<FinancialTransaction[] | null> | null = null;
let refreshSequence = 0;
const subscribers = new Set<() => void>();

function emitTransactionsChanged() {
  subscribers.forEach((listener) => listener());
}

function setTransactionsCache(transactions: FinancialTransaction[], initialized = true) {
  transactionsCache = transactions.map(normalizeTransaction);
  initializedCache = initialized;
  readyCache = true;
  emitTransactionsChanged();
}

export function notifyTransactionsUpdated() {
  emitTransactionsChanged();
}

export function normalizeTransactionType(type: unknown): TransactionType {
  const value = String(type || "").trim().toLowerCase();
  if (["income", "receita", "entrada", "revenue", "in", "credit", "credito", "crédito"].includes(value)) return "income";
  if (["expense", "despesa", "saida", "saída", "out", "debit", "debito", "débito"].includes(value)) return "expense";
  return "expense";
}

export function normalizeTransaction(transaction: FinancialTransaction): FinancialTransaction {
  return {
    ...transaction,
    amount: Number(transaction.amount) || 0,
    type: normalizeTransactionType(transaction.type),
    date: transaction.date || new Date().toISOString().slice(0, 10),
  };
}

export function loadTransactions(): FinancialTransaction[] {
  if (typeof window === "undefined") return transactionsCache;
  if (isSupabaseConfigured) return transactionsCache;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as FinancialTransaction[]).map(normalizeTransaction) : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

export function hasStoredTransactions() {
  return typeof window !== "undefined" && !isSupabaseConfigured && window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveTransactions(transactions: FinancialTransaction[]) {
  if (typeof window === "undefined" || isSupabaseConfigured) return;
  const normalized = transactions.map(normalizeTransaction);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  setTransactionsCache(normalized, true);
}

async function refreshTransactionsFromRemote(force = false) {
  if (!isSupabaseConfigured) {
    const local = loadTransactions();
    setTransactionsCache(local, hasStoredTransactions());
    return local;
  }

  if (remoteRefreshPromise && !force) return remoteRefreshPromise;

  const requestId = ++refreshSequence;
  remoteRefreshPromise = getTransactionsDb()
    .then((remote) => {
      const normalized = (remote || []).map(normalizeTransaction);
      if (requestId === refreshSequence) {
        setTransactionsCache(normalized, true);
        console.info("[transactions] dados reais recarregados", { count: normalized.length });
      } else {
        console.info("[transactions] resposta antiga ignorada", { count: normalized.length });
      }
      return normalized;
    })
    .catch((error) => {
      readyCache = true;
      console.error("[transactions] erro ao recarregar movimentações", error);
      emitTransactionsChanged();
      return null;
    })
    .finally(() => {
      if (requestId === refreshSequence) remoteRefreshPromise = null;
    });

  return remoteRefreshPromise;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(transactionsCache);
  const [initialized, setInitialized] = useState(initializedCache);
  const [ready, setReady] = useState(readyCache);

  const syncFromCache = useCallback(() => {
    setTransactions(transactionsCache);
    setInitialized(initializedCache);
    setReady(readyCache);
  }, []);

  const refreshTransactions = useCallback(async () => {
    const refreshed = await refreshTransactionsFromRemote(true);
    syncFromCache();
    return refreshed;
  }, [syncFromCache]);

  useEffect(() => {
    subscribers.add(syncFromCache);
    syncFromCache();

    if (isSupabaseConfigured) {
      refreshTransactionsFromRemote();
      return () => {
        subscribers.delete(syncFromCache);
      };
    }

    const syncLocal = () => {
      setTransactionsCache(loadTransactions(), hasStoredTransactions());
    };
    syncLocal();
    window.addEventListener("storage", syncLocal);
    return () => {
      subscribers.delete(syncFromCache);
      window.removeEventListener("storage", syncLocal);
    };
  }, [syncFromCache]);

  const addTransaction = useCallback(async (transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    const normalized = { ...transaction, type: normalizeTransactionType(transaction.type), amount: Number(transaction.amount) || 0 };
    if (isSupabaseConfigured) {
      await saveTransactionDb(normalized);
      console.info("[transactions] movimentação salva", { action: "create", type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
      await refreshTransactionsFromRemote(true);
      return;
    }
    const current = loadTransactions();
    const next = [{ ...normalized, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current];
    console.info("[transactions] movimentação salva", { action: "create-local", type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
    saveTransactions(next);
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      await deleteTransactionDb(id);
      console.info("[transactions] movimentação excluída", { id });
      await refreshTransactionsFromRemote(true);
      return;
    }
    const next = loadTransactions().filter((transaction) => transaction.id !== id);
    console.info("[transactions] movimentação excluída", { action: "delete-local", id });
    saveTransactions(next);
  }, []);

  const updateTransaction = useCallback(async (id: string, transaction: Omit<FinancialTransaction, "id" | "createdAt">) => {
    const normalized = { ...transaction, type: normalizeTransactionType(transaction.type), amount: Number(transaction.amount) || 0 };
    if (isSupabaseConfigured) {
      await saveTransactionDb(normalized, id);
      console.info("[transactions] movimentação salva", { action: "update", id, type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
      await refreshTransactionsFromRemote(true);
      return;
    }
    const next = loadTransactions().map((item) => item.id === id ? { ...item, ...normalized } : item);
    console.info("[transactions] movimentação salva", { action: "update-local", id, type: normalized.type, amount: normalized.amount, date: normalized.date, category: normalized.category });
    saveTransactions(next);
  }, []);

  return { transactions, addTransaction, updateTransaction, removeTransaction, initialized, ready, refreshTransactions };
}
