"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { cashFlow } from "@/lib/mock-data";

export function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={cashFlow} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1F5C47" stopOpacity={0.25}/><stop offset="100%" stopColor="#1F5C47" stopOpacity={0}/></linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#14282112" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#14282166", fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 30px #14282120" }} formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`} />
        <Area type="monotone" dataKey="entradas" stroke="#1F5C47" strokeWidth={3} fill="url(#green)" />
        <Area type="monotone" dataKey="saidas" stroke="#F3B692" strokeWidth={3} fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
