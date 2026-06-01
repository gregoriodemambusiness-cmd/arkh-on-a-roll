import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks, Sparkles, X, ArrowRight } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/app/task-center")({
  head: () => ({ meta: [{ title: "Task Center — ARKHEON AI" }] }),
  component: TaskCenter,
});

type Task = { id: string; t: string; col: string; d: string; p: "Alta" | "Media" | "Bassa"; why: string; steps: string[]; output: string };

const initial: Task[] = [
  { id: "1", t: "Definisci value proposition", col: "Da fare", d: "30m", p: "Alta",
    why: "Senza una proposta chiara, nessun messaggio funziona.", steps: ["Identifica il problema in 1 frase","Identifica il target in 1 frase","Scrivi la promessa di valore in 1 frase"], output: "1 frase chiara di posizionamento" },
  { id: "2", t: "Intervista 5 utenti target", col: "In corso", d: "2h", p: "Alta",
    why: "Le interviste rivelano i pattern del problema, non della soluzione.", steps: ["Prepara 5 domande aperte","Pianifica le call","Annota i pattern ricorrenti"], output: "Documento con 5 insight" },
  { id: "3", t: "Bozza landing page", col: "In corso", d: "1h", p: "Media",
    why: "Una landing semplice serve a misurare interesse.", steps: ["Scrivi hero + sotto-hero","Definisci CTA","Aggiungi email waitlist"], output: "Landing pubblicabile" },
  { id: "4", t: "Setup analytics base", col: "In revisione", d: "20m", p: "Bassa", why: "", steps: [], output: "" },
  { id: "5", t: "Logo v1", col: "Completato", d: "1h", p: "Media", why: "", steps: [], output: "" },
];

const cols = ["Da fare","In corso","In revisione","Completato"];

function TaskCenter() {
  const [tasks, setTasks] = useState(initial);
  const [open, setOpen] = useState<Task | null>(null);

  const move = (id: string, dir: 1 | -1) => {
    setTasks((ts) => ts.map((t) => {
      if (t.id !== id) return t;
      const i = cols.indexOf(t.col);
      return { ...t, col: cols[Math.max(0, Math.min(cols.length - 1, i + dir))] };
    }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Task Center" subtitle="Task guidati con obiettivo, perché e output atteso."
        action={<Button><Sparkles className="h-3.5 w-3.5" /> Genera task</Button>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cols.map((c) => (
          <Card key={c}>
            <CardHeader title={c} icon={ListChecks} action={<Pill>{tasks.filter(t=>t.col===c).length}</Pill>} />
            <div className="space-y-2">
              {tasks.filter(t => t.col === c).map((t) => (
                <div key={t.id} className="rounded-xl border border-border bg-surface/60 p-3 text-[13px]">
                  <div className="font-medium">{t.t}</div>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-muted-foreground">
                    <span>{t.d}</span>
                    <Pill tone={t.p === "Alta" ? "warn" : "muted"}>{t.p}</Pill>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button onClick={() => move(t.id, -1)} className="text-[11px] text-muted-foreground hover:text-foreground">←</button>
                    <button onClick={() => setOpen(t)} className="text-[12px] text-brand">Inizia</button>
                    <button onClick={() => move(t.id, 1)} className="text-[11px] text-muted-foreground hover:text-foreground">→</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-3 backdrop-blur-sm md:items-center">
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elegant">
              <div className="flex items-start justify-between">
                <div>
                  <Pill tone="brand">{open.p}</Pill>
                  <h2 className="mt-2 font-display text-xl font-semibold">{open.t}</h2>
                </div>
                <button onClick={() => setOpen(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-3 text-[13.5px] text-muted-foreground"><b className="text-foreground">Perché è importante.</b> {open.why}</p>
              <div className="mt-4 text-[12px] uppercase tracking-wider text-muted-foreground">Step</div>
              <ol className="mt-2 space-y-1.5 text-[13.5px]">
                {open.steps.map((s, i) => <li key={s}>{i+1}. {s}</li>)}
              </ol>
              <div className="mt-4 rounded-xl border border-border bg-surface p-3 text-[13px]">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Output finale</div>
                <div className="mt-0.5">{open.output}</div>
              </div>
              <Button className="mt-4 w-full" onClick={() => { move(open.id, 1); setOpen(null); }}>
                Completa task <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
