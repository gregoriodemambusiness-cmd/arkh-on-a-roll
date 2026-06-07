import { useEffect, useState } from "react";

const KEY = "pilot-project";
const EVT = "pilot-project-change";

export type TaskStatus = "Da fare" | "In corso" | "Completato";
export type TaskArea = "Idea" | "MVP" | "Budget" | "Validation" | "Marketing" | "Brand" | "Pitch";
export type Priority = "Alta" | "Media" | "Bassa";
export type Severity = "Bassa" | "Media" | "Alta";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  duration: string;
  output: string;
  status: TaskStatus;
  area: TaskArea;
  why: string;
  steps: string[];
  userInput?: string;
  completedAt?: number;
};

export type Blueprint = {
  mission: string;
  vision: string;
  problem: string;
  solution: string;
  target: string;
  valueProp: string;
  businessModel: string;
  mvp: string;
  goToMarket: string;
  risks: string;
  nextActions: string;
};

export type RoadmapPhase = { key: "30" | "60" | "90"; label: string; items: { t: string; done: boolean }[] };

export type FounderAlert = {
  id: string;
  title: string;
  severity: Severity;
  area: string;
  explanation: string;
  advice: string;
  resolved: boolean;
};

export type Onboarding = {
  idea: string;
  sector: string;
  type: string;
  target: string;
  location: string;
  budget: string;
  stage: string;
  team: string;
  goal: string;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  onboarding: Onboarding;
  onelinePitch: string;
  blueprint: Blueprint;
  mvpEssential: string[];
  mvpDeferred: string[];
  mvpEstimate: number; // €
  budgetAvailable: number; // €
  roadmap: RoadmapPhase[];
  tasks: Task[];
  founderAlerts: FounderAlert[];
};

// ─────────────── persistence ───────────────
export function getProject(): Project | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Project) : null;
  } catch {
    return null;
  }
}

export function saveProject(p: Project | null) {
  if (typeof window === "undefined") return;
  if (p) {
    p.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(p));
  } else {
    localStorage.removeItem(KEY);
  }
  window.dispatchEvent(new Event(EVT));
}

export function updateProject(updater: (p: Project) => Project) {
  const cur = getProject();
  if (!cur) return;
  saveProject(updater(cur));
}

export function useProject() {
  const [p, setP] = useState<Project | null>(null);
  useEffect(() => {
    setP(getProject());
    const h = () => setP(getProject());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return p;
}

// ─────────────── derived metrics ───────────────
export function parseBudget(s: string): number {
  if (!s) return 0;
  // Strings like "< 500€", "500–2.000€", "2.000–10.000€", "10.000–50.000€", "> 50.000€"
  const cleaned = s.replace(/€/g, "").replace(/\./g, "").replace(/\s/g, "");
  if (cleaned.startsWith("<")) return Number(cleaned.slice(1)) * 0.6 || 300;
  if (cleaned.startsWith(">")) return Number(cleaned.slice(1)) * 1.5 || 75000;
  const m = cleaned.match(/(\d+)[–-](\d+)/);
  if (m) return Math.round((Number(m[1]) + Number(m[2])) / 2);
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatEuro(n: number): string {
  return `€ ${n.toLocaleString("it-IT")}`;
}

export type BudgetAnalysis = {
  available: number;
  estimated: number;
  delta: number;
  risk: "basso" | "medio" | "alto";
  recommendation: string;
};

export function analyzeBudget(p: Project): BudgetAnalysis {
  const available = p.budgetAvailable;
  const estimated = p.mvpEstimate;
  const delta = available - estimated;
  let risk: BudgetAnalysis["risk"];
  let recommendation: string;
  if (available < estimated * 0.85) {
    risk = "alto";
    recommendation = "Il tuo MVP è troppo grande per il budget disponibile. Riduci le feature e valida prima con una soluzione più semplice.";
  } else if (available < estimated * 1.3) {
    risk = "medio";
    recommendation = "Il budget è vicino al costo stimato. Mantieni il focus sulle funzioni essenziali e rimanda ciò che non serve per validare.";
  } else {
    risk = "basso";
    recommendation = "Il budget è coerente con un primo MVP leggero. Mantieni comunque il focus sulla validazione prima dello sviluppo completo.";
  }
  return { available, estimated, delta, risk, recommendation };
}

export type HealthBreakdown = { key: string; value: number }[];

export function computeHealth(p: Project): { score: number; breakdown: HealthBreakdown } {
  const bp = p.blueprint;
  const len = (s: string) => Math.min(100, Math.round((s?.trim().length || 0) / 1.2));
  const idea = len(bp.problem) * 0.4 + len(bp.solution) * 0.6;
  const target = len(bp.target);
  const bm = len(bp.businessModel) * 0.6 + len(bp.valueProp) * 0.4;
  const completed = p.tasks.filter((t) => t.status === "Completato").length;
  const totalTasks = Math.max(1, p.tasks.length);
  const mvp = Math.min(100, (completed / totalTasks) * 100 * 0.5 + 30);
  const marketing = len(bp.goToMarket);
  const validation = Math.min(100, completed * 12 + 20);
  const breakdown: HealthBreakdown = [
    { key: "Idea", value: Math.round(idea) },
    { key: "Target", value: Math.round(target) },
    { key: "Business Model", value: Math.round(bm) },
    { key: "MVP", value: Math.round(mvp) },
    { key: "Marketing", value: Math.round(marketing) },
    { key: "Validation", value: Math.round(validation) },
  ];
  const score = Math.round(breakdown.reduce((a, b) => a + b.value, 0) / breakdown.length);
  return { score, breakdown };
}

export function completeTask(id: string) {
  updateProject((p) => ({
    ...p,
    tasks: p.tasks.map((t) =>
      t.id === id ? { ...t, status: "Completato", completedAt: Date.now() } : t
    ),
  }));
}

export function moveTask(id: string, status: TaskStatus) {
  updateProject((p) => ({
    ...p,
    tasks: p.tasks.map((t) =>
      t.id === id
        ? { ...t, status, completedAt: status === "Completato" ? Date.now() : undefined }
        : t
    ),
  }));
}

export function saveTaskInput(id: string, input: string) {
  updateProject((p) => ({
    ...p,
    tasks: p.tasks.map((t) => (t.id === id ? { ...t, userInput: input } : t)),
  }));
}

export function updateBlueprint(patch: Partial<Blueprint>) {
  updateProject((p) => ({ ...p, blueprint: { ...p.blueprint, ...patch } }));
}

export function resolveAlert(id: string) {
  updateProject((p) => ({
    ...p,
    founderAlerts: p.founderAlerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
  }));
}
