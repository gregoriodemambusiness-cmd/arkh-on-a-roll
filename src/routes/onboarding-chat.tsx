"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Target, Wallet, Users, Flag, Box, Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getUser, setUser } from "@/lib/mockAuth";
import { generateProject } from "@/lib/projectGenerator";
import { saveProject } from "@/lib/projectStore";
import { generateProjectFromOnboarding } from "@/lib/claude.functions";
import { sendWelcomeEmail } from "@/lib/email.functions";
import type { TaskArea, RoadmapPhase } from "@/lib/projectStore";

type Msg = { role: "user" | "ai"; text: string };

type CollectedData = {
  projectName: string;
  projectType: string;
  phase: string;
  budgetAmount: number;
  team: string;
  goal: string;
};

const TOTAL_STEPS = 6;

const INITIAL_MSG =
  "Benvenuto in Pilot.\nSono il tuo Co-founder AI.\nCostruiremo insieme il tuo workspace personalizzato.\n\nCome si chiama il tuo progetto?";

function aiReplyForStep(nextStep: number, data: CollectedData): string {
  if (nextStep === 1) return `${data.projectName}.\n\nSu cosa stai lavorando esattamente?`;
  if (nextStep === 2) return "In che fase sei adesso?";
  if (nextStep === 3) return "Qual e il budget che hai a disposizione?";
  if (nextStep === 4) return "Come stai lavorando?";
  if (nextStep === 5) return "Qual e il tuo obiettivo nei prossimi 30 giorni?";
  return "";
}

const STEP_SUGGESTIONS: Record<number, string[]> = {
  1: ["App mobile", "SaaS / Web app", "E-commerce", "Servizio professionale", "Marketplace", "Altro"],
  2: ["Ho solo l'idea", "Sto validando con utenti", "Ho gia un MVP", "Sono gia live", "Voglio scalare"],
  4: ["Solo", "Con un co-founder", "Team 2-5 persone", "Team strutturato"],
  5: [
    "Validare l'idea",
    "Costruire l'MVP",
    "Trovare i primi clienti",
    "Lanciare pubblicamente",
    "Trovare investitori",
    "Automatizzare processi",
  ],
};

const LOADING_STEPS = [
  "Analizzo il tuo progetto...",
  "Genero il blueprint...",
  "Creo la roadmap 30/60/90...",
  "Preparo i tuoi task prioritari...",
  "Calibro il Budget Guard...",
  "Il tuo workspace e pronto.",
];

function budgetGradient(val: number): string {
  if (val < 2000) return "linear-gradient(90deg,#f97316,#fb923c)";
  if (val < 10000) return "linear-gradient(90deg,#eab308,#84cc16)";
  return "linear-gradient(90deg,#7B2FFF,#a855f7)";
}

function budgetHint(val: number): string {
  if (val < 2000) return "Budget early stage. Validazione prima di tutto.";
  if (val < 10000) return "Budget MVP. Costruisci il minimo indispensabile.";
  return "Budget solido. Puoi muoverti velocemente.";
}

function BudgetSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = Math.round(((value - 500) / (100000 - 500)) * 100);
  return (
    <div className="w-full space-y-5">
      <div className="text-center">
        <motion.p
          key={value}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="font-display text-4xl font-bold text-white"
        >
          {`€ ${value.toLocaleString("it-IT")}`}
        </motion.p>
        <p className="mt-2 text-[13px] text-white/50">{budgetHint(value)}</p>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: budgetGradient(value), transition: "width 0.05s" }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-lg"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
        <input
          type="range"
          min={500}
          max={100000}
          step={500}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/25">
        <span>€ 500</span>
        <span>€ 100.000</span>
      </div>
    </div>
  );
}

function PreviewPanel({ collected, step }: { collected: CollectedData; step: number }) {
  const hasName = step >= 1 && collected.projectName;
  const hasType = step >= 2 && collected.projectType;
  const hasPhase = step >= 3 && collected.phase;
  const hasBudget = step >= 4 && collected.budgetAmount > 0;
  const hasTeam = step >= 5 && collected.team;
  const hasGoal = step >= 6 && collected.goal;

  if (!hasName) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
        <p className="text-[13px] text-white/25">Il tuo workspace si costruira qui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-white/30">Anteprima workspace</p>

      {/* Project name */}
      <AnimatePresence>
        {hasName && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <Box className="h-3.5 w-3.5 text-brand" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand">Progetto</span>
            </div>
            <p className="font-display text-[18px] font-bold text-white">{collected.projectName}</p>
            {hasType && (
              <span className="mt-2 inline-block rounded-full border border-brand/30 bg-brand/15 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                {collected.projectType}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase */}
      <AnimatePresence>
        {hasPhase && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <Target className="h-4 w-4 shrink-0 text-white/50" />
            <div>
              <p className="text-[10px] text-white/40">Fase attuale</p>
              <p className="text-[13px] font-medium text-white">{collected.phase}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget */}
      <AnimatePresence>
        {hasBudget && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Wallet className="h-4 w-4 shrink-0 text-white/50" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-white/40">Budget disponibile</p>
                <p className="font-display text-[15px] font-bold text-white">
                  {`€ ${collected.budgetAmount.toLocaleString("it-IT")}`}
                </p>
              </div>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: budgetGradient(collected.budgetAmount) }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (collected.budgetAmount / 100000) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team */}
      <AnimatePresence>
        {hasTeam && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <Users className="h-4 w-4 shrink-0 text-white/50" />
            <div>
              <p className="text-[10px] text-white/40">Team</p>
              <p className="text-[13px] font-medium text-white">{collected.team}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal */}
      <AnimatePresence>
        {hasGoal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <Flag className="h-4 w-4 shrink-0 text-white/50" />
            <div>
              <p className="text-[10px] text-white/40">Obiettivo 30 giorni</p>
              <p className="text-[13px] font-medium text-white">{collected.goal}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps checklist */}
      <div className="mt-4 space-y-1">
        {[
          { label: "Nome progetto", done: !!hasName },
          { label: "Tipo progetto", done: !!hasType },
          { label: "Fase attuale", done: !!hasPhase },
          { label: "Budget", done: !!hasBudget },
          { label: "Team", done: !!hasTeam },
          { label: "Obiettivo", done: !!hasGoal },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] transition-colors ${
                item.done ? "border-brand bg-brand" : "border-white/20"
              }`}
            >
              {item.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-[12px] ${item.done ? "text-white/70" : "text-white/25"}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingChatPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: INITIAL_MSG }]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [budgetVal, setBudgetVal] = useState(5000);
  const [collected, setCollected] = useState<CollectedData>({
    projectName: "",
    projectType: "",
    phase: "",
    budgetAmount: 0,
    team: "",
    goal: "",
  });
  const [appPhase, setAppPhase] = useState<"chat" | "loading" | "done">("chat");
  const [loadStep, setLoadStep] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, step]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const advanceStep = (userText: string, newCollected: CollectedData, newStep: number) => {
    const newMsgs: Msg[] = [...msgs, { role: "user", text: userText }];
    if (newStep < TOTAL_STEPS) {
      const aiText = aiReplyForStep(newStep, newCollected);
      setTimeout(() => {
        setMsgs([...newMsgs, { role: "ai", text: aiText }]);
        setStep(newStep);
      }, 600);
    } else {
      setMsgs(newMsgs);
      setStep(newStep);
      startGeneration(newCollected);
    }
  };

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || step === 3) return; // step 3 uses confirmBudget
    setInput("");

    const newCollected = { ...collected };
    if (step === 0) newCollected.projectName = t;
    if (step === 1) newCollected.projectType = t;
    if (step === 2) newCollected.phase = t;
    if (step === 4) newCollected.team = t;
    if (step === 5) newCollected.goal = t;
    setCollected(newCollected);
    advanceStep(t, newCollected, step + 1);
  };

  const confirmBudget = () => {
    const label = `€ ${budgetVal.toLocaleString("it-IT")}`;
    const newCollected = { ...collected, budgetAmount: budgetVal };
    setCollected(newCollected);
    advanceStep(label, newCollected, 4);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const startGeneration = async (data: CollectedData) => {
    setAppPhase("loading");
    const iv = setInterval(() => {
      setLoadStep((s) => {
        if (s < LOADING_STEPS.length - 1) return s + 1;
        clearInterval(iv);
        return s;
      });
    }, 800);

    const prompt = `Sei un esperto di startup. Crea un workspace completo in JSON basandoti SOLO su questi dati reali. Non inventare nulla. Zero emoji.

Nome: ${data.projectName}
Tipo: ${data.projectType}
Fase: ${data.phase}
Budget: ${data.budgetAmount}
Team: ${data.team}
Obiettivo 30gg: ${data.goal}

Rispondi SOLO con JSON valido (niente markdown, niente backtick, solo JSON puro):
{"name":"...","type":"...","description":"...","phase":"...","budget":${data.budgetAmount},"blueprint":{"problem":"...","solution":"...","target":"...","valueProposition":"...","businessModel":"..."},"tasks":[{"title":"...","priority":"Alta","duration":"...","output":"...","status":"Da fare"},{"title":"...","priority":"Media","duration":"...","output":"...","status":"Da fare"},{"title":"...","priority":"Bassa","duration":"...","output":"...","status":"Da fare"}],"roadmap":{"30":["...","...","..."],"60":["...","...","..."],"90":["...","...","..."]},"risks":["...","..."],"nextAction":"...","healthScore":65}`;

    const result = await generateProjectFromOnboarding(prompt);
    clearInterval(iv);
    setLoadStep(LOADING_STEPS.length - 1);

    if (result.ok) {
      saveFromAI(result.text, data);
    } else {
      saveFallback(data);
    }

    const user = getUser();
    if (user?.email) {
      sendWelcomeEmail(user.name || "Founder", user.email).catch(() => {});
    }

    setTimeout(() => setAppPhase("done"), 900);
  };

  if (appPhase === "loading") {
    const pct = Math.round(((loadStep + 1) / LOADING_STEPS.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <Logo size={24} className="mb-12 text-white" />
        <p className="text-[13px] text-white/40">Costruisco il tuo workspace...</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-3 text-[16px] font-medium text-white"
          >
            {LOADING_STEPS[loadStep]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-8 h-1 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-white"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  if (appPhase === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <Logo size={24} className="mb-12 text-white" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <p className="text-[22px] font-semibold text-white">Il tuo workspace e pronto.</p>
          <p className="mt-3 text-[14px] leading-relaxed text-white/50">
            Hai tutto quello che ti serve per iniziare a costruire.
            Blueprint, roadmap 30/60/90, task prioritari e Budget Guard sono gia configurati.
          </p>
          <button
            onClick={() => router.push("/app")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-black hover:opacity-90 active:scale-95"
          >
            Apri workspace
          </button>
        </motion.div>
      </div>
    );
  }

  const suggestions = STEP_SUGGESTIONS[step] ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-6">
        <Logo size={18} className="text-white" />
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/35">
            Passo {Math.min(step + 1, TOTAL_STEPS)} di {TOTAL_STEPS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-5 rounded-full transition-colors ${i < step + 1 ? "bg-brand" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body: split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: chat 60% */}
        <div className="flex w-full flex-col overflow-hidden md:w-[60%]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-[600px] space-y-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                      m.role === "user"
                        ? "text-white"
                        : "border border-brand/20 bg-white/[0.05] text-white/90"
                    }`}
                    style={{
                      whiteSpace: "pre-wrap",
                      backgroundColor: m.role === "user" ? "#7B2FFF" : undefined,
                    }}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Suggestions pills */}
          {suggestions.length > 0 && (
            <div className="shrink-0 px-4 pb-2">
              <div className="mx-auto max-w-[600px]">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] text-white/70 transition hover:border-brand/50 hover:bg-brand/15 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 border-t border-white/8 px-4 py-4">
            <div className="mx-auto max-w-[600px]">
              {step === 3 ? (
                /* Budget slider */
                <div className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-5">
                  <BudgetSlider value={budgetVal} onChange={setBudgetVal} />
                  <button
                    onClick={confirmBudget}
                    className="mt-5 w-full rounded-xl py-3 text-[14px] font-semibold text-white transition active:scale-95"
                    style={{ backgroundColor: "#7B2FFF" }}
                  >
                    Conferma budget
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrivi la tua risposta..."
                    rows={1}
                    autoFocus
                    className="flex-1 resize-none bg-transparent py-1.5 text-[14px] text-white outline-none placeholder:text-white/30"
                    style={{ maxHeight: "140px" }}
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim()}
                    className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-95 disabled:cursor-not-allowed"
                    style={{ backgroundColor: input.trim() ? "#7B2FFF" : undefined }}
                  >
                    <ArrowUp className={`h-4 w-4 ${input.trim() ? "text-white" : "text-white/25"}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: preview 40% — hidden on mobile */}
        <div className="hidden w-[40%] overflow-y-auto border-l border-white/8 bg-white/[0.02] px-6 py-6 md:block">
          <PreviewPanel collected={collected} step={step} />
        </div>
      </div>
    </div>
  );
}

function saveFromAI(jsonText: string, data: CollectedData) {
  try {
    // Strip markdown code blocks if present
    const clean = jsonText.replace(/```(?:json)?/g, "").trim();
    const ai = JSON.parse(clean);
    const user = getUser();
    const budgetStr = data.budgetAmount < 2000 ? "< 500€" :
      data.budgetAmount < 10000 ? "500–2.000€" :
      data.budgetAmount < 50000 ? "2.000–10.000€" : "10.000–50.000€";
    const onboarding = {
      idea: data.projectName,
      sector: data.projectType || "SaaS",
      type: data.projectType || "SaaS",
      target: ai.blueprint?.target ?? "Founder e imprenditori italiani",
      location: "Italia",
      budget: budgetStr,
      stage: data.phase || "Solo un'idea",
      team: data.team || "Solo founder",
      goal: data.goal || "Validare l'idea",
    };
    const base = generateProject(onboarding);
    base.name = ai.name ?? data.projectName ?? base.name;
    base.onelinePitch = ai.description ?? base.onelinePitch;
    base.budgetAvailable = data.budgetAmount || base.budgetAvailable;

    if (ai.blueprint) {
      base.blueprint = {
        ...base.blueprint,
        problem: ai.blueprint.problem ?? base.blueprint.problem,
        solution: ai.blueprint.solution ?? base.blueprint.solution,
        target: ai.blueprint.target ?? base.blueprint.target,
        valueProp: ai.blueprint.valueProposition ?? base.blueprint.valueProp,
        businessModel: ai.blueprint.businessModel ?? base.blueprint.businessModel,
      };
    }

    if (ai.roadmap) {
      const phases: RoadmapPhase[] = (["30", "60", "90"] as const).map((key) => {
        const items: string[] = ai.roadmap[key] ?? [];
        return {
          key,
          label: key === "30" ? "Primo mese" : key === "60" ? "Secondo mese" : "Terzo mese",
          items: items.map((t: string) => ({ t, done: false })),
        };
      });
      base.roadmap = phases;
    }

    if (ai.tasks?.length) {
      base.tasks = (ai.tasks as { title: string; priority: string; duration: string; output: string }[])
        .slice(0, 3)
        .map((t, i) => ({
          ...base.tasks[i] ?? base.tasks[0],
          title: t.title,
          priority: (["Alta", "Media", "Bassa"].includes(t.priority) ? t.priority : "Media") as "Alta" | "Media" | "Bassa",
          area: "MVP" as TaskArea,
          duration: t.duration ?? "2 ore",
          output: t.output ?? "Completato",
          id: `ai-task-${i}`,
          status: "Da fare" as const,
          description: t.title,
          why: "Task generato dall'AI in base al tuo obiettivo.",
          steps: [],
        }));
    }

    if (ai.healthScore) (base as Record<string, unknown>).healthScore = ai.healthScore;

    saveProject(base);
    if (user) {
      setUser({
        ...user, onboarded: true,
        project: {
          name: base.name, idea: onboarding.idea, sector: onboarding.sector,
          location: onboarding.location, target: onboarding.target, budget: onboarding.budget,
          stage: onboarding.stage, team: onboarding.team, goal: onboarding.goal, type: onboarding.type,
        },
      });
    }
    try { localStorage.setItem("pilot-onboarding-complete", "1"); } catch {}
  } catch {
    saveFallback(data);
  }
}

function saveFallback(data: CollectedData) {
  const user = getUser();
  const budgetStr = data.budgetAmount < 2000 ? "< 500€" :
    data.budgetAmount < 10000 ? "500–2.000€" :
    data.budgetAmount < 50000 ? "2.000–10.000€" : "10.000–50.000€";
  const onboarding = {
    idea: data.projectName,
    sector: data.projectType || "SaaS",
    type: data.projectType || "SaaS",
    target: "Founder e imprenditori italiani",
    location: "Italia",
    budget: budgetStr,
    stage: data.phase || "Solo un'idea",
    team: data.team || "Solo founder",
    goal: data.goal || "Validare l'idea",
  };
  const project = generateProject(onboarding);
  project.name = data.projectName || project.name;
  project.budgetAvailable = data.budgetAmount || project.budgetAvailable;
  saveProject(project);
  if (user) {
    setUser({
      ...user, onboarded: true,
      project: {
        name: project.name, idea: onboarding.idea, sector: onboarding.sector,
        location: onboarding.location, target: onboarding.target, budget: onboarding.budget,
        stage: onboarding.stage, team: onboarding.team, goal: onboarding.goal, type: onboarding.type,
      },
    });
  }
  try { localStorage.setItem("pilot-onboarding-complete", "1"); } catch {}
}
