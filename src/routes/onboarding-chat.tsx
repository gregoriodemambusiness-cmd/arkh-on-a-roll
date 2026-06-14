"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getUser, setUser } from "@/lib/mockAuth";
import { generateProject } from "@/lib/projectGenerator";
import { saveProject } from "@/lib/projectStore";
import { generateProjectFromOnboarding } from "@/lib/claude.functions";
import type { Task, TaskArea } from "@/lib/projectStore";

type Msg = { role: "user" | "ai"; text: string };

type CollectedData = {
  projectName: string;
  problemTarget: string;
  phase: string;
  budget: string;
  team: string;
  goal: string;
};

const QUESTIONS = [
  null,
  "Interessante. Che problema risolve esattamente? A chi si rivolge?",
  "Capito. In che fase sei adesso? Hai ancora solo l'idea, stai validando con utenti reali, o hai gia qualcosa di costruito?",
  "E il budget? Quante risorse hai a disposizione per sviluppare questo?",
  "Stai lavorando da solo o hai gia qualcuno con te?",
  "Ultima domanda: qual e la cosa piu importante che vuoi ottenere nei prossimi 30 giorni?",
];

const LOADING_STEPS = [
  "Analizzo le informazioni...",
  "Genero la tua roadmap personalizzata...",
  "Preparo i tuoi primi task...",
  "Creo il tuo Blueprint...",
  "Workspace pronto.",
];

export default function OnboardingChatPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "Benvenuto in Pilot. Sono il tuo Co-founder AI. Costruiremo insieme il tuo workspace personalizzato.\n\nDimmi: su cosa stai lavorando?",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [collected, setCollected] = useState<CollectedData>({
    projectName: "",
    problemTarget: "",
    phase: "",
    budget: "",
    team: "",
    goal: "",
  });
  const [phase, setPhase] = useState<"chat" | "loading" | "done">("chat");
  const [loadStep, setLoadStep] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, phase]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const send = () => {
    const t = input.trim();
    if (!t) return;

    const newMsgs: Msg[] = [...msgs, { role: "user", text: t }];
    const newStep = step + 1;
    const newCollected = { ...collected };

    if (step === 0) newCollected.projectName = t;
    if (step === 1) newCollected.problemTarget = t;
    if (step === 2) newCollected.phase = t;
    if (step === 3) newCollected.budget = t;
    if (step === 4) newCollected.team = t;
    if (step === 5) newCollected.goal = t;

    setCollected(newCollected);
    setInput("");

    if (newStep < QUESTIONS.length) {
      const aiReply = buildAiReply(newStep, t, newCollected);
      setTimeout(() => {
        setMsgs([...newMsgs, { role: "ai", text: aiReply }]);
        setStep(newStep);
      }, 600);
    } else {
      setMsgs(newMsgs);
      setStep(newStep);
      startGeneration(newCollected);
    }
  };

  const buildAiReply = (nextStep: number, userText: string, data: CollectedData): string => {
    const projectName = data.projectName || userText;
    if (nextStep === 1) {
      return `${projectName}. Interessante.\nChe problema risolve esattamente? A chi si rivolge?`;
    }
    return QUESTIONS[nextStep] ?? "";
  };

  const startGeneration = async (data: CollectedData) => {
    setPhase("loading");

    const iv = setInterval(() => {
      setLoadStep((s) => {
        if (s < LOADING_STEPS.length - 1) return s + 1;
        clearInterval(iv);
        return s;
      });
    }, 900);

    const claudePrompt = `Sei un esperto di startup. Basandoti ESCLUSIVAMENTE su questi dati reali forniti dall'utente, genera un piano operativo. NON inventare dati. Se un campo non puo essere determinato dai dati forniti, lascialo vuoto.

Dati reali utente:
Nome progetto: ${data.projectName}
Problema e target: ${data.problemTarget}
Fase attuale: ${data.phase}
Budget disponibile: ${data.budget}
Composizione team: ${data.team}
Obiettivo 30 giorni: ${data.goal}`;

    const result = await generateProjectFromOnboarding(claudePrompt);

    clearInterval(iv);
    setLoadStep(LOADING_STEPS.length - 1);

    if (result.ok) {
      generateAndSaveFromAI(result.text, data);
    } else {
      generateAndSaveFallback(data);
    }

    setTimeout(() => setPhase("done"), 800);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (phase === "loading") {
    const pct = Math.round(((loadStep + 1) / LOADING_STEPS.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <Logo size={24} className="mb-12 text-white" />
        <p className="text-[14px] text-white/50">Costruisco il tuo workspace...</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
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

  if (phase === "done") {
    const firstName = collected.projectName.split(" ")[0] || "founder";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <Logo size={24} className="mb-12 text-white" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <p className="text-[20px] font-semibold text-white">
            Il tuo workspace e pronto, {firstName}.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-white/50">
            Ho creato per te: Blueprint con problema e soluzione, Roadmap 30/60/90 giorni,
            3 task prioritari per iniziare, Budget Guard calibrato sul tuo budget,
            analisi dei primi rischi.
          </p>
          <p className="mt-5 text-[15px] text-white/80">Inizia a costruire.</p>
          <button
            onClick={() => router.push("/app")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-medium text-black hover:opacity-90"
          >
            Apri il tuo workspace
          </button>
        </motion.div>
      </div>
    );
  }

  const isLast = step >= QUESTIONS.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Logo */}
      <div className="flex h-14 items-center px-6">
        <Logo size={20} className="text-white" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-[680px] space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-white/90"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black px-4 py-4">
        <div className="mx-auto max-w-[680px]">
          <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleEnter}
              placeholder="Scrivi la tua risposta..."
              rows={1}
              autoFocus
              className="flex-1 resize-none bg-transparent py-1.5 text-[14px] text-white outline-none placeholder:text-white/30"
              style={{ maxHeight: "160px" }}
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-95 disabled:cursor-not-allowed"
              style={{ backgroundColor: input.trim() ? "#7B2FFF" : undefined }}
            >
              <ArrowUp className={`h-4 w-4 ${input.trim() ? "text-white" : "text-white/25"}`} />
            </button>
          </div>
          {!isLast && (
            <p className="mt-2 text-center text-[12px] text-white/25">
              Passo {step + 1} di {QUESTIONS.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function generateAndSaveFromAI(jsonText: string, data: CollectedData) {
  try {
    const ai = JSON.parse(jsonText);
    const user = getUser();
    const onboarding = {
      idea: data.projectName,
      sector: "SaaS",
      type: "SaaS",
      target: ai.target ?? "Founder e imprenditori italiani",
      location: "Italia",
      budget: data.budget || "< 500€",
      stage: data.phase || "Solo un'idea",
      team: data.team || "Solo founder",
      goal: data.goal || "Validare l'idea",
    };
    const base = generateProject(onboarding);
    base.name = ai.name ?? data.projectName ?? base.name;
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
      setUser({ ...user, onboarded: true,
        project: { name: base.name, idea: onboarding.idea, sector: onboarding.sector,
          location: onboarding.location, target: onboarding.target, budget: onboarding.budget,
          stage: onboarding.stage, team: onboarding.team, goal: onboarding.goal, type: onboarding.type },
      });
    }
    try { localStorage.setItem("pilot-onboarding-complete", "1"); } catch {}
  } catch {
    generateAndSaveFallback(data);
  }
}

function generateAndSaveFallback(data: CollectedData) {
  const user = getUser();
  const onboarding = {
    idea: data.projectName,
    sector: "SaaS",
    type: "SaaS",
    target: "Founder e imprenditori italiani",
    location: "Italia",
    budget: data.budget || "< 500€",
    stage: data.phase || "Solo un'idea",
    team: data.team || "Solo founder",
    goal: data.goal || "Validare l'idea",
  };
  const project = generateProject(onboarding);
  project.name = data.projectName || project.name;
  saveProject(project);
  if (user) {
    setUser({
      ...user,
      onboarded: true,
      project: {
        name: project.name, idea: onboarding.idea, sector: onboarding.sector,
        location: onboarding.location, target: onboarding.target, budget: onboarding.budget,
        stage: onboarding.stage, team: onboarding.team, goal: onboarding.goal, type: onboarding.type,
      },
    });
  }
  try { localStorage.setItem("pilot-onboarding-complete", "1"); } catch {}
}
