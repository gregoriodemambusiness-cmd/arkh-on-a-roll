import { ShieldAlert, AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";
import { useProject, resolveAlert, computeHealth, analyzeBudget } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";
import { motion, AnimatePresence } from "framer-motion";

function FounderGuard() {
  const proj = useProject();
  const user = useUser();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!proj) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const open = proj.founderAlerts.filter((a) => !a.resolved);
  const resolved = proj.founderAlerts.filter((a) => a.resolved);
  const weight = (s: string) => (s === "Alta" ? 20 : s === "Media" ? 12 : 6);
  const score = Math.min(100, open.reduce((a, b) => a + weight(b.severity), 0));
  const tone = score >= 50 ? "warn" : score >= 25 ? "brand" : "ok";
  const label = score >= 50 ? "Alto" : score >= 25 ? "Medio" : "Basso";

  const runAI = async () => {
    const plan = user?.plan ?? "free";
    const usage = checkUsageLimit(plan);
    if (!usage.allowed) { setAiResult("Limite chiamate AI raggiunto. Upgrada il piano."); return; }

    setAiLoading(true);
    setAiResult(null);
    const { score: hs } = computeHealth(proj);
    const b = analyzeBudget(proj);
    incrementUsage();
    const result = await askCoFounder(
      "Analizza SOLO i dati reali forniti. Se un dato non è disponibile di' esplicitamente che non è ancora nel progetto invece di inventare numeri. Struttura la risposta con: 1. Situazione attuale basata sui dati reali. 2. Almeno 3 punti critici numerati con soluzione specifica per ognuno. 3. Piano d'azione step by step con almeno 5 step concreti. 4. Una sola azione da fare nelle prossime 2 ore. Minimo 250 parole. Testo plain, no markdown, no asterischi.",
      [
        `Nome: ${proj.name}`,
        `Fase: ${proj.onboarding.stage}`,
        `Budget: ${b.available}€, rischio: ${b.risk}`,
        `Health Score: ${hs}/100`,
        `Task aperti: ${proj.tasks.filter((t) => t.status !== "Completato").length}`,
        `Target: ${proj.blueprint?.target}`,
        `Alert attivi: ${open.map((a) => `${a.title} (${a.severity})`).join(", ")}`,
      ].join("\n"),
    );
    setAiLoading(false);
    setAiResult(result.ok ? result.text : `Errore: ${result.error}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Founder Guard" subtitle="Errori da evitare. Protezione attiva sulle decisioni critiche." />

      <Card>
        <CardHeader title="Risk Score" icon={ShieldAlert} action={<Pill tone={tone}>{score} / 100 — {label}</Pill>} />
        <ProgressBar value={score} tone={tone === "ok" ? "ok" : tone === "warn" ? "warn" : "brand"} />
        <p className="mt-3 text-[13px] text-muted-foreground">Più basso è meglio. Risolvi gli alert per ridurre il rischio.</p>
      </Card>

      {/* AI Analysis */}
      <Card>
        <CardHeader title="Analisi AI" icon={Sparkles} subtitle="Identificazione rischi critici con Claude" />
        <button
          onClick={runAI}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {aiLoading ? "Analisi in corso…" : "Analizza con AI"}
        </button>
        {aiResult && (
          <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4 text-[13.5px] leading-relaxed">
            {aiResult}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Alert attivi" icon={AlertTriangle} action={<Pill tone="warn">{open.length}</Pill>} />
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {open.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-2 rounded-xl border border-border bg-surface/60 p-3 md:grid-cols-[80px_110px_1fr_auto] md:items-center"
              >
                <Pill tone={r.severity === "Alta" ? "warn" : r.severity === "Media" ? "brand" : "muted"}>{r.severity}</Pill>
                <span className="text-[12.5px] text-muted-foreground">{r.area}</span>
                <div>
                  <div className="text-[13.5px] font-medium">{r.title}</div>
                  <div className="text-[12.5px] text-muted-foreground">{r.explanation}</div>
                  <div className="mt-1 text-[12.5px]"><span className="text-foreground">→</span> {r.advice}</div>
                </div>
                <button onClick={() => resolveAlert(r.id)} className="text-[12.5px] font-medium text-brand hover:underline">
                  Correggi
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {open.length === 0 && (
            <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-[13.5px] text-success">
              Nessun alert attivo. Continua così.
            </div>
          )}
        </div>
      </Card>

      {resolved.length > 0 && (
        <Card>
          <CardHeader title="Risolti" icon={CheckCircle2} action={<Pill tone="ok">{resolved.length}</Pill>} />
          <ul className="space-y-1.5 text-[13px] text-muted-foreground">
            {resolved.map((r) => (
              <li key={r.id} className="flex items-center gap-2 line-through">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {r.title}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default FounderGuard;
