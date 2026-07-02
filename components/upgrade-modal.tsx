"use client";

import { CheckCircle2, X } from "lucide-react";
import { Button } from "./ui";

export default function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void; resource: string }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/50 p-4" role="dialog" aria-label="Acesso liberado"><div className="w-full max-w-md rounded-[30px] bg-white p-7 text-center"><button onClick={onClose} aria-label="Fechar" className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-ink/5"><X size={17}/></button><span className="mx-auto mt-2 grid h-14 w-14 place-items-center rounded-2xl bg-mist text-forest"><CheckCircle2/></span><h2 className="mt-5 font-display text-4xl">Acesso liberado.</h2><p className="mt-4 text-sm leading-7 text-ink/55">Nesta fase do Recomeçar, sua experiência está liberada para continuar organizando suas finanças sem interrupções comerciais.</p><Button onClick={onClose} className="mt-6 w-full">Continuar</Button></div></div>;
}
