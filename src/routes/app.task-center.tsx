import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ListChecks, Sparkles, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  useProject, moveTask, completeTask, saveTaskInput,
  type Task, type TaskStatus,
} from "@/lib/projectStore";

export const Route = createFileRoute("/app/task-center")({
  head: () => ({ meta: [{ title: "Task Center — PILOT AI" }] }),
  component: TaskCenter,
});

const cols: TaskStatus[] = ["Da fare", "In corso", "Completato"];

function TaskCenter() {
  const proj = useProject();
  const [open, setOpen] = useState<Task | null>(null);
  const [input, setInput] = useState("");
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (open) setInput(open.userInput || "");
  }, [open?.id]);

  if (!proj) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <PageHeader title="Task Center" subtitle="Crea prima un progetto." />
      </div>
    );
  }

  const handleComplete = () => {
    if (!open) return;
    if (input.trim()) saveTaskInput(open.id, input.trim());
    completeTask(open.id);
    setJustCompleted(open.id);
    setOpen(null);
    setTimeout(() => setJustCompleted(null), 1500);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Task Center"
        subtitle={`${proj.tasks.filter((t) => t.status === "Completato").length}/${proj.tasks.length} task completati`}
        action={<Button variant="secondary" onClick={() => nav({ to: "/app/co-founder" })}><Sparkles className="h-3.5 w-3.5" /> Chiedi all'AI</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((c) => {
          const items = proj.tasks.filter((t) => t.status === c);
          return (
            <Card key={c}>
              <CardHeader title={c} icon={ListChecks} action={<Pill>{items.length}</Pill>} />
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {items.map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-xl border bg-surface/60 p-3 text-[13px] ${justCompleted === t.id ? "border-success" : "border-border"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <div className="flex-1">
                          <div className="font-medium">{t.title}</div>
                          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{t.area} · {t.duration}</div>
                        </div>
                        <Pill tone={t.priority === "Alta" ? "warn" : "muted"}>{t.priority}</Pill>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <select
                          value={t.status}
                          onChange={(e) => moveTask(t.id, e.target.value as TaskStatus)}
                          className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {cols.map((cc) => <option key={cc}>{cc}</option>)}
                        </select>
                        {t.status === "Completato" ? (
                          <span className="inline-flex items-center gap-1 text-[12px] text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completato
                          </span>
                        ) : (
                          <button onClick={() => setOpen(t)} className="text-[12px] font-medium text-brand hover:underline">
                            Inizia →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-[12px] text-muted-foreground">
                    Vuoto
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-3 backdrop-blur-sm md:items-center">
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elegant">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone="brand">{open.priority}</Pill>
                    <Pill>{open.area}</Pill>
                    <Pill>{open.duration}</Pill>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-semibold">{open.title}</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">{open.description}</p>
                </div>
                <button onClick={() => setOpen(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 rounded-xl border border-border bg-surface p-3 text-[13px]">
                <b>Perché è importante.</b> {open.why}
              </p>
              <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">Step da completare</div>
              <ol className="mt-2 space-y-1.5 text-[13.5px]">
                {open.steps.map((s, i) => (
                  <li key={s} className="flex gap-2"><span className="text-muted-foreground">{i + 1}.</span>{s}</li>
                ))}
              </ol>
              <div className="mt-4">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Il tuo output</div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  placeholder={open.output}
                  className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-[13.5px] outline-none focus:border-brand"
                />
              </div>
              <div className="mt-2 rounded-xl border border-border bg-surface/60 p-3 text-[12.5px] text-muted-foreground">
                <span className="text-foreground">Output atteso:</span> {open.output}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => { setOpen(null); nav({ to: "/app/co-founder" }); }}>
                  <Sparkles className="h-3.5 w-3.5" /> Chiedi al Co-founder AI
                </Button>
                <Button className="flex-1" onClick={handleComplete}>
                  Completa task <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
