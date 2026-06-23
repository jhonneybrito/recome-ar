"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Logo } from "./ui";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage(){
  const[password,setPassword]=useState("");const[confirm,setConfirm]=useState("");const[message,setMessage]=useState("");const[error,setError]=useState("");
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError("");if(password.length<8){setError("A senha precisa ter pelo menos 8 caracteres.");return}if(password!==confirm){setError("As senhas não coincidem.");return}const supabase=createClient();if(!supabase){setError("Supabase não está configurado.");return}const{error:authError}=await supabase.auth.updateUser({password});if(authError)setError(authError.message);else setMessage("Senha atualizada. Você já pode entrar novamente.")};
  return <main className="grid min-h-screen place-items-center bg-cream p-5"><div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-soft"><Logo/><h1 className="mt-10 font-display text-5xl">Crie sua nova senha.</h1><p className="mt-4 text-sm leading-6 text-ink/50">Use pelo menos 8 caracteres e escolha algo que só você conheça.</p><form onSubmit={submit} className="mt-8 grid gap-5"><Input required minLength={8} type="password" label="Nova senha" value={password} onChange={e=>setPassword(e.target.value)}/><Input required minLength={8} type="password" label="Confirmar nova senha" value={confirm} onChange={e=>setConfirm(e.target.value)}/><Button type="submit">Atualizar senha</Button>{error&&<p role="alert" className="rounded-2xl bg-peach/15 p-3 text-sm font-bold text-[#8a4c2d]">{error}</p>}{message&&<p role="status" className="rounded-2xl bg-mist p-3 text-sm font-bold text-forest">{message} <Link href="/login" className="underline">Entrar</Link></p>}</form></div></main>
}
