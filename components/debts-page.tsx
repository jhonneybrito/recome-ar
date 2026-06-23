"use client";

import { AlertCircle, CreditCard, HeartHandshake, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AppShell from "./app-shell";
import DebtModal from "./debt-modal";
import { Button, Card, Pill, ProgressBar } from "./ui";
import { getPriorityDebt, useDebts, type DebtRecord } from "@/lib/debts-storage";
import { estimateDebtPayoffTime, formatDuration } from "@/lib/financial-calculations";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function DebtsPage() {
  const { debts, removeDebt } = useDebts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DebtRecord | null>(null);
  const total = debts.reduce((sum, debt) => sum + Math.max(0, debt.total - debt.paid), 0);
  const monthly = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const months = estimateDebtPayoffTime(total, monthly);
  const priority = getPriorityDebt(debts);

  return (
    <AppShell title="Dívidas" subtitle="Olhar para os compromissos com clareza é um passo de cuidado, não de culpa.">
      <div className="grid gap-5">
        {priority && <Card className="border-peach/30 bg-peach/15 p-6"><div className="flex flex-wrap items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#9a532f]"><AlertCircle/></span><div className="min-w-0 flex-1"><Pill tone="peach">Prioridade recomendada</Pill><h2 className="mt-3 font-display text-3xl">{priority.name}</h2><p className="mt-2 text-sm text-ink/55">{priority.priorityType} · {money(Math.max(0, priority.total - priority.paid))} em aberto</p>{priority.urgencyReason && <p className="mt-3 rounded-2xl bg-white/65 p-4 text-sm leading-6 text-ink/65">“{priority.urgencyReason}”</p>}</div><Button variant="secondary" onClick={() => { setEditing(priority); setOpen(true); }}>Revisar prioridade</Button></div></Card>}

        <div className="rounded-2xl border border-sage/30 bg-mist/70 p-5 text-sm leading-6 text-ink/65"><HeartHandshake className="mb-3 text-forest"/><b>Nem sempre a primeira dívida a ser paga é a maior ou a mais cara.</b> Em alguns casos, a prioridade deve ser uma dívida emocional: aquela que pode gerar conflitos pessoais, cobranças desconfortáveis, ansiedade ou dor de cabeça no dia a dia.</div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-forest text-white"><p className="text-xs text-white/45">Total em aberto</p><p className="mt-2 font-display text-4xl">{money(total)}</p></Card>
          <Card><p className="text-xs text-ink/40">Parcelas mensais</p><p className="mt-2 font-display text-4xl">{money(monthly)}</p></Card>
          <Card className="bg-light"><p className="text-xs text-ink/40">Prazo estimado</p><p className="mt-2 font-display text-3xl">{formatDuration(months)}</p></Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-display text-3xl">Minhas dívidas</h2><p className="text-sm text-ink/45">{debts.length} registros</p></div><Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={16}/>Nova dívida</Button></div>
          <div className="mt-6 grid gap-4">
            {debts.length === 0 ? <div className="py-14 text-center"><p className="text-ink/45">Se você não tem dívidas, isso também é uma conquista. Se tem, cadastre sem culpa para enxergar o caminho.</p><Button className="mt-4" onClick={() => setOpen(true)}>Cadastrar dívida</Button></div> : debts.map((debt) => {
              const remaining = Math.max(0, debt.total - debt.paid);
              const progress = debt.total ? debt.paid / debt.total * 100 : 100;
              return <div key={debt.id} className={`rounded-2xl border p-5 ${debt.id === priority?.id ? "border-peach/50 bg-peach/5" : "border-ink/8"}`}><div className="flex flex-wrap items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-peach/20"><CreditCard size={18}/></span><div><div className="flex flex-wrap items-center gap-2"><b>{debt.name}</b>{debt.id === priority?.id && <Pill tone="peach">Prioridade</Pill>}</div><p className="text-xs text-ink/40">{debt.type} · {debt.interestRate}% a.m. · {debt.priorityType}</p></div><div className="ml-auto text-right"><b>{money(remaining)}</b><p className="text-xs text-ink/40">{money(debt.monthlyPayment)}/mês</p></div><button onClick={() => { setEditing(debt); setOpen(true); }} aria-label={`Editar ${debt.name}`}><Pencil size={16}/></button><button onClick={() => { if (window.confirm(`Quer remover “${debt.name}”? Faça isso apenas se a dívida não fizer mais parte da sua realidade.`)) removeDebt(debt.id); }} aria-label={`Excluir ${debt.name}`}><Trash2 size={16}/></button></div><div className="mt-4"><ProgressBar value={progress}/></div></div>;
            })}
          </div>
        </Card>
      </div>
      <DebtModal open={open} debt={editing} onClose={() => { setOpen(false); setEditing(null); }}/>
    </AppShell>
  );
}
