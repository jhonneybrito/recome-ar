"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { saveProfileDb } from "./db";
import { loadFinancialProfile } from "./financial-storage";

const KEY = "recomecar:profile-photo:v1";
const EVENT = "recomecar:profile-photo-updated";

export function loadProfilePhoto() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) || "";
}

export function saveProfilePhoto(photo: string) {
  if (photo) window.localStorage.setItem(KEY, photo);
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useProfilePhoto() {
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const sync = () => setPhoto(loadProfilePhoto());
    sync();
    const supabase = createClient();
    if (supabase) supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("user_id", data.user.id).maybeSingle();
      if (profile?.avatar_url) { setPhoto(profile.avatar_url); saveProfilePhoto(profile.avatar_url); }
    }).catch(console.error);
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const updatePhoto = useCallback(async (next: string) => {
    const supabase = createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let avatarUrl = "";
        if (next.startsWith("data:")) {
          const blob = await (await fetch(next)).blob();
          const path = `${user.id}/avatar-${Date.now()}.${blob.type.split("/")[1] || "jpg"}`;
          const { error } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true });
          if (error) throw error;
          avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
        }
        if (!next) {
          const { data: files } = await supabase.storage.from("avatars").list(user.id);
          if (files?.length) await supabase.storage.from("avatars").remove(files.map((file) => `${user.id}/${file.name}`));
        }
        await saveProfileDb(loadFinancialProfile(), avatarUrl);
        setPhoto(avatarUrl);
        saveProfilePhoto(avatarUrl);
        return;
      }
    }
    setPhoto(next);
    saveProfilePhoto(next);
  }, []);

  return { photo, updatePhoto };
}
