import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";

export const Route = createFileRoute("/app/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — ARKHEON AI" }] }),
  component: Roadmap,
});

const phases = [
  { p: "Validazione", d: "30 giorni", v: 60, items: [
    { t: "20 interviste utente", s: "In corso" },
    { t: "Landing + waitlist", s: "Completato" },
    { t: "Test pricing 3 punti", s: "Da fare" },
  ]},
  { p: "MVP", d: "60 giorni", v: 25, items: [
    { t: "Setup auth + DB", s: "Da fare" },
    { t: "Flusso core AI", s: "Da fare" },
    { t: "Stripe checkout", s: "Da fare" },
  ]},
  { p: "Lancio", d: "90 giorni", v: 5, items: [
    { t: "Launch plan e PR", s: "Da fare" },
    { t: "Press kit + media", s: "Da fare" },
    { t: "Primi 100 utenti", s: "Da fare" },
  ]},
];

function Roadmap() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Roadmap 30 / 60 / 90" subtitle="Validazione, MVP, lancio." />
      <div className="grid gap-4 lg:grid-cols-3">
        {phases.map((p) => (
          <Card key={p.p}>
            <CardHeader title={p.p} icon={Map} action={<Pill>{p.d}</Pill>} />
            <ProgressBar value={p.v} />
            <div className="mt-4 space-y-2">
              {p.items.map((i) => (
                <div key={i.t} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 p-2.5 text-[13px]">
                  <span>{i.t}</span>
                  <Pill tone={i.s === "Completato" ? "ok" : i.s === "In corso" ? "brand" : "muted"}>{i.s}</Pill>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
