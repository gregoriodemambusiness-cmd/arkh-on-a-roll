import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";

export const Route = createFileRoute("/app/founder-guard")({
  head: () => ({ meta: [{ title: "Founder Guard — ARKHEON AI" }] }),
  component: FounderGuard,
});

const risks = [
  { sev: "Alta", area: "MVP", t: "MVP troppo grande (18 feature pianificate)", reco: "Riduci a 3 funzioni essenziali e rilascia in 30 giorni." },
  { sev: "Alta", area: "Validation", t: "Sviluppo prima della validazione", reco: "Esegui 20 interviste prima di scrivere codice di produzione." },
  { sev: "Media", area: "Tool", t: "Stripe attivato prima del lancio", reco: "Disattiva fino a primo cliente reale per evitare costi inutili." },
  { sev: "Media", area: "Ruoli", t: "Ruoli del team non definiti", reco: "Definisci CEO/CTO/CMO anche se siete in 2." },
  { sev: "Bassa", area: "Pricing", t: "Pricing non testato", reco: "Testa 3 punti di prezzo nella landing waitlist." },
];

function FounderGuard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Founder Guard" subtitle="Errori da evitare. Protezione attiva sulle decisioni critiche." />

      <Card>
        <CardHeader title="Risk Score" icon={ShieldAlert} action={<Pill tone="warn">38 / 100 — Medio</Pill>} />
        <ProgressBar value={38} tone="warn" />
        <p className="mt-3 text-[13px] text-muted-foreground">Più basso è meglio. Riduci sviluppando prima validazione e pricing.</p>
      </Card>

      <Card>
        <CardHeader title="Alert" icon={AlertTriangle} action={<Pill tone="warn">{risks.length} segnalazioni</Pill>} />
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.t} className="grid gap-2 rounded-xl border border-border bg-surface/60 p-3 md:grid-cols-[100px_120px_1fr_auto] md:items-center">
              <Pill tone={r.sev === "Alta" ? "warn" : r.sev === "Media" ? "brand" : "muted"}>{r.sev}</Pill>
              <span className="text-[12.5px] text-muted-foreground">{r.area}</span>
              <div>
                <div className="text-[13.5px] font-medium">{r.t}</div>
                <div className="text-[12.5px] text-muted-foreground">→ {r.reco}</div>
              </div>
              <button className="text-[12.5px] text-brand hover:underline">Risolvi</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
