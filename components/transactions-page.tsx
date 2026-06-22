"use client";

import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Trash2, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "./app-shell";
import TransactionModal from "./transaction-modal";
import { Button, Card, Pill, ProgressBar } from "./ui";
import { useTransactions, type FinancialTransaction } from "@/lib/transactions-storage";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function TransactionsPage() {
  const { transactions, removeTransaction } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | null>(null);
  const incomes = transactions.filter((item)=>item.type==="income").reduce((sum,item)=>sum+item.amount,0);
  const expenses = transactions.filter((item)=>item.type==="expense").reduce((sum,item)=>sum+item.amount,0);
  const categories = useMemo(() => {
    const grouped = new Map<string,number>();
    transactions.filter((item)=>item.type==="expense").forEach((item)=>grouped.set(item.category,(grouped.get(item.category)||0)+item.amount));
    return [...grouped.entries()].sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value,percentage:expenses?value/expenses*100:0}));
  },[transactions,expenses]);

  return (
    <AppShell title="Movimentações" subtitle="Cadastre receitas e despesas e entenda para onde seu dinheiro está indo.">
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-3"><Card><ArrowUpRight className="text-forest"/><p className="mt-4 text-xs font-bold text-ink/40">Receitas cadastradas</p><p className="mt-1 font-display text-3xl text-forest">{money(incomes)}</p></Card><Card><ArrowDownRight className="text-peach"/><p className="mt-4 text-xs font-bold text-ink/40">Despesas cadastradas</p><p className="mt-1 font-display text-3xl">{money(expenses)}</p></Card><Card className={incomes-expenses>=0?"bg-light":"bg-peach/20"}><WalletCards/><p className="mt-4 text-xs font-bold text-ink/40">Saldo das movimentações</p><p className="mt-1 font-display text-3xl">{money(incomes-expenses)}</p></Card></div>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card className="p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-2xl">Histórico</h2><p className="text-xs text-ink/40">{transactions.length} movimentações cadastradas</p></div><Button onClick={()=>{setEditing(null);setModalOpen(true)}}><Plus size={16}/> Adicionar</Button></div><div className="mt-6 divide-y divide-ink/5">{transactions.length===0?<div className="py-16 text-center"><p className="text-sm text-ink/45">Comece no seu ritmo. Um registro já é suficiente para o painel ficar mais seu.</p><Button className="mt-4" onClick={()=>setModalOpen(true)}>Cadastrar primeira movimentação</Button></div>:transactions.map((transaction)=><div key={transaction.id} className="flex items-center gap-4 py-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${transaction.type==="income"?"bg-mist text-forest":"bg-peach/20 text-[#9a532f]"}`}>{transaction.type==="income"?<ArrowUpRight size={18}/>:<ArrowDownRight size={18}/>}</span><div className="min-w-0"><b className="block truncate text-sm">{transaction.description}</b><p className="truncate text-xs text-ink/40">{transaction.category} · {new Intl.DateTimeFormat("pt-BR").format(new Date(`${transaction.date}T12:00:00`))}</p></div><b className={`ml-auto whitespace-nowrap text-sm ${transaction.type==="income"?"text-forest":""}`}>{transaction.type==="expense"?"- ":""}{money(transaction.amount)}</b><button onClick={()=>{setEditing(transaction);setModalOpen(true)}} aria-label={`Editar ${transaction.description}`} className="text-ink/25 transition hover:text-forest"><Pencil size={16}/></button><button onClick={()=>{if(window.confirm(`Quer retirar “${transaction.description}” do histórico? Isso não apaga seu progresso — apenas remove este registro.`))removeTransaction(transaction.id)}} aria-label={`Excluir ${transaction.description}`} className="text-ink/25 transition hover:text-peach"><Trash2 size={16}/></button></div>)}</div></Card>
          <Card className="h-fit p-6"><h2 className="font-display text-2xl">Despesas por categoria</h2><p className="mt-1 text-xs text-ink/40">Distribuição do que foi cadastrado</p><div className="mt-6 grid gap-5">{categories.length===0?<p className="text-sm text-ink/45">Cadastre uma despesa para visualizar.</p>:categories.slice(0,8).map((category)=><div key={category.name}><div className="mb-2 flex justify-between text-xs"><b>{category.name}</b><span>{money(category.value)} · {category.percentage.toFixed(0)}%</span></div><ProgressBar value={category.percentage} color={category.percentage>35?"bg-peach":"bg-forest"}/></div>)}</div>{categories[0]&&<div className="mt-7 rounded-2xl bg-cream p-4 text-sm leading-6 text-ink/60"><Pill tone="neutral">Maior categoria</Pill><p className="mt-3"><b>{categories[0].name}</b> concentra {categories[0].percentage.toFixed(0)}% das despesas cadastradas.</p></div>}</Card>
        </div>
      </div>
      <TransactionModal open={modalOpen} transaction={editing} onClose={()=>{setModalOpen(false);setEditing(null)}}/>
    </AppShell>
  );
}
