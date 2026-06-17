"use client";
import { useState } from "react";
import { Lightbulb, Sparkles, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Button, ScoreRing, ProgressBar } from "@/components/app/ui";
import { useUser } from "@/lib/mockAuth";
import { useProject } from "@/lib/projectStore";
import { useNavigate } from "@/lib/nextCompat";

function IdeaLab() {
  const user = useUser();
  const proj = useProject();
  const nav = useNavigate();
  const [idea, setIdea] = useState(user?.project?.idea || proj?.blueprint?.solution || "");
  const [analyzed, setAnalyzed] = useState(true);

  const opportunities: string[] = [
    "Mercato in crescita +18% YoY",
    "Competitor focalizzati su enterprise",
    "Gap: pricing trasparente e onboarding rapido",
  ];

  const risks: { title: string }[] = proj?.founderAlerts?.filter((a) => !a.resolved).slice(0, 3).map((a) => ({ title: a.title }))
    ?? [
      { title: "CAC potenzialmente elevato" },
      { title: "Necessaria integrazione con strumenti esistenti" },
      { title: "Vincoli normativi sul trattamento dati" },
    ];

  const healthScore = proj ? Math.round(
    (proj.budgetAvailable > 5000 ? 15 : 0) +
    (proj.blueprint?.target ? 20 : 0) +
    (proj.blueprint?.solution ? 20 : 0) +
    (proj.blueprint?.problem ? 15 : 0) +
    (proj.onelinePitch ? 10 : 0) +
    ((proj.validation?.interviews?.length ?? 0) > 0 ? 20 : 0)
  ) : 76;

  const nextAction = proj?.tasks?.find((t) => t.status !== "Completato");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Idea Lab"
        subtitle="Analizza idea, problema, target, opportunita, rischi e prossima azione."
        action={<Button onClick={() => setAnalyzed(true)}><Sparkles className="h-3.5 w-3.5" /> Rianalizza</Button>}
      />

      <Card>
        <CardHeader title="La tua idea" icon={Lightbulb} />
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="Descrivi la tua idea in poche righe..."
          className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-[14.5px] outline-none focus:border-brand"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={() => setAnalyzed(true)}>
            Analizza idea <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {analyzed && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Health Score */}
          <Card className="flex flex-col items-start gap-3">
            <CardHeader title="Health Score" subtitle="Forza dell'idea" />
            <ScoreRing value={healthScore} size={110} />
            <p className="text-[12.5px] text-muted-foreground">
              Buono, ma serve{" "}
              <button className="text-brand underline-offset-2 hover:underline" onClick={() => nav({ to: "/app/validation" })}>
                validazione concreta
              </button>.
            </p>
          </Card>

          {/* Opportunita */}
          <Card>
            <CardHeader title="Opportunita" icon={Target} />
            <ul className="space-y-2.5">
              {opportunities.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {o}
                </li>
              ))}
            </ul>
          </Card>

          {/* Rischi */}
          <Card>
            <CardHeader title="Rischi" icon={Lightbulb} />
            <ul className="space-y-2.5">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {r.title}
                </li>
              ))}
            </ul>
          </Card>

          {/* Problema → Soluzione */}
          <Card className="md:col-span-2">
            <CardHeader title="Problema → Soluzione" icon={Lightbulb} />
            <div className="grid gap-3 md:grid-cols-2">
              <Block label="Problema" tone="destructive" body={proj?.blueprint?.problem || "Il target perde tempo settimanale su attivita ripetitive senza strumenti dedicati e con costi nascosti."} />
              <Block label="Soluzione" tone="brand" body={proj?.blueprint?.solution || "Una piattaforma che automatizza il flusso principale in 1 click, con pricing chiaro e ROI misurabile."} />
              <Block label="Target" tone="muted" body={proj?.blueprint?.target || "Freelance e team 2-10 persone in Europa, fascia 25-45 anni."} />
              <Block label="Differenziatore" tone="muted" body={proj?.blueprint?.valueProp || "Tempo di setup < 5 minuti e pricing a consumo equo, non per posto fisso."} />
            </div>
          </Card>

          {/* Prossima azione — dark card */}
          <Card className="flex flex-col justify-between" style={{ background: "oklch(0.15 0.02 287)", borderColor: "oklch(0.25 0.05 287)" }}>
            <div>
              <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/50">Prossima azione</div>
              <p className="text-[16px] font-semibold leading-snug text-white">
                {nextAction
                  ? nextAction.title
                  : "Pianifica 20 interviste utente nei prossimi 7 giorni."}
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => nav({ to: "/app/task-center" })}
                className="w-full rounded-xl bg-white py-2.5 text-[13.5px] font-medium text-foreground hover:opacity-90"
              >
                Apri Task <ArrowRight className="inline h-3.5 w-3.5" />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[12px] text-white/50">
                <CheckCircle2 className="h-3.5 w-3.5" /> Salvato nel progetto
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Block({ label, body, tone }: { label: string; body: string; tone: "brand" | "destructive" | "muted" }) {
  const labelColor = tone === "brand" ? "text-brand" : tone === "destructive" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3">
      <div className={`text-[10.5px] font-semibold uppercase tracking-wider ${labelColor}`}>{label}</div>
      <p className="mt-1.5 text-[13.5px]">{body}</p>
    </div>
  );
}

export default IdeaLab;
