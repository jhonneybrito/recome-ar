"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultFinancialProfile, type FinancialProfile } from "./financial-calculations";

const STORAGE_KEY = "recomecar:financial-profile:v1";

export function loadFinancialProfile(): FinancialProfile {
  if (typeof window === "undefined") return defaultFinancialProfile;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultFinancialProfile, ...JSON.parse(stored) } : defaultFinancialProfile;
  } catch {
    return defaultFinancialProfile;
  }
}

export function saveFinancialProfile(profile: FinancialProfile) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("recomecar:profile-updated"));
  }
}

export function useFinancialProfile() {
  const [profile, setProfile] = useState<FinancialProfile>(defaultFinancialProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setProfile(loadFinancialProfile());
    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener("recomecar:profile-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("recomecar:profile-updated", sync);
    };
  }, []);

  const updateProfile = useCallback((next: FinancialProfile) => {
    setProfile(next);
    saveFinancialProfile(next);
  }, []);

  return { profile, updateProfile, ready };
}
