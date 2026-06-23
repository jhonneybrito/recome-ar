"use client";

import { useCallback, useEffect, useState } from "react";

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
export function loadGoals(): GoalRecord[] { if(typeof window==="undefined")return[];try{return JSON.parse(window.localStorage.getItem(KEY)||"[]")}catch{return[]} }
export function hasStoredGoals(){return typeof window!=="undefined"&&window.localStorage.getItem(KEY)!==null}
export const saveGoals=(items:GoalRecord[])=>{window.localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event("recomecar:goals-updated"))};
export function useGoals(){
  const[goals,setGoals]=useState<GoalRecord[]>([]);
  const[initialized,setInitialized]=useState(false);const[ready,setReady]=useState(false);
  useEffect(()=>{const sync=()=>{setGoals(loadGoals());setInitialized(hasStoredGoals());setReady(true)};sync();window.addEventListener("storage",sync);window.addEventListener("recomecar:goals-updated",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("recomecar:goals-updated",sync)}},[]);
  const upsertGoal=useCallback((goal:Omit<GoalRecord,"id">,id?:string)=>{const current=loadGoals();const next=id?current.map((item)=>item.id===id?{...goal,id}:item):[{...goal,id:crypto.randomUUID()},...current];setGoals(next);saveGoals(next)},[]);
  const removeGoal=useCallback((id:string)=>{const next=loadGoals().filter((item)=>item.id!==id);setGoals(next);saveGoals(next)},[]);
  return{goals,upsertGoal,removeGoal,initialized,ready};
}
