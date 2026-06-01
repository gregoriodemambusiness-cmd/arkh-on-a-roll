import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowRight, Building2 } from "lucide-react";

export const Route = createFileRoute("/enterprise")({
  head: () => ({ meta: [{ title: "Enterprise — ARKHEON AI" }] }),
  component: Enterprise,
});

function Enterprise() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5">
          <Link to="/"><Logo size={22} /></Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px]"><Building2 className="h-3 w-3 text-brand" /> Enterprise</div>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">Per team, incubatori, scuole e startup studio.</h1>
          <p className="mt-4 max-w-md text-[15px] text-muted-foreground">Progetti su misura, ruoli personalizzati, dashboard admin, portfolio multi-progetto, integrazioni custom e supporto dedicato.</p>
          <ul className="mt-6 space-y-2 text-[14px] text-muted-foreground">
            {["Workspace e ruoli personalizzati","Portfolio multi-progetto","Workflow & integrazioni custom","Report organizzazione","Funding monitor avanzato","Onboarding e SLA dedicati"].map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          {!sent ? (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Richiedi una demo</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Nome" required />
                <Input label="Cognome" required />
              </div>
              <Input label="Email aziendale" type="email" required />
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Azienda" required />
                <Input label="Ruolo" required />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Numero utenti" required />
                <Select label="Tipo organizzazione" options={["Azienda","Incubatore","Acceleratore","Scuola","Università","Startup studio","Altro"]} />
              </div>
              <Textarea label="Messaggio" rows={3} />
              <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-[14px] font-medium text-background hover:opacity-90">
                Richiedi una demo <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">✓</div>
              <h2 className="mt-4 font-display text-xl font-semibold">Grazie!</h2>
              <p className="mt-2 text-[14px] text-muted-foreground">Ti contatteremo per configurare il piano Enterprise più adatto alla tua organizzazione.</p>
              <Link to="/" className="mt-6 inline-flex text-[13.5px] text-brand">Torna alla home</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Input({ label, ...rest }: any) {
  return <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span><input {...rest} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" /></label>;
}
function Textarea({ label, ...rest }: any) {
  return <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span><textarea {...rest} className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" /></label>;
}
function Select({ label, options }: any) {
  return <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span><select className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand">{options.map((o: string) => <option key={o}>{o}</option>)}</select></label>;
}
