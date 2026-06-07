import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbulb, Sparkles, ShieldCheck, Target, Lightbulb as LBIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";
import { useUser } from "@/lib/mockAuth";

export const Route = createFileRoute("/app/idea-lab")({
  head: () => ({ meta: [{ title: "Idea Lab — PILOT AI" }] }),
  component: IdeaLab,
});

function IdeaLab() {
  const user = useUser();
  const [idea, setIdea] = useState(user?.project?.idea || "");
  const [analyzed, setAnalyzed] = useState(true);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Idea Lab"
        subtitle="Analizza idea, problema, target, opportunità, rischi e prossima azione."
        action={<Button onClick={() => setAnalyzed(true)}><Sparkles className="h-3.5 w-3.5" /> Rianalizza</Button>}
      />

      <Card>
        <CardHeader title="La tua idea" icon={Lightbulb} />
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-[14.5px] outline-none focus:border-brand"
        />
        <div className="mt-3 flex justify-end"><Button onClick={() => setAnalyzed(true)}>Analizza idea</Button></div>
      </Card>

      {analyzed && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader title="Health Score" subtitle="Forza dell'idea" />
            <div className="font-display text-4xl font-semibold">76</div>
            <ProgressBar value={76} />
            <p className="mt-3 text-[12.5px] text-muted-foreground">Buono, ma serve validazione concreta.</p>
          </Card>
          <Card>
            <CardHeader title="Opportunità" icon={Target} />
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              <li>• Mercato in crescita +18% YoY</li>
              <li>• Competitor focalizzati su enterprise</li>
              <li>• Gap: pricing trasparente e onboarding rapido</li>
            </ul>
          </Card>
          <Card>
            <CardHeader title="Rischi" icon={ShieldCheck} />
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              <li>• CAC potenzialmente elevato</li>
              <li>• Necessaria integrazione con strumenti esistenti</li>
              <li>• Vincoli normativi sul trattamento dati</li>
            </ul>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader title="Problema → Soluzione" icon={LBIcon} />
            <div className="grid gap-3 md:grid-cols-2">
              <Block title="Problema" body="Il target perde tempo settimanale su attività ripetitive senza strumenti dedicati e con costi nascosti." />
              <Block title="Soluzione" body="Una piattaforma che automatizza il flusso principale in 1 click, con pricing chiaro e ROI misurabile." />
              <Block title="Target" body="Freelance e team 2–10 persone in Europa, fascia 25–45 anni." />
              <Block title="Differenziatore" body="Tempo di setup < 5 minuti e pricing a consumo equo, non per posto fisso." />
            </div>
          </Card>
          <Card>
            <CardHeader title="Prossima azione" />
            <p className="text-[14px]">Pianifica <b>20 interviste utente</b> nei prossimi 7 giorni.</p>
            <Button className="mt-4 w-full">Apri Task <ArrowRight className="h-3.5 w-3.5" /></Button>
            <div className="mt-3"><Pill tone="brand">Salvato nel progetto</Pill></div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <p className="mt-1 text-[13.5px]">{body}</p>
    </div>
  );
}
