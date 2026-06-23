"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Heart, Home, Sparkles, Target, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Logo } from "@/components/ui";
import { defaultFinancialProfile, type FinancialProfile, type MainGoal } from "@/lib/financial-calculations";
import { loadFinancialProfile, migrateProfileToRecords, saveFinancialProfile } from "@/lib/financial-storage";
import { saveDebtDb, saveGoalDb, saveProfileDb, saveTransactionDb } from "@/lib/db";
import LegalFooter from "@/components/legal-footer";

const goals: [typeof Home, MainGoal, string][] = [
  [Home, "Sair das dívidas", "Quero voltar a respirar"],
  [Wallet, "Criar uma reserva", "Quero ter segurança"],
  [Target, "Realizar um sonho", "Quero planejar algo grande"],
  [Heart, "Organizar a vida a dois", "Quero caminhar em parceria"],
];

const numberValue = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FinancialProfile>(defaultFinancialProfile);
  const total = 5;

  useEffect(() => setData(loadFinancialProfile()), []);

  const setNumber = (field: keyof FinancialProfile, value: string) =>
    setData((current) => ({ ...current, [field]: numberValue(value) }));

  const finish = async () => {
    const profile = { ...data, updatedAt: new Date().toISOString() };
    saveFinancialProfile(profile);
    migrateProfileToRecords(profile);
    await saveProfileDb(profile);
    const date = new Date().toISOString().slice(0, 10);
    await Promise.all([
      data.monthlyIncome > 0 ? saveTransactionDb({ description: "Renda mensal informada no onboarding", amount: data.monthlyIncome, type: "income", category: "Salário", date }) : null,
      data.otherIncome > 0 ? saveTransactionDb({ description: "Outras rendas informadas no onboarding", amount: data.otherIncome, type: "income", category: "Outras receitas", date }) : null,
      data.fixedExpenses > 0 ? saveTransactionDb({ description: "Gastos fixos informados no onboarding", amount: data.fixedExpenses, type: "expense", category: "Contas da casa", date }) : null,
      data.variableExpenses > 0 ? saveTransactionDb({ description: "Gastos variáveis informados no onboarding", amount: data.variableExpenses, type: "expense", category: "Outras despesas", date }) : null,
      data.debtTotal > 0 ? saveDebtDb({ name: data.debtType || "Dívida inicial", type: data.debtType || "Outro", total: data.debtTotal, paid: 0, monthlyPayment: data.debtMonthlyPayments, interestRate: 0, priorityType: "Maior juros", urgencyReason: "", isCurrentPriority: false }) : null,
      data.goalAmount > 0 ? saveGoalDb({ name: data.mainGoal, category: "Objetivo principal", target: data.goalAmount, current: data.currentSavings, monthlyContribution: 0, targetDate: "" }) : null,
    ]);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="bg-cream"><main className="min-h-screen">
      <header className="container-page flex h-24 items-center justify-between"><Logo/><span className="text-xs font-extrabold text-ink/40">Passo {step} de {total}</span></header>
      <div className="mx-auto h-1.5 max-w-2xl rounded-full bg-white"><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${step / total * 100}%` }}/></div>
      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          {step === 1 && <><p className="eyebrow">Antes dos números</p><h1 className="mt-4 font-display text-5xl leading-tight">O que faria você se sentir mais leve hoje?</h1><p className="mt-4 leading-7 text-ink/55">Sua resposta define a prioridade do Plano de Recomeço.</p><div className="mt-9 grid gap-4 sm:grid-cols-2">{goals.map(([Icon,title,text]) => <button key={title} onClick={() => setData({...data, mainGoal:title})} className={`relative rounded-[24px] border-2 p-6 text-left transition ${data.mainGoal === title ? "border-forest bg-white shadow-soft" : "border-transparent bg-white/60 hover:bg-white"}`}><Icon className="text-forest"/><p className="mt-6 font-display text-2xl">{title}</p><p className="mt-2 text-sm text-ink/45">{text}</p>{data.mainGoal === title && <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-forest text-white"><Check size={14}/></span>}</button>)}</div></>}

          {step === 2 && <><p className="eyebrow">Quem está recomeçando</p><h1 className="mt-4 font-display text-5xl">Conte um pouco sobre seu momento.</h1><div className="mt-9 grid gap-5 sm:grid-cols-2"><Input label="Como podemos te chamar?" value={data.name} onChange={(e)=>setData({...data,name:e.target.value})}/><label className="grid gap-2 text-sm font-bold text-ink/80">Estado civil<select value={data.civilStatus} onChange={(e)=>setData({...data,civilStatus:e.target.value as FinancialProfile["civilStatus"]})} className="focus-ring rounded-2xl border border-ink/10 bg-white px-4 py-3.5"><option>Solteiro(a)</option><option>Casado(a)</option><option>União estável</option><option>Outro</option></select></label><label className="grid gap-2 text-sm font-bold text-ink/80 sm:col-span-2">Como você sente sua vida financeira hoje?<select value={data.financialMoment} onChange={(e)=>setData({...data,financialMoment:e.target.value as FinancialProfile["financialMoment"]})} className="focus-ring rounded-2xl border border-ink/10 bg-white px-4 py-3.5"><option>No limite</option><option>Apertado</option><option>Estável</option><option>Em crescimento</option></select></label></div></>}

          {step === 3 && <><p className="eyebrow">Sua realidade mensal</p><h1 className="mt-4 font-display text-5xl">Quanto entra e quanto precisa sair?</h1><p className="mt-4 text-ink/55">Use valores médios. Todos os relatórios serão calculados a partir daqui.</p><div className="mt-9 grid gap-5 sm:grid-cols-2"><Input label="Renda mensal líquida (R$)" type="number" min="0" value={data.monthlyIncome} onChange={(e)=>setNumber("monthlyIncome",e.target.value)}/><Input label="Outras rendas (R$)" type="number" min="0" value={data.otherIncome} onChange={(e)=>setNumber("otherIncome",e.target.value)}/><Input label="Gastos fixos (R$)" type="number" min="0" value={data.fixedExpenses} onChange={(e)=>setNumber("fixedExpenses",e.target.value)}/><Input label="Gastos variáveis (R$)" type="number" min="0" value={data.variableExpenses} onChange={(e)=>setNumber("variableExpenses",e.target.value)}/></div></>}

          {step === 4 && <><p className="eyebrow">Dívidas, patrimônio e objetivo</p><h1 className="mt-4 font-display text-5xl">O que pesa hoje e o que você já construiu?</h1><p className="mt-4 text-ink/55">Patrimônio é a soma aproximada de dinheiro guardado, investimentos, imóveis e outros bens, descontadas as dívidas.</p><div className="mt-9 grid gap-5 sm:grid-cols-2"><Input label="Total de dívidas (R$)" type="number" min="0" value={data.debtTotal} onChange={(e)=>setNumber("debtTotal",e.target.value)}/><Input label="Parcelas mensais (R$)" type="number" min="0" value={data.debtMonthlyPayments} onChange={(e)=>setNumber("debtMonthlyPayments",e.target.value)}/><label className="grid gap-2 text-sm font-bold text-ink/80 sm:col-span-2">Tipo principal<select value={data.debtType} onChange={(e)=>setData({...data,debtType:e.target.value})} className="focus-ring rounded-2xl border border-ink/10 bg-white px-4 py-3.5"><option>Cartão de crédito</option><option>Empréstimo</option><option>Financiamento</option><option>Não tenho dívidas</option></select></label><Input label="Valor da sua meta (R$)" type="number" min="0" value={data.goalAmount} onChange={(e)=>setNumber("goalAmount",e.target.value)}/><Input label="Quanto já guardou para a meta (R$)" type="number" min="0" value={data.currentSavings} onChange={(e)=>setNumber("currentSavings",e.target.value)}/><Input label="Patrimônio acumulado hoje (R$)" type="number" min="0" value={data.accumulatedNetWorth} onChange={(e)=>setNumber("accumulatedNetWorth",e.target.value)}/><Input label="Meta de patrimônio (R$)" type="number" min="0" value={data.netWorthGoal} onChange={(e)=>setNumber("netWorthGoal",e.target.value)}/></div></>}

          {step === 5 && <div className="rounded-[36px] bg-white p-8 text-center shadow-soft sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mist text-forest"><Sparkles/></span><p className="eyebrow mt-7">Tudo pronto</p><h1 className="mt-3 font-display text-5xl">Seu diagnóstico será realmente seu.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-ink/55">Saldo, saúde financeira, prazo das dívidas, metas e projeções serão calculados com os dados que você informou.</p><Button onClick={finish} className="mt-8 px-8 py-4">Gerar meu diagnóstico <ArrowRight size={17}/></Button></div>}

          {step < total && <div className="mt-10 flex justify-between"><Button variant="ghost" onClick={()=>setStep(Math.max(1,step-1))} disabled={step===1}><ArrowLeft size={17}/> Voltar</Button><Button onClick={()=>setStep(step+1)}>Continuar <ArrowRight size={17}/></Button></div>}
        </div>
      </section>
    </main><LegalFooter/></div>
  );
}
