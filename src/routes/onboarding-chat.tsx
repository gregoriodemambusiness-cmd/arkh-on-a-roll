"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getUser, setUser } from "@/lib/mockAuth";
import { generateProject } from "@/lib/projectGenerator";
import { saveProject } from "@/lib/projectStore";
import { conductOnboardingTurn, generateWorkspaceFromConversation } from "@/lib/claude.functions";
import { sendWelcomeEmail } from "@/lib/email.functions";
import type { TaskArea, RoadmapPhase } from "@/lib/projectStore";

type HistoryMsg = { role: "user" | "assistant"; content: string };
type DisplayMsg = { role: "user" | "ai"; text: string };
type AppPhase = "chat" | "loading" | "done";

type WorkspaceResult = {
  name?: string;
  type?: string;
  description?: string;
  phase?: string;
  budget?: number;
  team?: string;
  blueprint?: {
    problem?: string;
    solution?: string;
    target?: string;
    valueProposition?: string;
    businessModel?: string;
    competitors?: string;
    differentiator?: string;
  };
  tasks?: Array<{ title: string; description?: string; priority: string; duration?: string; output?: string; status?: string }>;
  roadmap?: Record<string, string[]>;
  risks?: Array<{ title?: string; description?: string; severity?: string; mitigation?: string } | string>;
  founderGuardAlerts?: string[];
  nextAction?: string;
  healthScore?: number;
  insights?: string[];
};

const PHASE_LABELS: Record<number, string> = {
  1: "Esplorazione idea",
  2: "Analisi mercato e utenti",
  3: "Strategia e rischi",
  4: "Generazione workspace",
};

const LOADING_MESSAGES = [
  "Analizzo la conversazione...",
  "Identifico il mercato target...",
  "Costruisco il tuo blueprint...",
  "Genero la roadmap personalizzata...",
  "Preparo i task prioritari...",
  "Calibro il Budget Guard...",
  "Analizzo i rischi specifici...",
  "Ottimizzando il workspace...",
  "Il tuo workspace e pronto.",
];

function budgetGradient(val: number): string {
  if (val < 3000) return "linear-gradient(90deg,#FF6B35,#f97316)";
  if (val < 15000) return "linear-gradient(90deg,#F7B731,#eab308)";
  return "linear-gradient(90deg,#7B2FFF,#a855f7)";
}

function budgetHint(val: number): string {
  if (val < 3000) return "Budget early stage. La validazione costa poco. Inizia a parlare con i clienti.";
  if (val < 15000) return "Budget MVP. Abbastanza per costruire e testare il minimo indispensabile.";
  return "Budget solido. Puoi permetterti di muoverti velocemente e fare errori.";
}

function BudgetSlider({
  value,
  onChange,
  onConfirm,
}: {
  value: number;
  onChange: (v: number) => void;
  onConfirm: () => void;
}) {
  const pct = Math.round(((value - 500) / (150000 - 500)) * 100);
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-5 space-y-5">
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
          max={150000}
          step={500}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/25">
        <span>€ 500</span>
        <span>€ 150.000</span>
      </div>
      <button
        onClick={onConfirm}
        className="w-full rounded-xl py-3 text-[14px] font-semibold text-white transition active:scale-95"
        style={{ backgroundColor: "#7B2FFF" }}
      >
        Conferma
      </button>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] px-4 py-3 inline-flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-white/30"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function OnboardingChatPage() {
  const router = useRouter();

  // Full conversation history for Claude API
  const [history, setHistory] = useState<HistoryMsg[]>([]);
  // Display messages (what user sees)
  const [displayMsgs, setDisplayMsgs] = useState<DisplayMsg[]>([
    {
      role: "ai",
      text: "Benvenuto in Pilot. Sono il tuo Co-founder AI.\nNei prossimi 15-20 minuti costruiremo insieme il tuo workspace personalizzato.\nInizia raccontandomi la tua idea — nei minimi dettagli, senza filtri.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationPhase, setConversationPhase] = useState(1);
  const [budgetVal, setBudgetVal] = useState(5000);
  const [showBudgetSlider, setShowBudgetSlider] = useState(false);
  const [budgetConfirmed, setBudgetConfirmed] = useState(false);
  const [pills, setPills] = useState<string[]>([]);
  const [appPhase, setAppPhase] = useState<AppPhase>("chat");
  const [loadStep, setLoadStep] = useState(0);
  const [generatedData, setGeneratedData] = useState({ tasks: 0, risks: 0, insights: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMsgs, isSending, showBudgetSlider, pills]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const detectTriggers = (aiText: string, alreadyConfirmedBudget: boolean) => {
    const lower = aiText.toLowerCase();

    if (!alreadyConfirmedBudget && lower.includes("budget")) {
      setShowBudgetSlider(true);
      setPills([]);
      return;
    }

    if (
      lower.includes("fase") &&
      (lower.includes("adesso") || lower.includes("sei") || lower.includes("costruito") || lower.includes("hai un"))
    ) {
      setPills(["Ho solo l'idea", "Sto validando", "Ho un prototipo", "Ho gia clienti"]);
      return;
    }

    if (
      (lower.includes("lavorando") || lower.includes("lavori") || lower.includes("da solo") || lower.includes("team")) &&
      !lower.includes("marketing") &&
      !lower.includes("equipe")
    ) {
      setPills(["Solo", "Con un co-founder", "Team piccolo 2-4", "Team strutturato"]);
      return;
    }

    if (lower.includes("obiettivo") && (lower.includes("30") || lower.includes("prossim") || lower.includes("mese"))) {
      setPills(["Validare l'idea", "Costruire l'MVP", "Trovare clienti", "Raccogliere investimenti"]);
      return;
    }

    setPills([]);
  };

  const sendMessage = async (
    text?: string,
    currentHistory?: HistoryMsg[],
    currentDisplay?: DisplayMsg[],
    currentBudgetConfirmed?: boolean,
  ) => {
    const t = (text ?? input).trim();
    if (!t || isSendingRef.current || appPhase !== "chat") return;

    isSendingRef.current = true;
    setIsSending(true);
    setPills([]);
    setShowBudgetSlider(false);
    if (text === undefined) setInput("");

    const prevHistory = currentHistory ?? history;
    const prevDisplay = currentDisplay ?? displayMsgs;
    const alreadyConfirmed = currentBudgetConfirmed ?? budgetConfirmed;

    const newDisplay: DisplayMsg[] = [...prevDisplay, { role: "user", text: t }];
    setDisplayMsgs(newDisplay);

    const newHistory: HistoryMsg[] = [...prevHistory, { role: "user", content: t }];
    setHistory(newHistory);

    // Update phase estimate based on exchange count
    const exchanges = Math.floor(newHistory.length / 2);
    if (exchanges < 5) setConversationPhase(1);
    else if (exchanges < 10) setConversationPhase(2);
    else setConversationPhase(3);

    try {
      const result = await conductOnboardingTurn(newHistory);

      if (result.ok) {
        const aiText = result.text;

        if (aiText.includes("WORKSPACE_GENERATION_START")) {
          const parts = aiText.split("WORKSPACE_GENERATION_START");
          const beforeSignal = parts[0].trim();

          const finalDisplay: DisplayMsg[] = beforeSignal
            ? [...newDisplay, { role: "ai", text: beforeSignal }]
            : newDisplay;
          setDisplayMsgs(finalDisplay);

          const finalHistory: HistoryMsg[] = [...newHistory, { role: "assistant", content: aiText }];
          setConversationPhase(4);
          isSendingRef.current = false;
          setIsSending(false);
          startWorkspaceGeneration(finalHistory);
        } else {
          setDisplayMsgs([...newDisplay, { role: "ai", text: aiText }]);
          setHistory([...newHistory, { role: "assistant", content: aiText }]);
          detectTriggers(aiText, alreadyConfirmed);
          isSendingRef.current = false;
          setIsSending(false);
        }
      } else {
        setDisplayMsgs([...newDisplay, { role: "ai", text: "C'e stato un problema di connessione. Riprova." }]);
        isSendingRef.current = false;
        setIsSending(false);
      }
    } catch {
      setDisplayMsgs([...newDisplay, { role: "ai", text: "C'e stato un problema di connessione. Riprova." }]);
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const confirmBudget = () => {
    const label = `€ ${budgetVal.toLocaleString("it-IT")}`;
    setBudgetConfirmed(true);
    setShowBudgetSlider(false);
    sendMessage(label, history, displayMsgs, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startWorkspaceGeneration = async (convHistory: HistoryMsg[]) => {
    setAppPhase("loading");
    setLoadStep(0);

    const startTime = Date.now();
    let msgIdx = 0;
    const iv = setInterval(() => {
      msgIdx++;
      if (msgIdx < LOADING_MESSAGES.length - 1) {
        setLoadStep(msgIdx);
      } else {
        clearInterval(iv);
      }
    }, 1200);

    const convStr = convHistory
      .map((m) => `${m.role === "user" ? "UTENTE" : "CO-FOUNDER AI"}: ${m.content}`)
      .join("\n\n");

    const result = await generateWorkspaceFromConversation(convStr);

    clearInterval(iv);

    let workspaceJSON: WorkspaceResult = {};
    if (result.ok) {
      try {
        const clean = result.text.replace(/```(?:json)?/g, "").trim();
        workspaceJSON = JSON.parse(clean) as WorkspaceResult;
      } catch {
        workspaceJSON = {};
      }
    }

    const tasksCount = workspaceJSON.tasks?.length ?? 0;
    const risksCount = Array.isArray(workspaceJSON.risks) ? workspaceJSON.risks.length : 0;
    const insightsCount = workspaceJSON.insights?.length ?? 0;
    setGeneratedData({ tasks: tasksCount, risks: risksCount, insights: insightsCount });

    saveWorkspace(workspaceJSON);

    const user = getUser();
    if (user?.email) {
      sendWelcomeEmail(user.name || "Founder", user.email).catch(() => {});
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 8000 - elapsed);

    setTimeout(() => {
      setLoadStep(LOADING_MESSAGES.length - 1);
      setTimeout(() => setAppPhase("done"), 800);
    }, remaining);
  };

  // ── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (appPhase === "loading") {
    const pct = Math.round(((loadStep + 1) / LOADING_MESSAGES.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <Logo size={24} className="mb-14 text-white" />
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/25">Generazione workspace</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-4 font-display text-[20px] font-semibold text-white"
          >
            {LOADING_MESSAGES[loadStep]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-10 h-0.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "#7B2FFF" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  // ── DONE SCREEN ─────────────────────────────────────────────────────────────
  if (appPhase === "done") {
    const items = [
      "Blueprint completo del tuo progetto",
      "Roadmap 30/60/90 giorni personalizzata",
      generatedData.tasks > 0
        ? `${generatedData.tasks} task prioritari specifici per te`
        : "Task prioritari specifici per te",
      "Budget Guard calibrato sul tuo budget",
      generatedData.risks > 0
        ? `${generatedData.risks} rischi identificati con soluzioni`
        : "Rischi identificati con soluzioni",
      generatedData.insights > 0
        ? `${generatedData.insights} insight strategici`
        : "Insight strategici sul tuo progetto",
    ];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <Logo size={24} className="mb-14 text-white" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <p className="font-display text-[26px] font-bold text-white">Il tuo workspace e pronto.</p>
          <p className="mt-3 text-[14px] leading-relaxed text-white/45">
            Abbiamo costruito insieme tutto quello che ti serve per iniziare a costruire.
          </p>
          <div className="mt-7 space-y-2 text-left">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[13.5px] text-white/65">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "#7B2FFF" }} />
                {item}
              </div>
            ))}
          </div>
          <p className="mt-7 text-[13px] text-white/30">
            Il tuo Co-founder AI ti aspetta per iniziare a costruire.
          </p>
          <button
            onClick={() => router.push("/app")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-semibold text-black hover:opacity-90 active:scale-95 transition"
          >
            Apri il tuo workspace
          </button>
        </motion.div>
      </div>
    );
  }

  // ── CHAT SCREEN ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-6">
        <Logo size={18} className="text-white" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
              Fase {conversationPhase} di 4
            </p>
            <p className="text-[12px] font-medium text-white/50">{PHASE_LABELS[conversationPhase]}</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((p) => (
              <div
                key={p}
                className={`h-1 rounded-full transition-all duration-500 ${
                  p <= conversationPhase ? "w-7 bg-brand" : "w-3 bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-[720px] space-y-5">
            {displayMsgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                    m.role === "user"
                      ? "text-white"
                      : "border border-white/[0.08] bg-[#111118] text-white/88"
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

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <ThinkingDots />
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Pill suggestions */}
        {pills.length > 0 && !isSending && (
          <div className="shrink-0 px-4 pb-2">
            <div className="mx-auto max-w-[720px]">
              <div className="flex flex-wrap gap-2">
                {pills.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPills([]); sendMessage(p, history, displayMsgs, budgetConfirmed); }}
                    className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] text-white/65 transition hover:border-brand/50 hover:bg-brand/15 hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 border-t border-white/[0.08] px-4 py-4">
          <div className="mx-auto max-w-[720px]">
            {showBudgetSlider && !isSending ? (
              <BudgetSlider value={budgetVal} onChange={setBudgetVal} onConfirm={confirmBudget} />
            ) : (
              <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isSending
                      ? "Il Co-founder AI sta pensando..."
                      : "Scrivi la tua risposta..."
                  }
                  disabled={isSending}
                  rows={1}
                  autoFocus
                  className="flex-1 resize-none bg-transparent py-1.5 text-[14px] text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed"
                  style={{ maxHeight: "140px" }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isSending}
                  className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-95 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      input.trim() && !isSending ? "#7B2FFF" : undefined,
                  }}
                >
                  <ArrowUp
                    className={`h-4 w-4 ${
                      input.trim() && !isSending ? "text-white" : "text-white/25"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Workspace persistence ────────────────────────────────────────────────────

function saveWorkspace(ai: WorkspaceResult): void {
  try {
    const user = getUser();
    const projectName = ai.name || "Il mio progetto";
    const budgetAmount = typeof ai.budget === "number" && ai.budget > 0 ? ai.budget : 5000;

    const budgetStr =
      budgetAmount < 2000
        ? "< 500€"
        : budgetAmount < 10000
        ? "500–2.000€"
        : budgetAmount < 50000
        ? "2.000–10.000€"
        : "> 50.000€";

    const onboarding = {
      idea: projectName,
      sector: ai.type || "SaaS",
      type: ai.type || "SaaS",
      target: ai.blueprint?.target ?? "Founder e imprenditori",
      location: "Italia",
      budget: budgetStr,
      stage: ai.phase || "Solo un'idea",
      team: ai.team || "Solo founder",
      goal: "Validare l'idea",
    };

    const base = generateProject(onboarding);
    base.name = projectName;
    base.onelinePitch = ai.description ?? base.onelinePitch;
    base.budgetAvailable = budgetAmount;

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
        const items: string[] = ai.roadmap?.[key] ?? [];
        return {
          key,
          label: key === "30" ? "Primo mese" : key === "60" ? "Secondo mese" : "Terzo mese",
          items: items.map((t) => ({ t, done: false })),
        };
      });
      base.roadmap = phases;
    }

    if (ai.tasks?.length) {
      base.tasks = ai.tasks.slice(0, 5).map((t, i) => ({
        ...(base.tasks[i] ?? base.tasks[0]),
        title: t.title,
        description: t.description ?? t.title,
        priority: (["Alta", "Media", "Bassa"].includes(t.priority)
          ? t.priority
          : "Media") as "Alta" | "Media" | "Bassa",
        area: "MVP" as TaskArea,
        duration: t.duration ?? "2 ore",
        output: t.output ?? "Completato",
        id: `ai-task-${i}`,
        status: "Da fare" as const,
        why: "Task generato dall'AI in base alla conversazione.",
        steps: [],
      }));
    }

    if (ai.risks?.length) {
      base.founderAlerts = ai.risks.slice(0, 5).map((r, i) => {
        if (typeof r === "string") {
          return {
            id: `ai-risk-${i}`,
            title: r,
            severity: "Media" as const,
            area: "Strategia",
            explanation: r,
            advice: "Monitora e mitiga questo rischio.",
            resolved: false,
          };
        }
        return {
          id: `ai-risk-${i}`,
          title: r.title ?? `Rischio ${i + 1}`,
          severity: (["Alta", "Media", "Bassa"].includes(r.severity ?? "")
            ? r.severity
            : "Media") as "Alta" | "Media" | "Bassa",
          area: "Strategia",
          explanation: r.description ?? "",
          advice: r.mitigation ?? "",
          resolved: false,
        };
      });
    }

    if (ai.healthScore) (base as Record<string, unknown>).healthScore = ai.healthScore;

    saveProject(base);

    if (user) {
      setUser({
        ...user,
        onboarded: true,
        project: {
          name: base.name,
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

    try { localStorage.setItem("pilot-onboarding-complete", "1"); } catch {}
  } catch {
    const user = getUser();
    const onboarding = {
      idea: ai.name || "Il mio progetto",
      sector: "SaaS",
      type: "SaaS",
      target: "Founder italiani",
      location: "Italia",
      budget: "500–2.000€",
      stage: "Solo un'idea",
      team: "Solo founder",
      goal: "Validare l'idea",
    };
    const project = generateProject(onboarding);
    project.name = ai.name || "Il mio progetto";
    saveProject(project);
    if (user) {
      setUser({ ...user, onboarded: true, project: { name: project.name, idea: onboarding.idea, sector: onboarding.sector, location: onboarding.location, target: onboarding.target, budget: onboarding.budget, stage: onboarding.stage, team: onboarding.team, goal: onboarding.goal, type: onboarding.type } });
    }
    try { localStorage.setItem("pilot-onboarding-complete", "1"); } catch {}
  }
}
