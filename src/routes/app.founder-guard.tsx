import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";
import { useProject, resolveAlert } from "@/lib/projectStore";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/app/founder-guard")({
  head: () => ({ meta: [{ title: "Founder Guard — ARKHEON AI" }] }),
  component: FounderGuard,
});

function FounderGuard() {
  const proj = useProject();
  if (!proj) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const open = proj.founderAlerts.filter((a) => !a.resolved);
  const resolved = proj.founderAlerts.filter((a) => a.resolved);
  const weight = (s: string) => (s === "Alta" ? 20 : s === "Media" ? 12 : 6);
  const score = Math.min(100, open.reduce((a, b) => a + weight(b.severity), 0));
  const tone = score >= 50 ? "warn" : score >= 25 ? "brand" : "ok";
  const label = score >= 50 ? "Alto" : score >= 25 ? "Medio" : "Basso";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Founder Guard" subtitle="Errori da evitare. Protezione attiva sulle decisioni critiche." />

      <Card>
        <CardHeader title="Risk Score" icon={ShieldAlert} action={<Pill tone={tone}>{score} / 100 — {label}</Pill>} />
        <ProgressBar value={score} tone={tone === "ok" ? "ok" : tone === "warn" ? "warn" : "brand"} />
        <p className="mt-3 text-[13px] text-muted-foreground">Più basso è meglio. Risolvi gli alert per ridurre il rischio.</p>
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
