"use client";

import { useCallback, useEffect, useState } from "react";

export interface DebtRecord {
  id: string;
  name: string;
  type: string;
  total: number;
  paid: number;
  monthlyPayment: number;
  interestRate: number;
  priorityType: "Maior juros" | "Maior impacto mensal" | "Menor dívida" | "Dívida emocional/urgente";
  urgencyReason: string;
  isCurrentPriority: boolean;
}

const KEY = "recomecar:debts:v1";

export function loadDebts(): DebtRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return items.map((item: Partial<DebtRecord>) => ({
      ...item,
      priorityType: item.priorityType || "Maior juros",
      urgencyReason: item.urgencyReason || "",
      isCurrentPriority: Boolean(item.isCurrentPriority),
    })) as DebtRecord[];
  } catch { return []; }
}

export function getPriorityDebt(items: DebtRecord[]) {
  if (!items.length) return null;
  const current = items.find((item) => item.isCurrentPriority);
  if (current) return current;
  const emotional = items.find((item) => item.priorityType === "Dívida emocional/urgente");
  if (emotional) return emotional;
  return [...items].sort((a, b) => {
    const remainingA = Math.max(0, a.total - a.paid);
    const remainingB = Math.max(0, b.total - b.paid);
    const score = (item: DebtRecord, remaining: number) => {
      if (item.priorityType === "Maior impacto mensal") return item.monthlyPayment;
      if (item.priorityType === "Menor dívida") return remaining > 0 ? 1 / remaining : Number.MAX_VALUE;
      return item.interestRate;
    };
    return score(b, remainingB) - score(a, remainingA);
  })[0];
}

export function hasStoredDebts() {
  return typeof window !== "undefined" && window.localStorage.getItem(KEY) !== null;
}

export const saveDebts = (items: DebtRecord[]) => {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("recomecar:debts-updated"));
};

export function useDebts() {
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      setDebts(loadDebts());
      setInitialized(hasStoredDebts());
      setReady(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("recomecar:debts-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("recomecar:debts-updated", sync);
    };
  }, []);
  const upsertDebt = useCallback((debt: Omit<DebtRecord,"id">, id?: string) => {
    const current = loadDebts();
    const normalized = debt.isCurrentPriority ? current.map((item)=>({...item,isCurrentPriority:false})) : current;
    const next = id ? normalized.map((item)=>item.id===id?{...debt,id}:item) : [{...debt,id:crypto.randomUUID()},...normalized];
    setDebts(next); saveDebts(next);
  },[]);
  const removeDebt = useCallback((id:string)=>{const next=loadDebts().filter((item)=>item.id!==id);setDebts(next);saveDebts(next)},[]);
  return { debts, upsertDebt, removeDebt, initialized, ready };
}
