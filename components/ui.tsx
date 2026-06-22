import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Recomeçar — página inicial" className="group inline-flex items-center gap-3">
      <svg className="h-11 w-11 overflow-visible" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M38.7 13.4A18 18 0 1 0 40.2 32" stroke="#174C3F" strokeWidth="6" strokeLinecap="round"/>
        <path d="M14.5 29.5 22 22l5.2 5.2L39 15.5" stroke="#FF7658" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="39" cy="15" r="3.6" fill="#DDF36A" stroke="#102D27" strokeWidth="2"/>
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.22rem] font-extrabold tracking-[-0.055em] text-ink">recomeçar<span className="text-peach">.</span></span>
          <span className="mt-1 text-[8px] font-extrabold uppercase tracking-[.24em] text-ink/45">clareza para seguir</span>
        </span>
      )}
    </Link>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-forest text-white hover:bg-ink shadow-lg shadow-forest/15",
    secondary: "bg-cream text-ink hover:bg-mist",
    ghost: "bg-transparent text-ink hover:bg-black/5",
  };
  return (
    <button className={`focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink/80">
      {label}
      <input className={`focus-ring w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 font-medium placeholder:text-ink/35 ${className}`} {...props} />
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  const hasCustomBackground = /(?:^|\s)!?bg-/.test(className);
  return <div className={`rounded-[28px] border border-ink/8 p-5 shadow-sm ${hasCustomBackground ? "" : "bg-white"} ${className}`}>{children}</div>;
}

export function ProgressBar({ value, color = "bg-forest" }: { value: number; color?: string }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-ink/8">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function Pill({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "peach" | "neutral" }) {
  const colors = { green: "bg-mist text-forest", peach: "bg-peach/25 text-[#8a4c2d]", neutral: "bg-ink/5 text-ink/65" };
  return <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold ${colors[tone]}`}>{children}</span>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="grid min-h-56 place-items-center border-dashed text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-forest"><Sparkles size={20} /></div>
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/55">{text}</p>
        <Button className="mt-5">Começar agora <ArrowRight size={16} /></Button>
      </div>
    </Card>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return <li className="flex items-start gap-3 text-sm leading-6 text-ink/70"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage/20 text-forest"><Check size={13} strokeWidth={3} /></span>{children}</li>;
}
