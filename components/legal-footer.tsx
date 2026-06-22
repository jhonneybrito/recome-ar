import Link from "next/link";

export default function LegalFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer className={`border-t px-5 py-8 ${dark ? "border-white/10 bg-ink text-white" : "border-ink/10 bg-white text-ink"}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className={dark ? "text-white/40" : "text-ink/40"}>© 2026 Recomeçar. Organização e educação financeira.</p>
        <nav className={`flex flex-wrap gap-x-5 gap-y-3 font-bold ${dark ? "text-white/60" : "text-ink/55"}`} aria-label="Links jurídicos">
          <Link href="/terms">Termos</Link>
          <Link href="/privacy">Privacidade</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/contact">Contato</Link>
        </nav>
      </div>
    </footer>
  );
}
