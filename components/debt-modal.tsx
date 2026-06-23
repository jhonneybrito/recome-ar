"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input } from "./ui";
import { useDebts, type DebtRecord } from "@/lib/debts-storage";
import { FREE_LIMITS, useUserPlan } from "@/lib/plans";
import UpgradeModal from "./upgrade-modal";

const priorities: DebtRecord["priorityType"][] = ["Maior juros", "Maior impacto mensal", "Menor dívida", "Dívida emocional/urgente"];

export default function DebtModal({ open, onClose, debt = null }: { open: boolean; onClose: () => void; debt?: DebtRecord | null }) {
  const { debts, upsertDebt } = useDebts();
  const { isPremium } = useUserPlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Cartão de crédito");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [payment, setPayment] = useState("");
  const [rate, setRate] = useState("");
  const [priorityType, setPriorityType] = useState<DebtRecord["priorityType"]>("Maior juros");
  const [urgencyReason, setUrgencyReason] = useState("");
  const [isCurrentPriority, setIsCurrentPriority] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(debt?.name || "");
    setType(debt?.type || "Cartão de crédito");
    setTotal(debt ? String(debt.total) : "");
    setPaid(debt ? String(debt.paid) : "");
    setPayment(debt ? String(debt.monthlyPayment) : "");
    setRate(debt ? String(debt.interestRate) : "");
    setPriorityType(debt?.priorityType || "Maior juros");
    setUrgencyReason(debt?.urgencyReason || "");
    setIsCurrentPriority(Boolean(debt?.isCurrentPriority));
  }, [open, debt]);

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!debt && !isPremium && debts.length >= FREE_LIMITS.debts) {
      setUpgradeOpen(true);
      return;
    }
    upsertDebt({
      name: name.trim(),
      type,
      total: Number(total),
      paid: Number(paid),
      monthlyPayment: Number(payment),
      interestRate: Number(rate),
      priorityType,
      urgencyReason: urgencyReason.trim(),
      isCurrentPriority,
    }, debt?.id);
    onClose();
  };

  return (
    <><div className="fixed inset-0 z-[90] grid place-items-center bg-ink/45 p-4" role="dialog" aria-label={debt ? "Editar dívida" : "Nova dívida"}>
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-7">
        <div className="flex justify-between"><div><p className="eyebrow">Dívidas</p><h2 className="mt-2 font-display text-4xl">{debt ? "Editar dívida" : "Nova dívida"}</h2></div><button type="button" onClick={onClose} aria-label="Fechar"><X/></button></div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Input required label="Nome" value={name} onChange={(event) => setName(event.target.value)}/>
          <label className="grid gap-2 text-sm font-bold">Tipo<select value={type} onChange={(event) => setType(event.target.value)} className="rounded-2xl border border-ink/10 px-4 py-3.5"><option>Cartão de crédito</option><option>Empréstimo</option><option>Financiamento</option><option>Parcelamento</option><option>Outro</option></select></label>
          <Input required type="number" min="0.01" label="Valor total (R$)" value={total} onChange={(event) => setTotal(event.target.value)}/>
          <Input required type="number" min="0" label="Valor já pago (R$)" value={paid} onChange={(event) => setPaid(event.target.value)}/>
          <Input required type="number" min="0" label="Parcela mensal (R$)" value={payment} onChange={(event) => setPayment(event.target.value)}/>
          <Input type="number" min="0" step="0.01" label="Juros ao mês (%)" value={rate} onChange={(event) => setRate(event.target.value)}/>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">Tipo de prioridade<select value={priorityType} onChange={(event) => setPriorityType(event.target.value as DebtRecord["priorityType"])} className="rounded-2xl border border-ink/10 px-4 py-3.5">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">Motivo da urgência (opcional)<textarea rows={3} value={urgencyReason} onChange={(event) => setUrgencyReason(event.target.value)} placeholder="Ex.: esta dívida está gerando ansiedade ou tensão familiar." className="resize-none rounded-2xl border border-ink/10 p-4 font-medium"/></label>
          <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm leading-6 sm:col-span-2"><input type="checkbox" checked={isCurrentPriority} onChange={(event) => setIsCurrentPriority(event.target.checked)} className="mt-1 h-4 w-4 accent-forest"/><span><b>Marcar como Prioridade atual</b><br/><span className="text-ink/50">Ela aparecerá no topo como o compromisso que merece atenção primeiro.</span></span></label>
        </div>
        <div className="mt-7 flex justify-end gap-3"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar dívida</Button></div>
      </form>
    </div><UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} resource="3 dívidas"/></>
  );
}
