"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultFinancialProfile, type FinancialProfile } from "./financial-calculations";
import { hasStoredTransactions, saveTransactions, type FinancialTransaction } from "./transactions-storage";
import { hasStoredDebts, saveDebts } from "./debts-storage";
import { hasStoredGoals, saveGoals } from "./goals-storage";
import { getProfileDb, saveProfileDb } from "./db";

const STORAGE_KEY = "recomecar:financial-profile:v1";

export function loadFinancialProfile(): FinancialProfile {
  if (typeof window === "undefined") return defaultFinancialProfile;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultFinancialProfile, ...JSON.parse(stored) } : defaultFinancialProfile;
  } catch {
    return defaultFinancialProfile;
  }
}

export function saveFinancialProfile(profile: FinancialProfile) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("recomecar:profile-updated"));
  }
}

export function migrateProfileToRecords(profile: FinancialProfile) {
  if (typeof window === "undefined") return;
  const hasFinancialData = [
    profile.monthlyIncome,
    profile.otherIncome,
    profile.fixedExpenses,
    profile.variableExpenses,
    profile.debtTotal,
    profile.goalAmount,
    profile.currentSavings,
  ].some((value) => value > 0);
  if (!hasFinancialData) return;

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const createdAt = now.toISOString();

  if (!hasStoredTransactions()) {
    const transactions: FinancialTransaction[] = [];
    if (profile.monthlyIncome > 0) transactions.push({ id: crypto.randomUUID(), description: "Renda mensal informada no onboarding", amount: profile.monthlyIncome, type: "income", category: "Salário", date, createdAt });
    if (profile.otherIncome > 0) transactions.push({ id: crypto.randomUUID(), description: "Outras rendas informadas no onboarding", amount: profile.otherIncome, type: "income", category: "Outras receitas", date, createdAt });
    if (profile.fixedExpenses > 0) transactions.push({ id: crypto.randomUUID(), description: "Gastos fixos informados no onboarding", amount: profile.fixedExpenses, type: "expense", category: "Contas da casa", date, createdAt });
    if (profile.variableExpenses > 0) transactions.push({ id: crypto.randomUUID(), description: "Gastos variáveis informados no onboarding", amount: profile.variableExpenses, type: "expense", category: "Outras despesas", date, createdAt });
    saveTransactions(transactions);
  }

  if (!hasStoredDebts()) {
    saveDebts(profile.debtTotal > 0 ? [{ id: crypto.randomUUID(), name: profile.debtType || "Dívida inicial", type: profile.debtType || "Outro", total: profile.debtTotal, paid: 0, monthlyPayment: profile.debtMonthlyPayments, interestRate: 0, priorityType: "Maior juros", urgencyReason: "", isCurrentPriority: false }] : []);
  }

  if (!hasStoredGoals()) {
    saveGoals(profile.goalAmount > 0 ? [{ id: crypto.randomUUID(), name: profile.mainGoal, category: "Objetivo principal", target: profile.goalAmount, current: profile.currentSavings, monthlyContribution: 0, targetDate: "" }] : []);
  }
}

export function useFinancialProfile() {
  const [profile, setProfile] = useState<FinancialProfile>(defaultFinancialProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const storedProfile = loadFinancialProfile();
      setProfile(storedProfile);
      migrateProfileToRecords(storedProfile);
    };
    sync();
    getProfileDb().then((remote) => {
      if (remote) {
        const next = { ...loadFinancialProfile(), ...remote };
        setProfile(next);
        saveFinancialProfile(next);
      }
    }).catch(console.error);
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener("recomecar:profile-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("recomecar:profile-updated", sync);
    };
  }, []);

  const updateProfile = useCallback((next: FinancialProfile) => {
    setProfile(next);
    saveFinancialProfile(next);
    saveProfileDb(next).catch(console.error);
  }, []);

  return { profile, updateProfile, ready };
}
