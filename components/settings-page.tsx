"use client";

import { Camera, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AppShell from "./app-shell";
import { Button, Card, Input } from "./ui";
import { useFinancialProfile } from "@/lib/financial-storage";
import { useProfilePhoto } from "@/lib/profile-photo-storage";

export default function SettingsPage() {
  const { profile, updateProfile } = useFinancialProfile();
  const { photo, updatePhoto } = useProfilePhoto();
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    setName(profile.name);
    setPreview(photo);
    try {
      const registration = JSON.parse(localStorage.getItem("recomecar:registration:v1") || "{}");
      setEmail(registration.email || "");
    } catch {}
    setPhone(localStorage.getItem("recomecar:phone") || "");
  }, [profile.name, photo]);

  const initials = (name || "Você").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  const choosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Para funcionar neste navegador, use uma imagem de até 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result || ""));
      setPhotoError("");
    };
    reader.readAsDataURL(file);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile({ ...profile, name: name.trim(), updatedAt: new Date().toISOString() });
    const previous = JSON.parse(localStorage.getItem("recomecar:registration:v1") || "{}");
    localStorage.setItem("recomecar:registration:v1", JSON.stringify({ ...previous, name: name.trim(), email: email.trim(), updatedAt: new Date().toISOString() }));
    localStorage.setItem("recomecar:phone", phone);
    updatePhoto(preview);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell title="Configurações" subtitle="Atualize os dados que identificam sua conta.">
      <div className="mx-auto max-w-3xl">
        <Card className="p-7">
          <h2 className="font-display text-3xl">Meu perfil</h2>
          <p className="mt-2 text-sm text-ink/45">As alterações ficam salvas neste navegador enquanto o Supabase não está conectado.</p>
          <form onSubmit={submit} className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
              <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-peach/35 text-2xl font-extrabold">
                {preview ? <img src={preview} alt="Pré-visualização da foto de perfil" className="h-full w-full object-cover"/> : initials}
              </span>
              <div className="grid gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cream px-5 py-3 text-sm font-bold transition hover:bg-mist">
                  <Camera size={17}/> {preview ? "Trocar foto" : "Escolher foto"}
                  <input className="sr-only" type="file" accept="image/*" onChange={choosePhoto}/>
                </label>
                {preview && <button type="button" onClick={() => { setPreview(""); setPhotoError(""); }} className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#9a532f]"><Trash2 size={16}/>Remover foto</button>}
                <p className="text-xs text-ink/40">JPG, PNG ou WebP de até 2 MB.</p>
                {photoError && <p role="alert" className="text-xs font-bold text-[#9a532f]">{photoError}</p>}
              </div>
            </div>
            <Input required label="Nome" value={name} onChange={(event) => setName(event.target.value)}/>
            <Input required type="email" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)}/>
            <Input label="Telefone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+55 11 99999-9999"/>
            <label className="grid gap-2 text-sm font-bold">Moeda<select className="rounded-2xl border border-ink/10 px-4 py-3.5"><option>Real brasileiro (R$)</option></select></label>
            <div className="sm:col-span-2"><Button type="submit">{saved ? "Alterações salvas" : "Salvar alterações"}</Button></div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
