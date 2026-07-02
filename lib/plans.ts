"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { claimPurchaseAccessDb } from "./db";

export type PlanId = "free" | "premium_monthly" | "premium_annual";
export const FREE_LIMITS = { transactionsPerMonth: 20, goals: 3, debts: 3, couplePlans: 1 };

export function useUserPlan() {
  const [plan, setPlan] = useState<PlanId>("free");
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      await claimPurchaseAccessDb();
      const { data: profile } = await supabase.from("profiles").select("plan").eq("user_id", data.user.id).maybeSingle();
      if (profile?.plan) setPlan(profile.plan as PlanId);
    }).catch(console.error);
  }, []);
  return { plan, isPremium: plan !== "free" };
}
