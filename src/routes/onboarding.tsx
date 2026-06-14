"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Zap, Rocket } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getUser, setUser } from "@/lib/mockAuth";
import { generateProject, } from "@/lib/projectGenerator";
import { saveProject } from "@/lib/projectStore";
import type { Task, TaskArea } from "@/lib/projectStore";
import { generateProjectFromOnboarding } from "@/lib/claude.functions";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const ONBOARDING_KEY = "pilot-onboarding-complete";

// ── Step definitions ─────────────────────────────────────────────────────────

type Option = { emoji: string; label: string; value: string; desc?: string };

const PHASES: Option[] = [
  { emoji: "🌱", label: "Ho un'idea", value: "Solo un'idea", desc: "Non ho ancora iniziato" },
  { emoji: "🔍", label: "Sto validando", value: "Sto validando", desc: "Sto testando il mercato" },
  { emoji: "🏗️", label: "Sto costruendo", value: "Sto costruendo", desc: "Ho già un MVP" },
  { emoji: "🚀", label: "Sto lanciando", value: "Già live", desc: "Sono quasi live" },
  { emoji: "📈", label: "Sono già live", value: "Già live+", desc: "Voglio crescere" },
];

const BUDGETS: Option[] = [
  { emoji: "💸", label: "Meno di €1.000", value: "< 500€" },
  { emoji: "💰", label: "€1.000 – €5.000", value: "500–2.000€" },
  { emoji: "💎", label: "€5.000 – €20.000", value: "2.000–10.000€" },
  { emoji: "🏦", label: "Più di €20.000", value: "10.000–50.000€" },
  { emoji: "❓", label: "Non lo so ancora", value: "< 500€" },
];

const TEAMS: Option[] = [
  { emoji: "👤", label: "Solo", value: "Solo founder", desc: "Sono il solo founder" },
  { emoji: "👥", label: "Con un co-founder", value: "2–3 persone", desc: "Siamo in 2" },
  { emoji: "👨‍👩‍👧", label: "Piccolo team", value: "2–3 persone", desc: "2-5 persone" },
  { emoji: "🏢", label: "Team strutturato", value: "4+ persone", desc: "5+ persone" },
];

const GOALS: Option[] = [
  { emoji: "✅", label: "Validare l'idea", value: "Validare l'idea", desc: "Con utenti reali" },
  { emoji: "🏗️", label: "Costruire il MVP", value: "Lanciare un MVP", desc: "Primo prototipo" },
  { emoji: "💰", label: "Trovare clienti", value: "Trovare i primi clienti", desc: "Primi paganti" },
  { emoji: "📣", label: "Lanciare pubblicamente", value: "Lanciare pubblicamente", desc: "Go-to-market" },
  { emoji: "💼", label: "Trovare investitori", value: "Cercare investitori", desc: "Pitch e funding" },
  { emoji: "⚙️", label: "Automatizzare", value: "Automatizzare processi", desc: "Processi interni" },
];

// ── Task presets by goal ──────────────────────────────────────────────────────

function tasksForGoal(goal: string): Pick<Task, "title" | "priority" | "area" | "duration" | "output">[] {
  const map: Record<string, typeof undefined | Pick<Task, "title" | "priority" | "area" | "duration" | "output">[]> = {
    "Validare l'idea": [
      { title: "Intervista 5 utenti del target", priority: "Alta", area: "Validation", duration: "2–3 ore", output: "5 insight validati" },
      { title: "Crea una landing page di test", priority: "Alta", area: "MVP", duration: "3–4 ore", output: "Landing live con form" },
      { title: "Definisci le metriche di validazione", priority: "Media", area: "Idea", duration: "1 ora", output: "KPI definiti" },
    ],
    "Lanciare un MVP": [
      { title: "Definisci le 3 feature core (MoSCoW)", priority: "Alta", area: "MVP", duration: "1–2 ore", output: "Lista feature prioritizzata" },
      { title: "Crea wireframe della schermata principale", priority: "Alta", area: "MVP", duration: "2–3 ore", output: "Wireframe approvato" },
      { title: "Scegli lo stack tecnologico", priority: "Media", area: "MVP", duration: "2 ore", output: "Stack documentato" },
    ],
    "Trovare i primi clienti": [
      { title: "Lista 20 prospect ideali (ICP)", priority: "Alta", area: "Marketing", duration: "1–2 ore", output: "Lista con contatti" },
      { title: "Scrivi email di outreach", priority: "Alta", area: "Marketing", duration: "2 ore", output: "Template email pronto" },
      { title: "Prepara demo del prodotto", priority: "Alta", area: "Pitch", duration: "3 ore", output: "Demo deck o video" },
    ],
    "Lanciare pubblicamente": [
      { title: "Prepara il lancio su Product Hunt", priority: "Alta", area: "Marketing", duration: "4–6 ore", output: "Draft PH pronto" },
      { title: "Crea piano social media (2 settimane)", priority: "Media", area: "Marketing", duration: "2 ore", output: "Piano editoriale" },
      { title: "Scrivi press kit e bio fondatori", priority: "Media", area: "Brand", duration: "2 ore", output: "Press kit PDF" },
    ],
    "Cercare investitori": [
      { title: "Prepara pitch deck (10 slide)", priority: "Alta", area: "Pitch", duration: "6–8 ore", output: "Pitch deck v1" },
      { title: "Lista 10 VC/angel target", priority: "Alta", area: "Pitch", duration: "2 ore", output: "Lista investitori" },
      { title: "Scrivi executive summary 1 pagina", priority: "Alta", area: "Pitch", duration: "2 ore", output: "Executive summary" },
    ],
    "Automatizzare processi": [
      { title: "Mappa i processi attuali (as-is)", priority: "Alta", area: "MVP", duration: "2–3 ore", output: "Flow diagram" },
      { title: "Identifica i 3 colli di bottiglia", priority: "Alta", area: "MVP", duration: "1 ora", output: "Lista prioritizzata" },
      { title: "Valuta tool di automazione (Zapier/Make)", priority: "Media", area: "MVP", duration: "2 ore", output: "Confronto tool" },
    ],
  };
  return map[goal] ?? map["Validare l'idea"]!;
}

// ── Loading messages ──────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Analizzo la tua idea…",
  "Genero la roadmap 30/60/90…",
  "Preparo i tuoi primi task…",
  "Calibro il Budget Guard…",
  "Il tuo workspace è pronto! 🎉",
];

// ── Plan cards ────────────────────────────────────────────────────────────────

const PLAN_CARDS = [
  {
    id: "free",
    name: "Free Trial",
    price: "€0",
    period: "14 giorni",
    desc: "Esplora Pilot senza impegno.",
    features: ["1 progetto", "Idea Lab", "Blueprint base", "3 task attivi"],
    highlight: false,
    badge: null,
    cta: "Continua con Free Trial",
  },
  {
    id: "starter",
    name: "Starter",
    price: "€23",
    period: "/ mese",
    desc: "Per founder che vogliono organizzarsi seriamente.",
    features: ["3 progetti", "Blueprint completo", "Task illimitati", "Budget Guard", "Roadmap 30/60/90"],
    highlight: true,
    badge: "Consigliato",
    cta: "Attiva Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "€49",
    period: "/ mese",
    desc: "MVP, pitch, validazione avanzata.",
    features: ["Progetti illimitati", "MVP Builder", "Pitch Room", "Founder Guard", "Co-founder AI"],
    highlight: false,
    badge: "Più scelto",
    cta: "Attiva Pro",
  },
] as const;

// ── Form state ────────────────────────────────────────────────────────────────

type FormData = {
  name: string;
  projectName: string;
  phase: string;
  budget: string;
  team: string;
  goal: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-4 = steps, 5 = loading, 6 = plan
  const [form, setForm] = useState<FormData>({ name: "", projectName: "", phase: "", budget: "", team: "", goal: "" });
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  // Skip if already onboarded
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY)) router.replace("/app");
  }, [router]);

  // Loading animation + AI project generation
  useEffect(() => {
    if (step !== 5) return;

    // Start Claude generation concurrently with the animation
    const claudePrompt = `Sei un esperto di startup. Basandoti ESCLUSIVAMENTE su questi dati reali forniti dall'utente, genera un piano operativo. NON inventare dati. Se un campo non può essere determinato dai dati forniti, lascialo vuoto.

Dati reali utente:
Nome progetto: ${form.projectName}
Nome fondatore: ${form.name}
Fase attuale: ${form.phase}
Budget disponibile: ${form.budget}
Composizione team: ${form.team}
Obiettivo 30 giorni: ${form.goal}`;
    let claudeResultText: string | null = null;
    const claudePromise = generateProjectFromOnboarding(claudePrompt).then((r) => {
      if (r.ok) claudeResultText = r.text;
    });

    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      if (idx < LOADING_MESSAGES.length) {
        setLoadMsgIdx(idx);
      } else {
        clearInterval(iv);
        // Wait for Claude then save, fall back to local generator if needed
        claudePromise.then(() => {
          if (claudeResultText) {
            generateAndSaveFromAI(claudeResultText, form);
          } else {
            generateAndSave(form);
          }
          setStep(6);
        });
      }
    }, 700);
    return () => clearInterval(iv);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const canAdvance = () => {
    if (step === 0) return form.name.trim().length > 0 && form.projectName.trim().length > 0;
    if (step === 1) return !!form.phase;
    if (step === 2) return !!form.budget;
    if (step === 3) return !!form.team;
    if (step === 4) return !!form.goal;
    return false;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step < 4) go(step + 1);
    else go(5); // start loading
  };

  const handlePlanChoice = (planId: string) => {
    const user = getUser();
    if (user) {
      setUser({ ...user, plan: planId as "free" | "starter" | "pro", onboarded: true });
    }
    localStorage.setItem(ONBOARDING_KEY, "1");
    router.push("/app");
  };

  // ── Loading screen ────────────────────────────────────────────────────────

  if (step === 5) {
    const pct = Math.round(((loadMsgIdx + 1) / LOADING_MESSAGES.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand"
        >
          <Sparkles className="h-10 w-10" />
        </motion.div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Sto creando il tuo workspace personalizzato
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadMsgIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 text-[15px] text-muted-foreground"
          >
            {LOADING_MESSAGES[loadMsgIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-brand"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  // ── Plan choice screen ────────────────────────────────────────────────────

  if (step === 6) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Rocket className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Il tuo workspace è pronto, {form.name.split(" ")[0]}! 🎉
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Hai attivato il Free Trial — 14 giorni per esplorare Pilot.
              <br />Scegli il piano più adatto a te per continuare.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PLAN_CARDS.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: plan.id === "free" ? 0 : plan.id === "starter" ? 0.1 : 0.2 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5",
                  plan.highlight
                    ? "border-brand bg-brand/5 shadow-[0_0_0_1px_theme(colors.brand)]"
                    : "border-border bg-card shadow-card",
                )}
              >
                {plan.badge && (
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] font-semibold",
                    plan.highlight ? "bg-brand text-white" : "bg-foreground text-background",
                  )}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-[13px] font-semibold text-muted-foreground">{plan.name}</div>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="font-display text-3xl font-semibold">{plan.price}</span>
                    <span className="mb-1 text-[13px] text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">{plan.desc}</p>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px]">
                      <Check className={cn("h-3.5 w-3.5 shrink-0", plan.highlight ? "text-brand" : "text-muted-foreground")} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanChoice(plan.id)}
                  className={cn(
                    "w-full rounded-xl py-2.5 text-[13.5px] font-medium transition",
                    plan.highlight
                      ? "bg-brand text-white hover:opacity-90"
                      : "border border-border bg-surface hover:bg-accent",
                  )}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => handlePlanChoice("free")}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              Continua con il Free Trial →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Steps 0–4 ─────────────────────────────────────────────────────────────

  const totalSteps = 5;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-5">
        <Logo size={22} />
        <div className="text-[12px] text-muted-foreground">
          {step + 1} / {totalSteps}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-border">
        <motion.div
          className="h-full bg-brand"
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pt-5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === step ? 1.2 : 1 }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i < step ? "w-4 bg-brand" : i === step ? "w-4 bg-brand" : "w-2 bg-muted",
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <StepContent step={step} form={form} setForm={setForm} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <footer className="sticky bottom-0 border-t border-border/60 bg-background/90 backdrop-blur px-5 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <button
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Indietro
          </button>
          <motion.button
            onClick={handleNext}
            disabled={!canAdvance()}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-[13.5px] font-medium text-background transition disabled:opacity-30"
          >
            {step === 4 ? (
              <>
                Genera il mio progetto <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Avanti <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}

// ── Step content ──────────────────────────────────────────────────────────────

function StepContent({
  step,
  form,
  setForm,
}: {
  step: number;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const set = (k: keyof FormData) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (step === 0) {
    return (
      <div className="space-y-6">
        <StepHeader n={1} title="Ciao! Come ti chiami?" sub="Ci aiuta a personalizzare il tuo workspace." />
        <div className="space-y-3">
          <Field label="Il tuo nome" value={form.name} onChange={set("name")} placeholder="Es. Marco Rossi" />
          <Field
            label="Nome del progetto o idea"
            value={form.projectName}
            onChange={set("projectName")}
            placeholder="Es. App per freelance, Marketplace artigiani…"
          />
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <StepHeader n={2} title="In che fase sei?" sub="Personalizzeremo roadmap e task in base al tuo punto di partenza." />
        <OptionCards options={PHASES} selected={form.phase} onSelect={set("phase")} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <StepHeader n={3} title="Qual è il tuo budget?" sub="Calibriamo il Budget Guard sul tuo runway reale." />
        <OptionCards options={BUDGETS} selected={form.budget} onSelect={set("budget")} cols={2} />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <StepHeader n={4} title="Come stai lavorando?" sub="Adattiamo i task e i ruoli al tuo contesto." />
        <OptionCards options={TEAMS} selected={form.team} onSelect={set("team")} cols={2} />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="space-y-6">
        <StepHeader n={5} title="Obiettivo nei prossimi 30 giorni?" sub="Genereremo i task prioritari giusti per te." />
        <OptionCards options={GOALS} selected={form.goal} onSelect={set("goal")} cols={2} />
      </div>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepHeader({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-brand">
        Passo {n} di 5
      </div>
      <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
        {title}
      </h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={label === "Il tuo nome"}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-brand"
      />
    </label>
  );
}

function OptionCards({
  options, selected, onSelect, cols = 1,
}: {
  options: Option[]; selected: string; onSelect: (v: string) => void; cols?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-2.5", cols === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <motion.button
            key={opt.value + opt.label}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
              active
                ? "border-brand bg-brand/5 shadow-[0_0_0_1px_theme(colors.brand/0.4)]"
                : "border-border bg-surface hover:border-foreground/30 hover:bg-accent",
            )}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className={cn("text-[14px] font-medium", active && "text-brand")}>{opt.label}</div>
              {opt.desc && <div className="mt-0.5 text-[11.5px] text-muted-foreground">{opt.desc}</div>}
            </div>
            {active && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Project generation ────────────────────────────────────────────────────────

function generateAndSaveFromAI(jsonText: string, form: FormData) {
  try {
    const ai = JSON.parse(jsonText);
    const user = getUser();
    const onboarding = {
      idea: form.projectName,
      sector: "SaaS",
      type: "SaaS",
      target: ai.target ?? "Founder e imprenditori italiani",
      location: "Italia",
      budget: form.budget,
      stage: form.phase.replace("+", ""),
      team: form.team,
      goal: form.goal,
    };
    const base = generateProject(onboarding);
    base.name = ai.name ?? form.projectName ?? base.name;
    base.onelinePitch = ai.description ?? base.onelinePitch;
    if (ai.mvp?.length) base.mvpEssential = ai.mvp.slice(0, 5);
    if (ai.tasks?.length) {
      const presetTasks = (ai.tasks as { title: string; priority: string; area: string; duration: string; output: string }[])
        .slice(0, 5)
        .map((t, i) => ({
          ...base.tasks[i] ?? base.tasks[0],
          title: t.title,
          priority: (["Alta", "Media", "Bassa"].includes(t.priority) ? t.priority : "Media") as "Alta" | "Media" | "Bassa",
          area: (["Idea", "MVP", "Budget", "Validation", "Marketing", "Brand", "Pitch"].includes(t.area) ? t.area : "MVP") as TaskArea,
          duration: t.duration ?? "2 ore",
          output: t.output ?? "Completato",
          id: `ai-task-${i}`,
          status: "Da fare" as const,
          description: t.title,
          why: "Task generato dall'AI in base al tuo obiettivo.",
          steps: [],
        }));
      base.tasks = [...presetTasks, ...base.tasks.slice(presetTasks.length)];
    }
    if (ai.healthScore) (base as Record<string, unknown>).healthScore = ai.healthScore;
    saveProject(base);
    if (user) {
      setUser({ ...user, name: form.name || user.name, onboarded: true,
        project: { name: base.name, idea: onboarding.idea, sector: onboarding.sector,
          location: onboarding.location, target: onboarding.target, budget: onboarding.budget,
          stage: onboarding.stage, team: onboarding.team, goal: onboarding.goal, type: onboarding.type },
      });
    }
    try { localStorage.setItem("pilot-onboarding", "1"); } catch {}
  } catch {
    generateAndSave(form);
  }
}

function generateAndSave(form: FormData) {
  const user = getUser();

  const onboarding = {
    idea: form.projectName,
    sector: "SaaS",
    type: "SaaS",
    target: "Founder e imprenditori italiani",
    location: "Italia",
    budget: form.budget,
    stage: form.phase.replace("+", ""),
    team: form.team,
    goal: form.goal,
  };

  const project = generateProject(onboarding);

  // Override tasks with goal-specific ones from spec
  const presetTasks = tasksForGoal(form.goal);
  const taskOverrides = presetTasks.map((t, i) => ({
    ...project.tasks[i] ?? project.tasks[0],
    ...t,
    id: `task-preset-${i}`,
    status: "Da fare" as const,
    description: t.title,
    why: "Task prioritario basato sul tuo obiettivo 30 giorni.",
    steps: [],
  }));
  project.tasks = [...taskOverrides, ...project.tasks.slice(presetTasks.length)];
  project.name = form.projectName || project.name;

  saveProject(project);

  // Update user name
  if (user) {
    setUser({
      ...user,
      name: form.name || user.name,
      onboarded: true,
      project: {
        name: project.name,
        idea: onboarding.idea,
        sector: onboarding.sector,
        location: onboarding.location,
        target: onboarding.target,
        budget: onboarding.budget,
        stage: onboarding.stage,
        team: onboarding.team,
        goal: onboarding.goal,
        type: onboarding.type,
      },
    });
  }

  // Save onboarding data to localStorage for PlanUtilization to detect
  try { localStorage.setItem("pilot-onboarding", "1"); } catch {}
}
