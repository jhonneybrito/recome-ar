"use client";

import { useCallback, useEffect, useState } from "react";
import { createInitialGamification, defaultMissions, getWeekKey, type GamificationState } from "./gamification";

const STORAGE_KEY = "recomecar:gamification:v1";

const previousWeekKey = (weekKey: string) => {
  const [yearText, weekText] = weekKey.split("-W");
  let year = Number(yearText);
  let week = Number(weekText) - 1;
  if (week < 1) { year -= 1; week = 52; }
  return `${year}-W${String(week).padStart(2, "0")}`;
};

export function loadGamification(): GamificationState {
  if (typeof window === "undefined") return createInitialGamification();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const state: GamificationState = saved ? JSON.parse(saved) : createInitialGamification();
    const currentWeek = getWeekKey();
    if (state.weekKey !== currentWeek) {
      const completedLastWeek = state.weeklyBonusClaimed;
      return {
        ...state,
        weekKey: currentWeek,
        weeklyBonusClaimed: false,
        streak: completedLastWeek && state.weekKey === previousWeekKey(currentWeek) ? state.streak : 0,
        missions: defaultMissions(),
      };
    }
    return state;
  } catch {
    return createInitialGamification();
  }
}

export function saveGamification(state: GamificationState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("recomecar:gamification-updated"));
}

export function useGamification() {
  const [state, setState] = useState<GamificationState>(createInitialGamification());

  useEffect(() => {
    const sync = () => setState(loadGamification());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("recomecar:gamification-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("recomecar:gamification-updated", sync);
    };
  }, []);

  const completeMission = useCallback((id: string) => {
    const current = loadGamification();
    const mission = current.missions.find((item) => item.id === id);
    if (!mission || mission.completed) return;
    const missions = current.missions.map((item) => item.id === id ? { ...item, completed: true } : item);
    const allCompleted = missions.every((item) => item.completed);
    const bonus = allCompleted && !current.weeklyBonusClaimed ? 150 : 0;
    const next = {
      ...current,
      missions,
      points: current.points + mission.points + bonus,
      weeklyBonusClaimed: allCompleted || current.weeklyBonusClaimed,
      streak: allCompleted && !current.weeklyBonusClaimed ? current.streak + 1 : current.streak,
      lastCompletedWeek: allCompleted ? current.weekKey : current.lastCompletedWeek,
    };
    setState(next);
    saveGamification(next);
  }, []);

  return { state, completeMission };
}
