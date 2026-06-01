import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, Sparkles } from "lucide-react";
import { Card, CardHeader, PageHeader, Button } from "@/components/app/ui";

export const Route = createFileRoute("/app/blueprint")({
  head: () => ({ meta: [{ title: "Blueprint — ARKHEON AI" }] }),
  component: Blueprint,
});

const sections = [
  ["Mission", "Aiutiamo le persone con un'idea a trasformarla in una startup organizzata."],
  ["Vision", "Un mondo dove ogni idea ha la possibilità di essere validata prima di essere costruita."],
  ["Problema", "I founder costruiscono troppo presto, troppo in grande, e bruciano budget prima di validare."],
  ["Soluzione", "Un co-founder AI che guida passo dopo passo dalla validazione al lancio."],
  ["Target", "Founder, creator, studenti, freelance, team e incubatori."],
  ["Value Proposition", "Dalla tua idea alla tua startup, senza errori costosi."],
  ["Business Model", "SaaS in abbonamento. 4 piani + Enterprise."],
  ["Monetizzazione", "Free trial → Starter → Pro → Founder → Enterprise."],
  ["Vantaggio competitivo", "Co-founder AI contestuale + Founder Guard + Budget Guard."],
  ["MVP", "Idea Lab + Roadmap + Task + Co-founder AI."],
  ["Go-to-market", "Content + community founder + partnership con incubatori."],
];

function Blueprint() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Blueprint"
        subtitle="Il documento centrale della tua startup. Sempre aggiornato."
        action={
          <div className="flex gap-2">
            <Button variant="secondary"><Sparkles className="h-3.5 w-3.5" /> Aggiorna con AI</Button>
            <Button><Download className="h-3.5 w-3.5" /> Esporta PDF</Button>
          </div>
        }
      />
      <Card>
        <CardHeader title="Documento" icon={FileText} subtitle="11 sezioni — ultima modifica 2 ore fa" />
        <div className="divide-y divide-border">
          {sections.map(([k, v]) => (
            <div key={k} className="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
              <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="text-[14.5px] leading-relaxed">{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
