"use client";

import { createClient } from "./supabase/client";
import type { FinancialTransaction } from "./transactions-storage";
import type { DebtRecord } from "./debts-storage";
import type { GoalRecord } from "./goals-storage";
import type { FinancialProfile } from "./financial-calculations";

function normalizeTransactionTypeDb(type: unknown) {
  const value = String(type || "").trim().toLowerCase();
  if (["income", "receita", "entrada", "revenue", "in", "credit", "credito", "crédito"].includes(value)) return "income";
  if (["expense", "despesa", "saida", "saída", "out", "debit", "debito", "débito"].includes(value)) return "expense";
  return "expense";
}

async function clientWithUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

export async function ensureProfileDb(name?: string) {
  const context = await clientWithUser();
  if (!context) return null;

  const safeName = name || context.user.user_metadata?.name || context.user.email?.split("@")[0] || "Você";
  const safeEmail = context.user.email || "";
  const updatedAt = new Date().toISOString();
  const payload = {
    user_id: context.user.id,
    name: safeName,
    email: safeEmail,
    updated_at: updatedAt,
  };

  const { error } = await context.supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("[profiles] erro ao criar/atualizar profile; login não será bloqueado", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId: context.user.id,
    });
    return false;
  }

  await claimPurchaseAccessDb();
  return true;
}


export async function claimPurchaseAccessDb() {
  const context = await clientWithUser();
  if (!context) return false;
  const { data, error } = await context.supabase.rpc("claim_purchase_access");
  if (error) {
    console.warn("Não foi possível verificar acesso por compra:", error.message);
    return false;
  }
  return Boolean(data);
}

export async function getTransactionsDb() {
  const context = await clientWithUser();
  if (!context) return null;
  const { data, error } = await context.supabase
    .from("transactions")
    .select("*")
    .eq("user_id", context.user.id)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ id: row.id, description: row.name, amount: Number(row.amount), type: normalizeTransactionTypeDb(row.type), category: row.category || "", date: row.date, createdAt: row.created_at })) as FinancialTransaction[];
}

export async function saveTransactionDb(item: Omit<FinancialTransaction, "id" | "createdAt">, id?: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const payload = { user_id: context.user.id, month_key: item.date.slice(0, 7), type: item.type, name: item.description, amount: item.amount, category: item.category, date: item.date, status: "realized", updated_at: new Date().toISOString() };
  const query = id
    ? context.supabase.from("transactions").update(payload).eq("id", id).eq("user_id", context.user.id)
    : context.supabase.from("transactions").insert(payload);
  const { error } = await query;
  if (error) throw error;
  return true;
}

export async function deleteTransactionDb(id: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const { error } = await context.supabase.from("transactions").delete().eq("id", id).eq("user_id", context.user.id);
  if (error) throw error;
  return true;
}

export async function getDebtsDb() {
  const context = await clientWithUser();
  if (!context) return null;
  const { data, error } = await context.supabase
    .from("debts")
    .select("*")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ id: row.id, name: row.name, type: row.debt_type || "Outro", total: Number(row.total_amount), paid: Number(row.paid_amount), monthlyPayment: Number(row.monthly_payment), interestRate: Number(row.interest_rate || 0), priorityType: row.priority_type || "Maior juros", urgencyReason: row.urgency_reason || "", isCurrentPriority: Boolean(row.is_current_priority) })) as DebtRecord[];
}

export async function saveDebtDb(item: Omit<DebtRecord, "id">, id?: string) {
  const context = await clientWithUser();
  if (!context) return null;
  if (item.isCurrentPriority) await context.supabase.from("debts").update({ is_current_priority: false, updated_at: new Date().toISOString() }).eq("user_id", context.user.id);
  const payload = { user_id: context.user.id, name: item.name, debt_type: item.type, total_amount: item.total, paid_amount: item.paid, monthly_payment: item.monthlyPayment, interest_rate: item.interestRate, priority_type: item.priorityType, urgency_reason: item.urgencyReason, is_current_priority: item.isCurrentPriority, updated_at: new Date().toISOString() };
  const query = id
    ? context.supabase.from("debts").update(payload).eq("id", id).eq("user_id", context.user.id)
    : context.supabase.from("debts").insert(payload);
  const { error } = await query;
  if (error) throw error;
  return true;
}

export async function deleteDebtDb(id: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const { error } = await context.supabase.from("debts").delete().eq("id", id).eq("user_id", context.user.id);
  if (error) throw error;
  return true;
}

export async function getGoalsDb() {
  const context = await clientWithUser();
  if (!context) return null;
  const { data, error } = await context.supabase
    .from("goals")
    .select("*")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ id: row.id, name: row.name, category: row.goal_type || "Outro", target: Number(row.target_amount), current: Number(row.current_amount), monthlyContribution: Number(row.monthly_required || 0), targetDate: row.deadline || "" })) as GoalRecord[];
}

export async function saveGoalDb(item: Omit<GoalRecord, "id">, id?: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const payload = { user_id: context.user.id, name: item.name, goal_type: item.category, target_amount: item.target, current_amount: item.current, deadline: item.targetDate || null, monthly_required: item.monthlyContribution, updated_at: new Date().toISOString() };
  const query = id
    ? context.supabase.from("goals").update(payload).eq("id", id).eq("user_id", context.user.id)
    : context.supabase.from("goals").insert(payload);
  const { error } = await query;
  if (error) throw error;
  return true;
}

export async function deleteGoalDb(id: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const { error } = await context.supabase.from("goals").delete().eq("id", id).eq("user_id", context.user.id);
  if (error) throw error;
  return true;
}

export async function getProfileDb() {
  const context = await clientWithUser();
  if (!context) return null;
  const { data, error } = await context.supabase.from("profiles").select("*").eq("user_id", context.user.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    await ensureProfileDb();
    return { name: context.user.user_metadata?.name || "Você", updatedAt: new Date().toISOString() } as Partial<FinancialProfile>;
  }
  return { name: data.name || context.user.user_metadata?.name || "Você", mainGoal: data.main_goal || "Criar uma reserva", civilStatus: data.relationship_status || "Solteiro(a)", accumulatedNetWorth: Number(data.current_assets || 0), netWorthGoal: Number(data.net_worth_goal || 0), updatedAt: data.updated_at } as Partial<FinancialProfile>;
}

export async function updateProfileAvatarDb(avatarUrl: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const { error } = await context.supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("user_id", context.user.id);
  if (error) throw error;
  return true;
}

export async function saveProfileDb(profile: FinancialProfile, avatarUrl?: string) {
  const context = await clientWithUser();
  if (!context) return null;
  const payload = {
    user_id: context.user.id,
    name: profile.name,
    email: context.user.email,
    relationship_status: profile.civilStatus,
    main_goal: profile.mainGoal,
    ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
    current_assets: profile.accumulatedNetWorth,
    net_worth_goal: profile.netWorthGoal,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await context.supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
  return true;
}

export async function saveCoupleMeetingDb(topics: string[]) {
  const context = await clientWithUser();
  if (!context) return null;
  const { error } = await context.supabase.from("couple_meetings").upsert({ user_id: context.user.id, month_key: new Date().toISOString().slice(0, 7), topic_1: topics[0], topic_2: topics[1], topic_3: topics[2] }, { onConflict: "user_id,month_key" });
  if (error) throw error;
  return true;
}

export async function saveLeadDb(email: string, source: string) {
  const supabase = createClient();
  if (!supabase) {
    localStorage.setItem(`recomecar:lead:${email.toLowerCase()}`, JSON.stringify({ email, source, createdAt: new Date().toISOString() }));
    return true;
  }
  const { error } = await supabase.from("leads").insert({ email: email.toLowerCase(), source });
  if (error && error.code !== "23505") throw error;
  return true;
}
