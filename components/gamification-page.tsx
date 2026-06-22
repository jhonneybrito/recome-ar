"use client";

import { Award, Check, ChevronRight, Flame, Gift, LockKeyhole, Sparkles, Star, Trophy } from "lucide-react";
import AppShell from "./app-shell";
import { Button, Card, Pill, ProgressBar } from "./ui";
import { getBadges, getLevel } from "@/lib/gamification";
import { useGamification } from "@/lib/gamification-storage";

const categoryColors = {
  organização: "bg-mist text-forest",
  economia: "bg-light text-ink",
  dívidas: "bg-peach/20 text-[#8a4c2d]",
  aprendizado: "bg-cream text-ink",
};

export default function GamificationPage() {
  const { state, completeMission } = useGamification();
  const completed = state.missions.filter((mission) => mission.completed).length;
  const progress = completed / state.missions.length * 100;
  const level = getLevel(state.points);
  const levelProgress = Math.min(100, (state.points - level.min) / (level.next - level.min) * 100);
  const badges = getBadges(state);

  return (
    <AppShell title="Jornada semanal" subtitle="Pequenas ações consistentes valem mais do que mudanças impossíveis.">
      <div className="grid gap-5">
        <section className="relative overflow-hidden rounded-[32px] bg-forest p-7 text-white sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[44px] border-white/5"/>
          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div><Pill tone="peach"><Sparkles size={13} className="mr-1"/> Semana {state.weekKey.split("-W")[1]}</Pill><h2 className="mt-5 max-w-2xl font-display text-4xl sm:text-5xl">Seu dinheiro muda quando seus hábitos mudam.</h2><p className="mt-4 max-w-2xl leading-7 text-white/60">Complete as missões, acumule pontos e construa uma sequência. Não é sobre perfeição — é sobre voltar toda semana.</p></div>
            <div className="rounded-[24px] bg-white/10 p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-white/45">Progresso da semana</span><b>{completed}/{state.missions.length}</b></div><div className="mt-4"><ProgressBar value={progress} color="bg-light"/></div><p className="mt-4 text-xs text-white/50">{completed === state.missions.length ? "Bônus de 150 pontos conquistado!" : `Faltam ${state.missions.length-completed} missões para o bônus.`}</p></div>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-3">
          <Card><div className="flex items-center justify-between"><Star className="text-peach"/><Pill tone="neutral">Total</Pill></div><p className="mt-5 font-display text-4xl">{state.points}</p><p className="mt-1 text-xs font-bold text-ink/40">pontos acumulados</p></Card>
          <Card className="bg-light"><Flame className="text-forest"/><p className="mt-5 font-display text-4xl">{state.streak}</p><p className="mt-1 text-xs font-bold text-ink/45">{state.streak === 1 ? "semana seguida" : "semanas seguidas"}</p></Card>
          <Card><Trophy className="text-forest"/><p className="mt-5 font-display text-3xl">{level.name}</p><div className="mt-4"><ProgressBar value={levelProgress}/></div><p className="mt-2 text-xs text-ink/40">{Math.max(0,level.next-state.points)} pontos para o próximo nível</p></Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <section>
            <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Missões desta semana</p><h2 className="mt-2 font-display text-3xl">Ações que cabem na vida real</h2></div><span className="text-xs font-bold text-ink/40">Renovam toda segunda</span></div>
            <div className="grid gap-4">
              {state.missions.map((mission) => (
                <Card key={mission.id} className={`p-5 transition ${mission.completed ? "bg-mist opacity-75" : ""}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${mission.completed ? "bg-forest text-white" : categoryColors[mission.category]}`}>{mission.completed ? <Check/> : <Award/>}</span>
                    <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`font-display text-2xl ${mission.completed ? "line-through" : ""}`}>{mission.title}</h3><Pill tone="neutral">+{mission.points} pts</Pill></div><p className="mt-1 text-sm leading-6 text-ink/50">{mission.description}</p></div>
                    <Button variant={mission.completed ? "secondary" : "primary"} disabled={mission.completed} onClick={() => completeMission(mission.id)} className="shrink-0 disabled:opacity-70">{mission.completed ? "Concluída" : <>Concluir <ChevronRight size={16}/></>}</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <aside className="grid content-start gap-5">
            <Card className="p-6"><div className="flex items-center gap-3"><Gift className="text-peach"/><h2 className="font-display text-2xl">Conquistas</h2></div><div className="mt-5 grid gap-4">{badges.map((badge)=><div key={badge.name} className={`flex items-center gap-3 rounded-2xl p-3 ${badge.unlocked?"bg-light":"bg-ink/5 opacity-55"}`}><span className={`grid h-10 w-10 place-items-center rounded-full ${badge.unlocked?"bg-forest text-white":"bg-white text-ink/35"}`}>{badge.unlocked?<Trophy size={17}/>:<LockKeyhole size={17}/>}</span><div><b className="text-sm">{badge.name}</b><p className="text-[11px] text-ink/45">{badge.description}</p></div></div>)}</div></Card>
            <Card className="bg-peach p-6"><Flame/><p className="mt-5 text-xs font-bold uppercase tracking-wider text-ink/50">Bônus da semana</p><p className="mt-2 font-display text-3xl">+150 pontos</p><p className="mt-2 text-sm leading-6 text-ink/60">Conclua as quatro missões para receber o bônus e aumentar sua sequência.</p></Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
