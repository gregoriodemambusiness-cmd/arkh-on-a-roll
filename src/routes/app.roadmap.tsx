import { Map, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";
import { useProject, updateProject } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";

function Roadmap() {
  const proj = useProject();
  const user = useUser();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!proj) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const toggle = (phaseKey: string, idx: number) => {
    updateProject((p) => ({
      ...p,
      roadmap: p.roadmap.map((ph) =>
        ph.key !== phaseKey
          ? ph
          : { ...ph, items: ph.items.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)) }
      ),
    }));
  };

  const runAI = async () => {
    const plan = user?.plan ?? "free";
    const usage = checkUsageLimit(plan);
    if (!usage.allowed) { setAiResult("Limite chiamate AI raggiunto. Upgrada il piano."); return; }

    setAiLoading(true);
    setAiResult(null);
    incrementUsage();
    const roadmapSummary = proj.roadmap.map((ph) => {
      const done = ph.items.filter((i) => i.done).length;
      const pending = ph.items.filter((i) => !i.done).map((i) => i.t);
      return `${ph.label}: ${done}/${ph.items.length} completati. Da fare: ${pending.join(", ") || "tutto completato"}`;
    }).join("\n");

    const result = await askCoFounder(
      "Analizza SOLO i dati reali forniti. Se un dato non è disponibile di' esplicitamente che non è ancora nel progetto. Struttura la risposta con: 1. Situazione attuale della roadmap basata sui dati reali. 2. Almeno 3 punti critici numerati su cosa è realistico e cosa non lo è. 3. Piano d'azione step by step con almeno 5 step concreti per i prossimi 30 giorni. 4. Una sola azione da fare nelle prossime 2 ore. Minimo 250 parole. Testo plain, no markdown, no asterischi.",
      [
        `Progetto: ${proj.name}`,
        `Fase attuale: ${proj.onboarding.stage}`,
        `Roadmap:\n${roadmapSummary}`,
      ].join("\n"),
    );
    setAiLoading(false);
    setAiResult(result.ok ? result.text : `Errore: ${result.error}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Roadmap 30 / 60 / 90"
        subtitle="Validazione, MVP, lancio. Clicca per spuntare."
        action={
          <button
            onClick={runAI}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {aiLoading ? "Analisi…" : "Ottimizza con AI"}
          </button>
        }
      />

      {aiResult && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-[13.5px] leading-relaxed">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Suggerimenti AI
          </div>
          {aiResult}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {proj.roadmap.map((p) => {
          const done = p.items.filter((i) => i.done).length;
          const pct = Math.round((done / p.items.length) * 100);
          return (
            <Card key={p.key}>
              <CardHeader title={p.label} icon={Map} action={<Pill>{done}/{p.items.length}</Pill>} />
              <ProgressBar value={pct} />
              <div className="mt-4 space-y-2">
                {p.items.map((i, idx) => (
                  <button
                    key={i.t}
                    onClick={() => toggle(p.key, idx)}
                    className={`flex w-full items-center justify-between rounded-lg border bg-surface/60 p-2.5 text-left text-[13px] transition hover:border-foreground/20 ${i.done ? "border-success/30 line-through opacity-70" : "border-border"}`}
                  >
                    <span>{i.t}</span>
                    <Pill tone={i.done ? "ok" : "muted"}>{i.done ? "Fatto" : "Da fare"}</Pill>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Roadmap;
