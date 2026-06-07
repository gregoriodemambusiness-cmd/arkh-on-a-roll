import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Target,
  BarChart3,
  Wallet,
  Map,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Rocket,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useUser } from "@/lib/mockAuth";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";
import { useProject, computeHealth, analyzeBudget, completeTask, formatEuro } from "@/lib/projectStore";
import { PLAN_BY_ID, suggestPlan, type PlanId, type PaidPlanId } from "@/lib/billing";
import { PlanConfirmModal } from "@/components/billing/PlanConfirmModal";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — PILOT AI" }] }),
  component: Dashboard,
});

function pickNudge(plan: string, completedTasks: number, budgetRisk: string, onboarding: any) {
  const projectType = String(onboarding?.type || onboarding?.projectType || "").toLowerCase();
  const sector = String(onboarding?.sector || "").toLowerCase();
  const teamMode = String(onboarding?.team || onboarding?.teamMode || "").toLowerCase();

  const looksLikeAutomation =
    projectType.includes("automazione") ||
    projectType.includes("automation") ||
    projectType.includes("processo") ||
    sector.includes("automazione") ||
    sector.includes("processi");

  const looksLikeTeam = teamMode.includes("team") || teamMode.includes("azienda") || teamMode.includes("company");

  if (looksLikeAutomation) {
    return {
      title: "Hai bisogno di un’automazione su misura?",
      desc: "PILOT Studio può aiutarti a trasformare processi lenti in app, dashboard o workflow operativi.",
      cta: "Scopri PILOT Studio",
      target: "studio" as const,
    };
  }

  if (looksLikeTeam) {
    return {
      title: "Stai lavorando con un team?",
      desc: "PILOT Enterprise è pensato per gestire idee, progetti e innovazione con più persone.",
      cta: "Scopri Enterprise",
      target: "enterprise" as const,
    };
  }

  if (plan === "free") {
    return {
      title: "Vuoi continuare a costruire questo progetto?",
      desc: "Passa a Starter per organizzare meglio idea, roadmap, task e budget.",
      cta: "Passa a Starter",
      target: "starter" as const,
    };
  }

  if (plan === "starter" || completedTasks >= 3) {
    return {
      title: "Il tuo progetto sta prendendo forma.",
      desc: "Pro ti aiuta a costruire un MVP più completo, con roadmap, marketing e validazione più profondi.",
      cta: "Passa a Pro",
      target: "pro" as const,
    };
  }

  if (plan === "pro" || budgetRisk === "high" || budgetRisk === "alto") {
    return {
      title: "Porta il progetto a un livello più serio.",
      desc: "Founder aggiunge validazione avanzata, investor kit, budget alerts e strumenti per crescere.",
      cta: "Diventa Founder",
      target: "founder" as const,
    };
  }

  return {
    title: "Continua a costruire con metodo.",
    desc: "Completa il prossimo task consigliato e aggiorna il tuo progetto passo dopo passo.",
    cta: "Apri Today Focus",
    target: "tasks" as const,
  };
}

function Dashboard() {
  const user = useUser();
  const proj = useProject();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState<PaidPlanId | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (!proj) return <EmptyState />;

  const { score, breakdown } = computeHealth(proj);
  const budget = analyzeBudget(proj);
  const todo = proj.tasks.filter((t) => t.status !== "Completato").slice(0, 3);
  const nextAction = todo[0];
  const completed = proj.tasks.filter((t) => t.status === "Completato").length;
  const plan = (user?.plan ?? "free") as PlanId;
  const nudge = pickNudge(plan, completed, budget.risk, proj.onboarding);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`Buongiorno, ${user?.name?.split(" ")[0] || "Founder"}.`}
        subtitle={`Progetto: ${proj.name} — ${proj.onboarding.stage || "Validazione"}`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => nav({ to: "/app/projects" })}>
              Progetti
            </Button>
            {nextAction && (
              <Button onClick={() => nav({ to: "/app/task-center" })}>
                Prossima azione <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        }
      />

      {nudge && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:flex-row md:items-center"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand/10 p-2 text-brand">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold">{nudge.title}</div>
              <div className="text-[12.5px] text-muted-foreground">{nudge.desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nudge.target === "enterprise" ? (
              <a
                href="/enterprise"
                className="rounded-lg bg-foreground px-3.5 py-2 text-[12.5px] font-medium text-background hover:opacity-90"
              >
                {nudge.cta}
              </a>
            ) : nudge.target === "studio" ? (
              <a
                href="/studio"
                className="rounded-lg bg-foreground px-3.5 py-2 text-[12.5px] font-medium text-background hover:opacity-90"
              >
                {nudge.cta}
              </a>
            ) : (
              <Button onClick={() => setConfirm(nudge.target as PaidPlanId)}>{nudge.cta}</Button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Chiudi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      <PlanConfirmModal plan={confirm} onClose={() => setConfirm(null)} />

      <div className="grid grid-cols-12 gap-4">
        {/* Today Focus */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader
            title="Today Focus"
            subtitle={`${todo.length} task prioritari per oggi`}
            icon={Target}
            action={<Pill tone="brand">{todo.length} task</Pill>}
          />
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {todo.length === 0 && (
                <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-[13.5px] text-success">
                  Hai completato tutti i task. Genera la prossima fase dalla Roadmap.
                </div>
              )}
              {todo.map((t, i) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface/60 p-3 hover:border-foreground/20"
                >
                  <span className={`h-2 w-2 rounded-full ${i === 0 ? "bg-brand" : "bg-muted-foreground/40"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium">{t.title}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                      {t.duration} · Output atteso: {t.output}
                    </div>
                  </div>
                  <Pill tone={t.priority === "Alta" ? "warn" : "muted"}>{t.priority}</Pill>
                  <Button variant="secondary" onClick={() => nav({ to: "/app/co-founder" })}>
                    Chiedi all'AI
                  </Button>
                  <Button onClick={() => completeTask(t.id)}>Completa</Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* Startup Health */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-5">
          <CardHeader
            title="Startup Health Score"
            icon={BarChart3}
            subtitle={`${completed}/${proj.tasks.length} task completati`}
          />
          <div className="flex items-end gap-3">
            <motion.div
              key={score}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-5xl font-semibold"
            >
              {score}
            </motion.div>
            <div className="mb-2 text-[12px] text-muted-foreground">/ 100</div>
            <Pill tone={score >= 60 ? "ok" : score >= 40 ? "brand" : "warn"}>
              {score >= 60 ? "In salute" : score >= 40 ? "In progresso" : "Da rinforzare"}
            </Pill>
          </div>
          <ProgressBar value={score} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-[12.5px]">
            {breakdown.map(({ key, value }) => (
              <div key={key} className="rounded-lg border border-border bg-surface/60 p-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
                <ProgressBar value={value} tone={value < 60 ? "warn" : "brand"} />
              </div>
            ))}
          </div>
        </Card>

        {/* Project Snapshot */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Project Snapshot" subtitle="One-line, fase, prossima azione" />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Nome</div>
              <div className="font-display text-lg font-semibold">{proj.name}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">One-line pitch</div>
              <div className="text-[14px]">{proj.onelinePitch}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Fase</div>
              <div className="text-[14px]">{proj.onboarding.stage}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Prossima azione</div>
              <div className="text-[14px]">{nextAction?.title || "Pianifica la prossima fase"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ultima modifica</div>
              <div className="text-[14px]">{timeAgo(proj.updatedAt)}</div>
            </div>
          </div>
        </Card>

        {/* Budget Guard */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-5">
          <CardHeader
            title="Budget Guard"
            icon={Wallet}
            subtitle="Niente budget bruciato"
            action={
              <Link to="/app/budget-guard" className="text-[12px] text-muted-foreground hover:text-foreground">
                Apri →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <Stat label="Disponibile" value={formatEuro(budget.available)} />
            <Stat
              label="MVP stimato"
              value={formatEuro(budget.estimated)}
              tone={budget.risk === "alto" ? "warn" : undefined}
            />
            <Stat
              label="Differenza"
              value={`${budget.delta >= 0 ? "+" : ""}${formatEuro(Math.abs(budget.delta)).replace("€ ", "€ ")}`}
              tone={budget.delta < 0 ? "warn" : undefined}
            />
            <Stat
              label="Rischio"
              value={budget.risk.toUpperCase()}
              tone={budget.risk !== "basso" ? "warn" : undefined}
            />
          </div>
          <div
            className={`mt-3 rounded-lg border p-3 text-[12.5px] ${budget.risk === "alto" ? "border-warning/30 bg-warning/10 text-warning" : budget.risk === "medio" ? "border-brand/30 bg-brand/5 text-foreground" : "border-success/30 bg-success/10 text-success"}`}
          >
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
            {budget.recommendation}
          </div>
        </Card>

        {/* Roadmap */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader
            title="Roadmap 30 / 60 / 90"
            icon={Map}
            action={
              <Link to="/app/roadmap" className="text-[12px] text-muted-foreground hover:text-foreground">
                Apri →
              </Link>
            }
          />
          <div className="grid gap-3 md:grid-cols-3">
            {proj.roadmap.map((c) => {
              const done = c.items.filter((i) => i.done).length;
              const pct = Math.round((done / c.items.length) * 100);
              return (
                <div key={c.key} className="rounded-xl border border-border bg-surface/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-semibold">{c.label}</div>
                    <Pill>
                      {done}/{c.items.length}
                    </Pill>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={pct} />
                  </div>
                  <ul className="mt-3 space-y-1.5 text-[12.5px] text-muted-foreground">
                    {c.items.slice(0, 3).map((i) => (
                      <li key={i.t} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-3 w-3 ${i.done ? "text-success" : "text-muted-foreground/40"}`} />{" "}
                        {i.t}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Co-founder AI */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Co-founder AI" icon={Sparkles} subtitle="Conosce il tuo progetto" />
          <div className="space-y-2 text-[13px]">
            <div className="rounded-xl bg-muted px-3 py-2">Cosa devo fare oggi?</div>
            <div className="rounded-xl border border-brand/30 bg-brand/5 px-3 py-2">
              {nextAction
                ? `Inizia da: ${nextAction.title}. Tempo stimato ${nextAction.duration}.`
                : "Pianifica la fase 60 giorni: scegli 3 funzioni essenziali e costruisci la beta privata."}
            </div>
          </div>
          <Link
            to="/app/co-founder"
            className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-muted-foreground hover:border-brand hover:text-foreground"
          >
            <input className="flex-1 bg-transparent outline-none" placeholder="Chiedi al tuo co-founder…" readOnly />
            <Send className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Founder Guard */}
        <Card className="col-span-12">
          <CardHeader
            title="Founder Guard"
            icon={ShieldAlert}
            subtitle="Errori da evitare oggi"
            action={
              <Link to="/app/founder-guard" className="text-[12px] text-muted-foreground hover:text-foreground">
                Apri →
              </Link>
            }
          />
          <div className="grid gap-2 md:grid-cols-3 text-[13px]">
            {proj.founderAlerts
              .filter((a) => !a.resolved)
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 ${r.severity === "Alta" ? "text-destructive" : r.severity === "Media" ? "text-warning" : "text-muted-foreground"}`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                      {r.area} · gravità {r.severity}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-24 text-center">
      <div className="rounded-2xl bg-brand/10 p-4 text-brand">
        <Rocket className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Crea il tuo primo progetto startup</h1>
      <p className="mt-2 max-w-md text-[14px] text-muted-foreground">
        Inserisci la tua idea: PILOT AI genera blueprint, MVP, roadmap e i primi task operativi.
      </p>
      <Link
        to="/onboarding"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-[14px] font-medium text-background hover:opacity-90"
      >
        Inizia onboarding <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={`rounded-xl border border-border bg-surface/60 p-3 ${tone === "warn" ? "border-warning/30" : ""}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-display text-lg font-semibold ${tone === "warn" ? "text-warning" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "ora";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ore fa`;
  return `${Math.floor(h / 24)} giorni fa`;
}
