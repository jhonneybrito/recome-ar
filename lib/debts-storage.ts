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
}

const KEY = "recomecar:debts:v1";

export function loadDebts(): DebtRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
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
    const next = id ? current.map((item)=>item.id===id?{...debt,id}:item) : [{...debt,id:crypto.randomUUID()},...current];
    setDebts(next); saveDebts(next);
  },[]);
  const removeDebt = useCallback((id:string)=>{const next=loadDebts().filter((item)=>item.id!==id);setDebts(next);saveDebts(next)},[]);
  return { debts, upsertDebt, removeDebt, initialized, ready };
}
