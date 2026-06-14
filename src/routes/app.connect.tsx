"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, X, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Card, PageHeader } from "@/components/app/ui";
import { useProject, computeHealth } from "@/lib/projectStore";
import { cn } from "@/lib/utils";

type StartupCard = {
  id: string;
  name: string;
  type: string;
  phase: "Early Stage" | "MVP" | "Live";
  description: string;
  healthScore: number;
  budgetTarget?: number;
  sector: string;
  createdAt: string;
};

const PLACEHOLDERS: StartupCard[] = [
  {
    id: "p1",
    name: "FlowOS",
    type: "SaaS / Web app",
    phase: "MVP",
    description: "Piattaforma di automazione dei processi operativi per PMI italiane.",
    healthScore: 78,
    budgetTarget: 50000,
    sector: "Produttivita",
    createdAt: "2025-11-10",
  },
  {
    id: "p2",
    name: "Mercatino.io",
    type: "Marketplace",
    phase: "Early Stage",
    description: "Marketplace locale che connette artigiani italiani con acquirenti locali.",
    healthScore: 62,
    budgetTarget: 30000,
    sector: "E-commerce",
    createdAt: "2025-12-01",
  },
  {
    id: "p3",
    name: "NutriPilot",
    type: "App mobile",
    phase: "Live",
    description: "App di nutrizione personalizzata basata su AI per atleti amatoriali.",
    healthScore: 85,
    budgetTarget: 80000,
    sector: "Salute e fitness",
    createdAt: "2025-09-15",
  },
  {
    id: "p4",
    name: "CostItalia",
    type: "SaaS / Web app",
    phase: "MVP",
    description: "Software di contabilita semplificata per freelance e liberi professionisti.",
    healthScore: 71,
    budgetTarget: 40000,
    sector: "Fintech",
    createdAt: "2025-10-20",
  },
  {
    id: "p5",
    name: "SpazioFlex",
    type: "Marketplace",
    phase: "Early Stage",
    description: "Marketplace per affitto di coworking e spazi di lavoro on-demand.",
    healthScore: 55,
    budgetTarget: 25000,
    sector: "PropTech",
    createdAt: "2026-01-05",
  },
];

const SECTORS = ["Tutti i settori", "Produttivita", "E-commerce", "Salute e fitness", "Fintech", "PropTech"];

type PhaseFilter = "Tutti" | "Early Stage" | "MVP" | "Live";

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-success" : score >= 45 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[12px] font-semibold tabular-nums">{score}</span>
    </div>
  );
}

type InterestModal = { startup: StartupCard } | null;

function InterestModal({ startup, onClose }: { startup: StartupCard; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem("pilot-investor-interests") ?? "[]") as unknown[];
      existing.push({ ...form, startupId: startup.id, startupName: startup.name, at: Date.now() });
      localStorage.setItem("pilot-investor-interests", JSON.stringify(existing));
    } catch {}
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-[15px] font-semibold">Sono interessato</h3>
            <p className="text-[12px] text-muted-foreground">{startup.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <Network className="h-6 w-6" />
            </div>
            <p className="font-medium">Interesse inviato.</p>
            <p className="text-[13px] text-muted-foreground">
              Il founder ricevera la tua richiesta di contatto.
            </p>
            <button onClick={onClose} className="mt-2 rounded-xl bg-foreground px-5 py-2 text-[13px] font-medium text-background hover:opacity-90">
              Chiudi
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 px-5 py-5">
            {[
              { id: "name", label: "Il tuo nome", placeholder: "Mario Rossi" },
              { id: "email", label: "La tua email", placeholder: "mario@example.com", type: "email" },
            ].map((f) => (
              <label key={f.id} className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{f.label}</span>
                <input
                  type={f.type ?? "text"}
                  required
                  placeholder={f.placeholder}
                  value={form[f.id as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Messaggio</span>
              <textarea
                required
                rows={4}
                placeholder="Descrivi il tuo interesse e cosa puoi portare al progetto..."
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-3 text-[14px] font-semibold text-white hover:opacity-90 active:scale-95"
            >
              Invia interesse
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ConnectPage() {
  const proj = useProject();
  const health = proj ? computeHealth(proj).score : 0;
  const [visible, setVisible] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("Tutti");
  const [sectorFilter, setSectorFilter] = useState("Tutti i settori");
  const [sortBy, setSortBy] = useState<"Recenti" | "Health Score">("Recenti");
  const [interestModal, setInterestModal] = useState<InterestModal>(null);

  const startups = useMemo(() => {
    let list = [...PLACEHOLDERS];
    if (phaseFilter !== "Tutti") list = list.filter((s) => s.phase === phaseFilter);
    if (sectorFilter !== "Tutti i settori") list = list.filter((s) => s.sector === sectorFilter);
    if (sortBy === "Health Score") list.sort((a, b) => b.healthScore - a.healthScore);
    else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
  }, [phaseFilter, sectorFilter, sortBy]);

  const phaseBadge = (phase: string) => {
    const map: Record<string, string> = {
      "Early Stage": "bg-amber-500/15 text-amber-600 border-amber-500/30",
      MVP: "bg-brand/15 text-brand border-brand/30",
      Live: "bg-success/15 text-success border-success/30",
    };
    return map[phase] ?? "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Pilot Connect"
        subtitle="Startup innovative che stanno costruendo il futuro"
      />

      {/* My profile */}
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-muted-foreground">Il tuo profilo</p>
            <p className="mt-1 font-display text-[17px] font-bold">{proj?.name ?? "Nessun progetto"}</p>
            {proj && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", phaseBadge("MVP"))}>
                  {proj.onboarding?.stage ?? "Early Stage"}
                </span>
                <span className="text-[12px] text-muted-foreground">Health Score: {health}/100</span>
              </div>
            )}
          </div>
          <div className="shrink-0">
            <button
              onClick={() => setVisible((v) => !v)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-medium transition",
                visible
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {visible ? "Visibile agli investitori" : "Non visibile"}
            </button>
          </div>
        </div>
        {visible && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl bg-brand/8 px-4 py-3 text-[13px] text-brand"
          >
            Il tuo profilo e ora visibile nel feed. Gli investitori possono vedere il nome del progetto,
            la fase, il tipo e il tuo Health Score.
          </motion.p>
        )}
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-border bg-surface p-0.5">
          {(["Tutti", "Early Stage", "MVP", "Live"] as PhaseFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPhaseFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition",
                phaseFilter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-surface py-2 pl-3 pr-8 text-[12.5px] font-medium text-muted-foreground outline-none"
          >
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="ml-auto flex rounded-xl border border-border bg-surface p-0.5">
          {(["Recenti", "Health Score"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition",
                sortBy === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="grid gap-4 md:grid-cols-2">
        {startups.map((s) => (
          <Card key={s.id} className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground font-display text-[14px] font-bold text-background">
                {s.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold">{s.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                    {s.type}
                  </span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", phaseBadge(s.phase))}>
                    {s.phase}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-muted-foreground">{s.description}</p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Health Score</span>
              </div>
              <HealthBar score={s.healthScore} />
            </div>

            {s.budgetTarget && (
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="text-muted-foreground">Budget cercato:</span>
                <span className="font-medium">{`€ ${s.budgetTarget.toLocaleString("it-IT")}`}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setInterestModal({ startup: s })}
                className="flex-1 rounded-xl bg-brand py-2 text-[13px] font-medium text-white hover:opacity-90"
              >
                Sono interessato
              </button>
              <button className="flex-1 rounded-xl border border-border bg-surface py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground">
                Vedi profilo
              </button>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {interestModal && (
          <InterestModal
            startup={interestModal.startup}
            onClose={() => setInterestModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
