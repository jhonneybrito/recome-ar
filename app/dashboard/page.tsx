import { ArrowDownRight, ArrowRight, ArrowUpRight, Bot, ChevronRight, CircleDollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import AppShell from "@/components/app-shell";
import { CashFlowChart } from "@/components/charts";
import { Card, Pill, ProgressBar } from "@/components/ui";
import { transactions } from "@/lib/mock-data";
import Link from "next/link";

const money = (value: number) => `${value < 0 ? "- " : ""}R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function Dashboard() {
  return (
    <AppShell title="Bom dia, Marina" subtitle="Aqui está o que importa para o seu mês.">
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Saldo atual", "R$ 3.840,00", Wallet, "+ 12% este mês", "green"],
              ["Receitas", "R$ 8.200,00", ArrowUpRight, "2 fontes de renda", "green"],
              ["Despesas", "R$ 4.360,00", ArrowDownRight, "53% da sua renda", "peach"],
              ["Livre para planejar", "R$ 1.140,00", CircleDollarSign, "Bom espaço", "green"],
            ].map(([label, value, Icon, note, tone]) => { const I = Icon as typeof Wallet; return <Card key={String(label)}><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone === "peach" ? "bg-peach/25 text-[#9a532f]" : "bg-mist text-forest"}`}><I size={18} /></span><span className="text-xs font-bold text-forest">{String(note)}</span></div><p className="mt-5 text-xs font-bold text-ink/40">{String(label)}</p><p className="mt-1 font-display text-2xl">{String(value)}</p></Card> })}
          </div>
          <Card className="p-6">
            <div className="flex items-start justify-between"><div><h2 className="font-display text-2xl">Seu fluxo financeiro</h2><p className="mt-1 text-xs text-ink/40">Entradas e saídas nos últimos 5 meses</p></div><Pill tone="neutral">Últimos 5 meses</Pill></div>
            <div className="mt-6"><CashFlowChart /></div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between"><div><h2 className="font-display text-2xl">Movimentações recentes</h2><p className="mt-1 text-xs text-ink/40">Seu dinheiro em movimento</p></div><Link href="/transactions" className="flex items-center gap-1 text-xs font-extrabold text-forest">Ver todas <ChevronRight size={15} /></Link></div>
            <div className="mt-5 divide-y divide-ink/5">{transactions.slice(0,4).map((t) => <div key={t.name} className="flex items-center gap-4 py-4"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${t.type === "income" ? "bg-mist text-forest" : "bg-peach/20 text-[#9a532f]"}`}>{t.type === "income" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}</span><div><p className="text-sm font-extrabold">{t.name}</p><p className="text-xs text-ink/40">{t.category} · {t.date}</p></div><b className={`ml-auto text-sm ${t.type === "income" ? "text-forest" : ""}`}>{money(t.value)}</b></div>)}</div>
          </Card>
        </div>
        <aside className="grid content-start gap-5">
          <Card className="overflow-hidden bg-forest p-0 text-white">
            <div className="p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><Bot /></span><Pill tone="peach"><span className="mr-1">✦</span> Seu plano inteligente</Pill><h2 className="mt-4 font-display text-3xl">Você está mais perto do que imagina.</h2><p className="mt-3 text-sm leading-6 text-white/55">Se mantiver o ritmo atual, sua reserva chega a R$ 10 mil em 5 meses.</p><Link href="/ai-plan" className="mt-6 flex items-center gap-2 text-sm font-extrabold">Ver próximos passos <ArrowRight size={16} /></Link></div>
            <div className="bg-white/10 px-6 py-4 text-xs text-white/55">Atualizado hoje às 08:30</div>
          </Card>
          <Card>
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Metas em foco</h2><Link href="/goals" className="text-xs font-bold text-forest">Ver todas</Link></div>
            {[["Reserva de emergência", "R$ 6.800 de R$ 10.000", 68], ["Viagem para Portugal", "R$ 2.100 de R$ 8.000", 26]].map(([name,note,value]) => <div key={String(name)} className="mt-6"><div className="mb-3 flex justify-between"><div><p className="text-sm font-extrabold">{String(name)}</p><p className="mt-1 text-xs text-ink/40">{String(note)}</p></div><b className="text-sm text-forest">{String(value)}%</b></div><ProgressBar value={Number(value)} color={Number(value) > 50 ? "bg-forest" : "bg-peach"} /></div>)}
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
