"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteGoalDb, getGoalsDb, saveGoalDb } from "./db";
import { isSupabaseConfigured } from "./supabase/config";

export interface GoalRecord {
  id: string;
  name: string;
  category: string;
  target: number;
  current: number;
  monthlyContribution: number;
  targetDate: string;
}

const KEY = "recomecar:goals:v1";
const PROFILE_KEY = "recomecar:financial-profile:v1";
export function loadGoals(): GoalRecord[] { if(typeof window==="undefined"||isSupabaseConfigured)return[];try{return JSON.parse(window.localStorage.getItem(KEY)||"[]")}catch{return[]} }
export function hasStoredGoals(){return typeof window!=="undefined"&&!isSupabaseConfigured&&window.localStorage.getItem(KEY)!==null}
export const saveGoals=(items:GoalRecord[])=>{if(typeof window==="undefined"||isSupabaseConfigured)return;window.localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event("recomecar:goals-updated"))};
function syncPatrimony(items:GoalRecord[]){
  if(isSupabaseConfigured)return;
  const patrimony=items.find((item)=>item.category==="Patrimônio");
  if(!patrimony)return;
  try{
    const profile=JSON.parse(window.localStorage.getItem(PROFILE_KEY)||"{}");
    window.localStorage.setItem(PROFILE_KEY,JSON.stringify({...profile,accumulatedNetWorth:patrimony.current,netWorthGoal:patrimony.target,updatedAt:new Date().toISOString()}));
    window.dispatchEvent(new Event("recomecar:profile-updated"));
  }catch{}
}
export function useGoals(){
  const[goals,setGoals]=useState<GoalRecord[]>([]);
  const[initialized,setInitialized]=useState(false);const[ready,setReady]=useState(false);
  useEffect(()=>{
    if(isSupabaseConfigured){setGoals([]);setInitialized(false);getGoalsDb().then((remote)=>{setGoals(remote||[]);setInitialized(true);setReady(true)}).catch((error)=>{console.error(error);setReady(true)});return;}
    const sync=()=>{setGoals(loadGoals());setInitialized(hasStoredGoals());setReady(true)};sync();window.addEventListener("storage",sync);window.addEventListener("recomecar:goals-updated",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("recomecar:goals-updated",sync)}
  },[]);
  const refreshRemote=useCallback(async()=>{const remote=await getGoalsDb();if(remote){setGoals(remote);setInitialized(true)}return remote},[]);
  const upsertGoal=useCallback(async(goal:Omit<GoalRecord,"id">,id?:string)=>{if(isSupabaseConfigured){await saveGoalDb(goal,id);await refreshRemote();return}const current=loadGoals();const next=id?current.map((item)=>item.id===id?{...goal,id}:item):[{...goal,id:crypto.randomUUID()},...current];setGoals(next);saveGoals(next);syncPatrimony(next)},[refreshRemote]);
  const removeGoal=useCallback(async(id:string)=>{if(isSupabaseConfigured){await deleteGoalDb(id);await refreshRemote();return}const next=loadGoals().filter((item)=>item.id!==id);setGoals(next);saveGoals(next)},[refreshRemote]);
  return{goals,upsertGoal,removeGoal,initialized,ready};
}
