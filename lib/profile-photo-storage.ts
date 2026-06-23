"use client";

import { useCallback, useEffect, useState } from "react";

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
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const updatePhoto = useCallback((next: string) => {
    setPhoto(next);
    saveProfilePhoto(next);
  }, []);

  return { photo, updatePhoto };
}
