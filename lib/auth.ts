"use client";

import { ensureProfileDb } from "./db";
import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";

function readableError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Erro desconhecido.";
  }
}

export async function signUp(name: string, email: string, password: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase não está configurado.");
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) {
    console.error("[auth:signup] erro retornado pelo Supabase", {
      message: error.message,
      name: error.name,
      status: "status" in error ? error.status : undefined,
    });
    throw new Error(`Supabase signUp: ${error.message}`);
  }
  if (data.session) {
    try {
      await ensureProfileDb(name);
    } catch (profileError) {
      console.error("[auth:signup] usuário criado, mas houve erro ao criar profile", readableError(profileError));
    }
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase não está configurado.");

  const normalizedEmail = email.trim().toLowerCase();
  console.info("[auth:login] tentando login com Supabase", { email: normalizedEmail });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    console.error("[auth:login] erro real retornado pelo Supabase", {
      message: error.message,
      name: error.name,
      status: "status" in error ? error.status : undefined,
    });
    throw new Error(`Supabase signInWithPassword: ${error.message}`);
  }

  if (!data.user) {
    console.error("[auth:login] Supabase autenticou sem retornar usuário", { email: normalizedEmail });
    throw new Error("Supabase signInWithPassword: autenticação não retornou usuário.");
  }

  try {
    await ensureProfileDb(data.user.user_metadata?.name || data.user.email?.split("@")[0]);
  } catch (profileError) {
    console.error("[auth:login] login autenticado, mas houve erro ao criar/atualizar profile", readableError(profileError));
    // Não bloquear o login no MVP por falha de profile, purchase ou pagamento.
  }

  console.info("[auth:login] login concluído com sucesso", { userId: data.user.id, email: normalizedEmail });
  return data;
}

export async function signOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("recomecar:")) localStorage.removeItem(key);
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) {
    console.error("[auth:reset-password] erro retornado pelo Supabase", {
      message: error.message,
      name: error.name,
      status: "status" in error ? error.status : undefined,
    });
    throw new Error(`Supabase resetPasswordForEmail: ${error.message}`);
  }
}

export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("[auth:getCurrentUser] erro retornado pelo Supabase", error.message);
    return null;
  }
  return data.user;
}

export { isSupabaseConfigured };
