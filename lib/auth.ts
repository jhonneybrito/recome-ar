"use client";

import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";

export async function signUp(name: string, email: string, password: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export { isSupabaseConfigured };
