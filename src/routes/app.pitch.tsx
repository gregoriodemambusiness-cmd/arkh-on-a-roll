import { createFileRoute } from "@tanstack/react-router";
import { Presentation, Mail, FileText, Sparkles } from "lucide-react";
import { Card, CardHeader, PageHeader, Button } from "@/components/app/ui";

export const Route = createFileRoute("/app/pitch")({
  head: () => ({ meta: [{ title: "Pitch Room — PILOT AI" }] }),
  component: PitchRoom,
});

function PitchRoom() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Pitch Room" subtitle="One-liner, elevator pitch, deck, one-pager, email investor e demo script."
        action={<Button><Sparkles className="h-3.5 w-3.5" /> Genera pitch</Button>} />

      <Card>
        <CardHeader title="One-line pitch" icon={Presentation} />
        <p className="font-display text-xl">PILOT AI è il co-founder AI che trasforma un'idea in una startup organizzata.</p>
      </Card>

      <Card>
        <CardHeader title="Elevator pitch (30s)" />
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">
          I founder hanno idee ma non sanno da dove partire: costruiscono troppo, spendono troppo presto e non validano.
          PILOT AI guida l'utente passo dopo passo dalla validazione al lancio, con Co-founder AI, Budget Guard, MVP Builder e Roadmap.
          Pricing semplice da 23€/mese.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Pitch deck (10 slide)" icon={FileText} />
          <ol className="space-y-1 text-[13.5px] text-muted-foreground">
            <li>1. Problema · 2. Soluzione · 3. Mercato · 4. Prodotto · 5. Trazione</li>
            <li>6. Business model · 7. GTM · 8. Competition · 9. Team · 10. Ask</li>
          </ol>
        </Card>
        <Card>
          <CardHeader title="Investor email" icon={Mail} />
          <p className="text-[13px] text-muted-foreground">Bozza pronta da inviare con allegato deck e link demo.</p>
          <Button variant="secondary" className="mt-3">Apri bozza</Button>
        </Card>
      </div>
    </div>
  );
}
