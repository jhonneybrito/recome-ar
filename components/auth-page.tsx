import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { Button, Input, Logo } from "./ui";

export default function AuthPage({ mode }: { mode: "login" | "register" | "forgot" }) {
  const content = {
    login: { title: "Que bom ter você de volta.", subtitle: "Entre para continuar cuidando dos seus planos.", action: "Entrar", footer: <>Ainda não tem uma conta? <Link className="font-extrabold text-forest" href="/register">Comece grátis</Link></> },
    register: { title: "Seu recomeço começa aqui.", subtitle: "Leva menos de dois minutos. Sem cartão de crédito.", action: "Criar minha conta", footer: <>Já tem uma conta? <Link className="font-extrabold text-forest" href="/login">Entrar</Link></> },
    forgot: { title: "Vamos recuperar seu acesso.", subtitle: "Enviaremos um link seguro para o seu e-mail.", action: "Enviar link de acesso", footer: <Link className="inline-flex items-center gap-2 font-extrabold text-forest" href="/login"><ArrowLeft size={15} /> Voltar para o login</Link> },
  }[mode];
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex flex-col p-6 sm:p-10 lg:p-14">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <p className="eyebrow">{mode === "login" ? "Bem-vinda de volta" : mode === "register" ? "Comece agora" : "Recuperar senha"}</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">{content.title}</h1>
          <p className="mt-4 leading-7 text-ink/50">{content.subtitle}</p>
          <form className="mt-9 grid gap-5">
            {mode === "register" && <Input label="Como podemos te chamar?" placeholder="Seu primeiro nome" />}
            <Input label="E-mail" type="email" placeholder="voce@email.com" />
            {mode !== "forgot" && <Input label="Senha" type="password" placeholder="••••••••" />}
            {mode === "login" && <div className="-mt-2 text-right"><Link href="/forgot-password" className="text-xs font-bold text-forest">Esqueci minha senha</Link></div>}
            <Link href={mode === "forgot" ? "/login" : "/onboarding"}><Button type="button" className="w-full py-4">{content.action} <ArrowRight size={17} /></Button></Link>
          </form>
          <p className="mt-7 text-center text-sm text-ink/50">{content.footer}</p>
          {mode === "register" && <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink/40"><CheckCircle2 size={14} /> Ao continuar, você aceita os Termos e a Política de Privacidade.</p>}
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-forest p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="relative ml-auto rounded-full bg-white/10 px-4 py-2 text-xs font-bold">Mais clareza. Menos aperto.</div>
        <div className="relative max-w-lg"><Quote className="mb-7 text-sage" size={36} /><blockquote className="font-display text-4xl leading-tight">“Pela primeira vez, olhei para o meu dinheiro sem medo. Eu não precisava ganhar na loteria — precisava de um caminho.”</blockquote><p className="mt-7 text-sm font-bold text-white/60">— Camila, recomeçando há 5 meses</p></div>
        <div className="relative grid grid-cols-3 gap-3">{[["12 mil+", "recomeços"], ["4,9/5", "de satisfação"], ["87%", "mais clareza"]].map(([n,l]) => <div key={n} className="rounded-2xl bg-white/10 p-4"><b className="font-display text-2xl">{n}</b><p className="mt-1 text-xs text-white/45">{l}</p></div>)}</div>
      </section>
    </main>
  );
}
