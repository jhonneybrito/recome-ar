"use client";

import Link from "next/link";
import { ArrowRight, Check, Flame, Star } from "lucide-react";
import { useGamification } from "@/lib/gamification-storage";
import { getLevel } from "@/lib/gamification";
import { Card, ProgressBar } from "./ui";

export default function GamificationSummary() {
  const { state } = useGamification();
  const completed = state.missions.filter((mission) => mission.completed).length;
  const level = getLevel(state.points);

  return (
    <Card className="overflow-hidden bg-light p-6">
      <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-light"><Star size={19}/></span><div className="flex gap-3 text-xs font-bold text-ink/50"><span className="flex items-center gap-1"><Flame size={14}/>{state.streak}</span><span>{state.points} pts</span></div></div>
      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/45">Jornada semanal</p>
      <h2 className="mt-2 font-display text-3xl">{completed === state.missions.length ? "Semana concluída!" : `${completed} de ${state.missions.length} missões`}</h2>
      <div className="mt-4"><ProgressBar value={completed/state.missions.length*100} color="bg-forest"/></div>
      <p className="mt-3 text-xs text-ink/50"><Check size={13} className="mr-1 inline"/>Nível: {level.name}</p>
      <Link href="/journey" className="mt-5 flex items-center gap-2 text-sm font-extrabold text-forest">Ver minhas missões <ArrowRight size={16}/></Link>
    </Card>
  );
}
