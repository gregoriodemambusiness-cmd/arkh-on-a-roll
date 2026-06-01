import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@/lib/mockAuth";
import { BadgeCheck, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";

export const Route = createFileRoute("/app/plan")({
  head: () => ({ meta: [{ title: "Plan & Usage — ARKHEON AI" }] }),
  component: Plan,
});

function Plan() {
  const user = useUser();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Plan & Usage" subtitle="Ogni piano include un utilizzo equo pensato per la tua fase." />

      <Card>
        <CardHeader title="Piano attuale" icon={BadgeCheck}
          action={<Pill tone="brand">{(user?.plan ?? "free").toUpperCase()}</Pill>} />
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Capacità mensile</div>
            <div className="mt-1 font-display text-2xl font-semibold">Equa</div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Pensata per la fase del tuo progetto.</p>
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Utilizzo del mese</div>
            <ProgressBar value={42} />
            <p className="mt-1 text-[12.5px] text-muted-foreground">42% — utilizzo sano</p>
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Moduli più usati</div>
            <ul className="mt-1 text-[13px] text-muted-foreground">
              <li>1. Co-founder AI</li>
              <li>2. Task Center</li>
              <li>3. Budget Guard</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Suggerimento upgrade"
          action={<Pill tone="ok">Suggerito Pro</Pill>} />
        <p className="text-[13.5px] text-muted-foreground">
          Stai usando i moduli avanzati di blueprint e MVP. Il piano <b className="text-foreground">Pro</b> li include in versione completa.
        </p>
        <div className="mt-3 flex gap-2">
          <Button>Passa a Pro <ArrowUpRight className="h-3.5 w-3.5" /></Button>
          <Button variant="secondary">Confronta piani</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Metodo di pagamento" />
          <div className="rounded-lg border border-border bg-surface p-3 text-[13.5px]">Visa •••• 4242 — scade 09/27</div>
          <Button variant="secondary" className="mt-3">Aggiorna</Button>
        </Card>
        <Card>
          <CardHeader title="Fatture & storico" />
          <ul className="space-y-2 text-[13px]">
            {["Marzo 2026 · €49","Febbraio 2026 · €49","Gennaio 2026 · €0 (trial)"].map((r) => (
              <li key={r} className="flex justify-between rounded-lg border border-border bg-surface/60 px-3 py-2"><span>{r}</span><Link to="/app/plan" className="text-brand">Scarica</Link></li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Gestione abbonamento" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">Cambia piano</Button>
          <Button variant="ghost">Annulla abbonamento</Button>
        </div>
      </Card>
    </div>
  );
}
