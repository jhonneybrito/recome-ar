"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Circle, Quote } from "lucide-react";
import { useState } from "react";
import LegalFooter from "./legal-footer";
import { Button, Input, Logo } from "./ui";
import { isSupabaseConfigured, resetPassword, signIn, signUp } from "@/lib/auth";

export default function AuthPage({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const content = {
    login: { title: "Que bom ter você de volta.", subtitle: "Entre para continuar cuidando dos seus planos.", action: "Entrar", footer: <>Ainda não tem uma conta? <Link className="font-extrabold text-forest" href="/register">Comece grátis</Link></> },
    register: { title: "Seu recomeço começa aqui.", subtitle: "Leva menos de dois minutos. Sem cartão de crédito.", action: "Criar minha conta", footer: <>Já tem uma conta? <Link className="font-extrabold text-forest" href="/login">Entrar</Link></> },
    forgot: { title: "Vamos recuperar seu acesso.", subtitle: "Enviaremos um link seguro para o seu e-mail.", action: "Enviar link de acesso", footer: <Link className="inline-flex items-center gap-2 font-extrabold text-forest" href="/login"><ArrowLeft size={15}/> Voltar para o login</Link> },
  }[mode];

  const validName = name.trim().length >= 2;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validPassword = password.length >= 8;
  const registerAllowed = validName && validEmail && validPassword && termsAccepted;
  const allowed = mode === "register"
    ? registerAllowed
    : mode === "login"
      ? validEmail && validPassword
      : validEmail;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!allowed) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
    if (mode === "register") {
      window.localStorage.setItem("recomecar:consent:v1", JSON.stringify({ terms: true, marketing, acceptedAt: new Date().toISOString() }));
      if (isSupabaseConfigured) {
        const data = await signUp(name.trim(), email.trim().toLowerCase(), password);
        if (data.session) router.push("/onboarding");
        else setSuccess("Conta criada. Confira seu e-mail para confirmar o acesso antes de entrar.");
      } else {
        window.localStorage.setItem("recomecar:registration:v1", JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), createdAt: new Date().toISOString() }));
        router.push("/onboarding");
      }
      return;
    }
    if (mode === "login") {
      if (isSupabaseConfigured) await signIn(email.trim().toLowerCase(), password);
      router.push("/dashboard");
      router.refresh();
      return;
    }
    if (isSupabaseConfigured) {
      await resetPassword(email.trim());
      setSuccess("Enviamos o link de recuperação. Confira sua caixa de entrada.");
    } else {
      setError("Configure o Supabase para habilitar a recuperação de senha.");
    }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const Requirement = ({ valid, children }: { valid: boolean; children: React.ReactNode }) => (
    <span className={`flex items-center gap-2 ${valid ? "text-forest" : "text-ink/40"}`}>{valid ? <Check size={13} strokeWidth={3}/> : <Circle size={10}/>} {children}</span>
  );

  return (
    <div className="bg-white">
      <main className="grid min-h-screen lg:grid-cols-2">
        <section className="flex flex-col p-6 sm:p-10 lg:p-14">
          <Logo/>
          <div className="mx-auto my-auto w-full max-w-md py-14">
            <p className="eyebrow">{mode === "login" ? "Bem-vinda de volta" : mode === "register" ? "Comece agora" : "Recuperar senha"}</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">{content.title}</h1>
            <p className="mt-4 leading-7 text-ink/50">{content.subtitle}</p>
            <form className="mt-9 grid gap-5" onSubmit={submit}>
              {mode === "register" && <Input required minLength={2} label="Como podemos te chamar? *" placeholder="Seu primeiro nome" value={name} onChange={(event) => setName(event.target.value)}/>}
              <Input required label="E-mail *" type="email" placeholder="voce@email.com" value={email} onChange={(event) => setEmail(event.target.value)}/>
              {mode !== "forgot" && <Input required minLength={8} label="Senha *" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)}/>}

              {mode === "register" && (
                <>
                  <div className="grid grid-cols-1 gap-2 rounded-2xl border border-ink/8 bg-white p-4 text-xs sm:grid-cols-2">
                    <Requirement valid={validName}>Nome preenchido</Requirement>
                    <Requirement valid={validEmail}>E-mail válido</Requirement>
                    <Requirement valid={validPassword}>Senha com 8 caracteres</Requirement>
                    <Requirement valid={termsAccepted}>Termos aceitos</Requirement>
                  </div>
                  <div className="grid gap-4 rounded-2xl bg-cream p-4">
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-ink/65">
                      <input required type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-forest"/>
                      <span>Li e aceito os <Link className="font-extrabold text-forest underline" href="/terms">Termos de Uso</Link> e a <Link className="font-extrabold text-forest underline" href="/privacy">Política de Privacidade</Link>. <b>Obrigatório.</b></span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-ink/65">
                      <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} className="mt-1 h-4 w-4 accent-forest"/>
                      <span>Quero receber conteúdos, novidades e comunicações do Recomeçar. Opcional e desmarcado por padrão.</span>
                    </label>
                  </div>
                </>
              )}

              {mode === "login" && <div className="-mt-2 text-right"><Link href="/forgot-password" className="text-xs font-bold text-forest">Esqueci minha senha</Link></div>}
              <Button type="submit" disabled={!allowed || submitting} className="w-full py-4 disabled:cursor-not-allowed disabled:opacity-45">{submitting ? "Aguarde..." : content.action}<ArrowRight size={17}/></Button>
              {error && <p role="alert" className="rounded-2xl bg-peach/15 p-3 text-center text-xs font-bold text-[#8a4c2d]">{error}</p>}
              {success && <p role="status" className="rounded-2xl bg-mist p-3 text-center text-xs font-bold text-forest">{success}</p>}
              {mode === "register" && !allowed && <p className="-mt-2 text-center text-xs text-ink/40">Preencha todos os campos obrigatórios para criar a conta.</p>}
            </form>
            <p className="mt-7 text-center text-sm text-ink/50">{content.footer}</p>
          </div>
        </section>
        <section className="relative hidden overflow-hidden bg-forest p-14 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[70px] border-white/5"/>
          <div className="relative ml-auto rounded-full bg-white/10 px-4 py-2 text-xs font-bold">Mais clareza. Menos aperto.</div>
          <div className="relative max-w-lg"><Quote className="mb-7 text-sage" size={36}/><blockquote className="font-display text-4xl leading-tight">“Pela primeira vez, olhei para o meu dinheiro sem medo. Eu precisava de um caminho.”</blockquote><p className="mt-7 text-sm font-bold text-white/60">— Relato ilustrativo de experiência</p></div>
          <div className="relative rounded-2xl bg-white/10 p-5 text-sm leading-6 text-white/60">Seus dados financeiros são usados para gerar os cálculos do produto e não são vendidos.</div>
        </section>
      </main>
      <LegalFooter/>
    </div>
  );
}
