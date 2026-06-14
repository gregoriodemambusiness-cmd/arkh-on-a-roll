"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, ChevronDown, ChevronUp, Sparkles, ArrowRight } from "lucide-react";
import { PageHeader, Button } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import NextLink from "next/link";

// ── Data ─────────────────────────────────────────────────────────────────────

const BIG_STEPS = [
  {
    id: "s1",
    title: "Idea & Validazione",
    color: "brand",
    cta: "Apri Idea Lab",
    ctaHref: "/app/idea-lab",
    miniSteps: [
      { id: "s1-1", label: "Definisci il problema core che vuoi risolvere" },
      { id: "s1-2", label: "Identifica il target primario (chi soffre di quel problema)" },
      { id: "s1-3", label: "Analizza almeno 3 competitor diretti" },
      { id: "s1-4", label: "Scrivi la value proposition in una frase" },
      { id: "s1-5", label: "Valida l'idea con 5 persone reali del target" },
    ],
  },
  {
    id: "s2",
    title: "Blueprint & Strategia",
    color: "violet",
    cta: "Apri Blueprint",
    ctaHref: "/app/blueprint",
    miniSteps: [
      { id: "s2-1", label: "Crea il Business Model Canvas" },
      { id: "s2-2", label: "Definisci i canali di acquisizione principali" },
      { id: "s2-3", label: "Calcola il break-even e il runway necessario" },
      { id: "s2-4", label: "Scrivi il piano operativo dei prossimi 90 giorni" },
      { id: "s2-5", label: "Valida la strategia con un mentor o advisor" },
    ],
  },
  {
    id: "s3",
    title: "MVP & Prodotto",
    color: "emerald",
    cta: "Apri MVP Builder",
    ctaHref: "/app/mvp-builder",
    miniSteps: [
      { id: "s3-1", label: "Elenca le feature essenziali con metodo MoSCoW" },
      { id: "s3-2", label: "Scegli e documenta lo stack tecnologico" },
      { id: "s3-3", label: "Costruisci il primo prototipo cliccabile" },
      { id: "s3-4", label: "Raccogli feedback qualitativo da 10 beta tester" },
      { id: "s3-5", label: "Itera e pubblica la prima versione funzionante" },
    ],
  },
  {
    id: "s4",
    title: "Lancio & Go-to-Market",
    color: "amber",
    cta: "Apri Marketing",
    ctaHref: "/app/marketing",
    miniSteps: [
      { id: "s4-1", label: "Definisci la strategia di lancio (data, canale, messaggio)" },
      { id: "s4-2", label: "Crea i materiali di marketing (landing, post, video)" },
      { id: "s4-3", label: "Lancia su Product Hunt e/o community rilevanti" },
      { id: "s4-4", label: "Attiva i primi canali paid e organic" },
      { id: "s4-5", label: "Monitora le metriche di attivazione e conversione" },
    ],
  },
  {
    id: "s5",
    title: "Primi Clienti & Revenue",
    color: "rose",
    cta: "Apri Pitch Room",
    ctaHref: "/app/pitch",
    miniSteps: [
      { id: "s5-1", label: "Chiudi il primo cliente pagante" },
      { id: "s5-2", label: "Documenta e standardizza il processo di vendita" },
      { id: "s5-3", label: "Implementa il sistema di fatturazione e contratti" },
      { id: "s5-4", label: "Raccogli le prime recensioni e testimonianze" },
      { id: "s5-5", label: "Raggiungi €1.000 MRR o 10 clienti attivi" },
    ],
  },
  {
    id: "s6",
    title: "Crescita & Scale",
    color: "sky",
    cta: "Apri Roadmap",
    ctaHref: "/app/roadmap",
    miniSteps: [
      { id: "s6-1", label: "Definisci il piano di growth hacking per il prossimo trimestre" },
      { id: "s6-2", label: "Automatizza il funnel di acquisizione clienti" },
      { id: "s6-3", label: "Assumi o formalizza il primo membro del team" },
      { id: "s6-4", label: "Prepara il pitch per i primi investitori" },
      { id: "s6-5", label: "Raggiungi €10.000 MRR" },
    ],
  },
] satisfies BigStep[];

type BigStep = {
  id: string;
  title: string;
  color: string;
  cta: string;
  ctaHref: string;
  miniSteps: { id: string; label: string }[];
};

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; glow: string; dot: string }> = {
  brand:   { ring: "ring-brand",         bg: "bg-brand/10",        text: "text-brand",        glow: "bg-brand/20",        dot: "bg-brand" },
  violet:  { ring: "ring-violet-500",    bg: "bg-violet-500/10",   text: "text-violet-500",   glow: "bg-violet-500/20",   dot: "bg-violet-500" },
  emerald: { ring: "ring-emerald-500",   bg: "bg-emerald-500/10",  text: "text-emerald-500",  glow: "bg-emerald-500/20",  dot: "bg-emerald-500" },
  amber:   { ring: "ring-amber-500",     bg: "bg-amber-500/10",    text: "text-amber-500",    glow: "bg-amber-500/20",    dot: "bg-amber-500" },
  rose:    { ring: "ring-rose-500",      bg: "bg-rose-500/10",     text: "text-rose-500",     glow: "bg-rose-500/20",     dot: "bg-rose-500" },
  sky:     { ring: "ring-sky-500",       bg: "bg-sky-500/10",      text: "text-sky-500",      glow: "bg-sky-500/20",      dot: "bg-sky-500" },
};

const STORAGE_KEY = "pilot-journey";

type JourneyState = {
  miniSteps: Record<string, boolean>;
};

function loadState(): JourneyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { miniSteps: {} };
}

function saveState(s: JourneyState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function JourneyPage() {
  const [state, setState] = useState<JourneyState>({ miniSteps: {} });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ s1: true });
  const [celebrated, setCelebrated] = useState<Set<string>>(new Set());

  useEffect(() => {
    setState(loadState());
  }, []);

  const toggleMini = useCallback((miniId: string, stepId: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        miniSteps: { ...prev.miniSteps, [miniId]: !prev.miniSteps[miniId] },
      };
      saveState(next);

      // Check if big step just completed
      const bigStep = BIG_STEPS.find((s) => s.id === stepId)!;
      const allDone = bigStep.miniSteps.every((m) => next.miniSteps[m.id]);
      if (allDone) {
        setCelebrated((c) => new Set([...c, stepId]));
        setTimeout(() => setCelebrated((c) => { const n = new Set(c); n.delete(stepId); return n; }), 2500);
      }

      return next;
    });
  }, []);

  const toggleExpand = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  // Compute progress per step
  const stepDone = (stepId: string) => {
    const s = BIG_STEPS.find((x) => x.id === stepId)!;
    return s.miniSteps.every((m) => state.miniSteps[m.id]);
  };

  const stepProgress = (stepId: string) => {
    const s = BIG_STEPS.find((x) => x.id === stepId)!;
    const done = s.miniSteps.filter((m) => state.miniSteps[m.id]).length;
    return { done, total: s.miniSteps.length };
  };

  const activeStepIndex = BIG_STEPS.findIndex((s) => !stepDone(s.id));
  const activeStep = activeStepIndex >= 0 ? BIG_STEPS[activeStepIndex] : null;

  const totalMini = BIG_STEPS.flatMap((s) => s.miniSteps).length;
  const doneMini = Object.values(state.miniSteps).filter(Boolean).length;
  const overallPct = Math.round((doneMini / totalMini) * 100);

  const nextRecommended = activeStep
    ? activeStep.miniSteps.find((m) => !state.miniSteps[m.id])
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Startup Journey"
        subtitle="La roadmap completa dalla prima idea al primo milione."
      />

      {/* Next action banner */}
      {(nextRecommended || activeStep) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 shrink-0 text-brand" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                Prossima azione consigliata
              </div>
              <div className="mt-0.5 text-[13.5px] font-medium">
                {nextRecommended?.label ?? `Completa lo step "${activeStep?.title}"`}
              </div>
            </div>
          </div>
          {activeStep && (
            <NextLink
              href={activeStep.ctaHref}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90"
            >
              Apri <ArrowRight className="h-3.5 w-3.5" />
            </NextLink>
          )}
        </motion.div>
      )}

      {/* Overall progress */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-medium">Progresso totale</span>
          <span className="font-semibold text-brand">{overallPct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1.5 text-[11.5px] text-muted-foreground">
          {doneMini} di {totalMini} step completati
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-px bg-border" />

        {/* Animated fill */}
        <div
          className="absolute left-[27px] top-6 w-px bg-brand transition-all duration-700"
          style={{ height: `${overallPct}%` }}
        />

        <div className="space-y-4">
          {BIG_STEPS.map((step, idx) => {
            const done = stepDone(step.id);
            const { done: miniDone, total: miniTotal } = stepProgress(step.id);
            const isActive = !done && (idx === 0 || stepDone(BIG_STEPS[idx - 1]?.id));
            const isLocked = !done && !isActive && idx > 0 && !stepDone(BIG_STEPS[idx - 1]?.id);
            const isOpen = expanded[step.id];
            const color = COLOR_MAP[step.color];
            const isCelebrating = celebrated.has(step.id);

            return (
              <div key={step.id} className="relative flex gap-4">
                {/* Node */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isCelebrating ? (
                      <motion.div
                        key="celebrate"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn("flex h-10 w-10 items-center justify-center rounded-full", color.glow, color.ring, "ring-2")}
                      >
                        <Check className="h-5 w-5 text-white" />
                      </motion.div>
                    ) : done ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn("flex h-10 w-10 items-center justify-center rounded-full", color.bg, color.ring, "ring-2")}
                      >
                        <Check className={cn("h-5 w-5", color.text)} strokeWidth={2.5} />
                      </motion.div>
                    ) : isLocked ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-muted">
                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    ) : (
                      <motion.div
                        key="active"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", color.ring, color.bg)}
                      >
                        <span className="text-[11px] font-bold text-foreground">{step.id.replace("s", "")}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card */}
                <div className={cn(
                  "flex-1 rounded-2xl border bg-card shadow-card transition-colors",
                  done ? "border-border/60" : isActive ? cn("border-2", color.ring.replace("ring-", "border-")) : "border-border/40",
                )}>
                  {/* Header */}
                  <button
                    onClick={() => !isLocked && toggleExpand(step.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 p-4 text-left",
                      isLocked && "cursor-default opacity-50",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[13px] font-semibold", done && "line-through text-muted-foreground")}>
                            {step.title}
                          </span>
                          {done && (
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", color.bg, color.text)}>
                              Completato
                            </span>
                          )}
                          {isActive && !done && (
                            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                              In corso
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[12px] text-muted-foreground">
                          {miniDone}/{miniTotal} step completati
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Mini progress ring */}
                      <svg viewBox="0 0 24 24" className="h-6 w-6 -rotate-90">
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/30" />
                        <circle
                          cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeDasharray={`${(miniDone / miniTotal) * 56.5} 56.5`}
                          className={color.text}
                        />
                      </svg>
                      {!isLocked && (
                        isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Mini steps */}
                  <AnimatePresence>
                    {isOpen && !isLocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
                          {step.miniSteps.map((mini, mi) => {
                            const checked = !!state.miniSteps[mini.id];
                            return (
                              <motion.button
                                key={mini.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: mi * 0.04 }}
                                onClick={() => toggleMini(mini.id, step.id)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-accent"
                              >
                                <div className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                                  checked ? cn("border-transparent", color.bg) : "border-border bg-background",
                                )}>
                                  {checked && <Check className={cn("h-3 w-3", color.text)} strokeWidth={3} />}
                                </div>
                                <span className={cn(
                                  "flex-1 text-[13px] transition-colors",
                                  checked ? "text-muted-foreground line-through" : "text-foreground",
                                )}>
                                  {mini.label}
                                </span>
                              </motion.button>
                            );
                          })}

                          {/* CTA */}
                          <div className="pt-1">
                            <NextLink
                              href={step.ctaHref}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition hover:opacity-80",
                                color.bg, color.text,
                              )}
                            >
                              {step.cta} <ArrowRight className="h-3.5 w-3.5" />
                            </NextLink>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
