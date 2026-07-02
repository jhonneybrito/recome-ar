"use client";

import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input } from "./ui";
import { expenseCategories, incomeCategories, useTransactions, type FinancialTransaction, type TransactionType } from "@/lib/transactions-storage";
import { FREE_LIMITS, useUserPlan } from "@/lib/plans";
import UpgradeModal from "./upgrade-modal";

export default function TransactionModal({ open, onClose, transaction = null }: { open: boolean; onClose: () => void; transaction?: FinancialTransaction | null }) {
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { isPremium } = useUserPlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(transaction?.type || "expense");
    setDescription(transaction?.description || "");
    setAmount(transaction ? String(transaction.amount) : "");
    setCategory(transaction?.category || expenseCategories[0]);
    setDate(transaction?.date || new Date().toISOString().slice(0, 10));
  }, [open, transaction]);

  if (!open) return null;
  const categories = type === "income" ? incomeCategories : expenseCategories;

  const changeType = (next: TransactionType) => {
    setType(next);
    setCategory(next === "income" ? incomeCategories[0] : expenseCategories[0]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const numericAmount = Number(amount.replace(",", "."));
    if (!description.trim() || numericAmount <= 0) return;
    const payload = { description: description.trim(), amount: numericAmount, type, category, date };
    const monthCount = transactions.filter((item) => item.date.startsWith(date.slice(0, 7))).length;
    if (!transaction && !isPremium && monthCount >= FREE_LIMITS.transactionsPerMonth) {
      setUpgradeOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      if (transaction) await updateTransaction(transaction.id, payload);
      else await addTransaction(payload);
      onClose();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Não foi possível salvar a movimentação.";
      console.error("[transactions] erro ao salvar movimentação", caught);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <><div className="fixed inset-0 z-[90] grid place-items-center bg-ink/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={transaction ? "Editar movimentação" : "Nova movimentação"}>
      <div className="w-full max-w-xl rounded-[30px] bg-white p-6 shadow-[0_30px_90px_rgba(16,45,39,.3)] sm:p-8">
        <div className="flex items-start justify-between"><div><p className="eyebrow">{transaction ? "Editar" : "Registrar"}</p><h2 className="mt-2 font-display text-4xl">{transaction ? "Editar movimentação" : "Nova movimentação"}</h2></div><button onClick={onClose} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full bg-ink/5"><X size={18}/></button></div>
        <form className="mt-7 grid gap-5" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => changeType("expense")} className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-sm font-extrabold ${type==="expense"?"border-peach bg-peach/15 text-ink":"border-ink/8 text-ink/45"}`}><ArrowDownRight size={18}/> Despesa</button>
            <button type="button" onClick={() => changeType("income")} className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-sm font-extrabold ${type==="income"?"border-forest bg-mist text-forest":"border-ink/8 text-ink/45"}`}><ArrowUpRight size={18}/> Receita</button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2"><Input required label="Descrição" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder={type==="expense"?"Ex.: Supermercado":"Ex.: Salário"}/><Input required label="Valor (R$)" type="number" min="0.01" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0,00"/></div>
          <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-ink/80">Categoria<select value={category} onChange={(e)=>setCategory(e.target.value)} className="focus-ring rounded-2xl border border-ink/10 bg-white px-4 py-3.5">{categories.map((item)=><option key={item}>{item}</option>)}</select></label><Input required label="Data" type="date" value={date} onChange={(e)=>setDate(e.target.value)}/></div>
          {error && <p role="alert" className="rounded-2xl bg-peach/15 p-3 text-sm font-bold text-[#8a4c2d]">{error}</p>}
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancelar</Button><Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : transaction ? "Salvar alterações" : `Salvar ${type==="income"?"receita":"despesa"}`}</Button></div>
        </form>
      </div>
    </div><UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} resource="20 lançamentos neste mês"/></>
  );
}
