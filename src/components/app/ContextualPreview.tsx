"use client";
import { ExternalLink } from "lucide-react";
import { useProject, analyzeBudget, computeHealth, formatEuro } from "@/lib/projectStore";

type Intent = "tasks" | "budget" | "roadmap" | "health" | "founder-guard" | null;

function detectIntent(message: string): Intent {
  const m = message.toLowerCase();
  if (/task|fare oggi|priorit|cosa faccio|attivit|to-do/.test(m)) return "tasks";
  if (/budget|soldi|costi|spese|finanziario|burn/.test(m)) return "budget";
  if (/roadmap|piano|timeline|30 giorni|60 giorni|90/.test(m)) return "roadmap";
  if (/health|score|salute|punteggio|come sto/.test(m)) return "health";
  if (/rischi|errori|pericoli|guard/.test(m)) return "founder-guard";
  return null;
}

const ROUTE_MAP: Record<NonNullable<Intent>, string> = {
  tasks: "/app/task-center",
  budget: "/app/budget-guard",
  roadmap: "/app/roadmap",
  health: "/app",
  "founder-guard": "/app/founder-guard",
};

const TITLE_MAP: Record<NonNullable<Intent>, string> = {
  tasks: "Today Focus",
  budget: "Budget Guard",
  roadmap: "Roadmap 30/60/90",
  health: "Startup Health",
  "founder-guard": "Founder Guard",
};

export function ContextualPreview({ userMessage }: { userMessage: string }) {
  const proj = useProject();
  const intent = detectIntent(userMessage);

  if (!intent || !proj) return null;

  const route = ROUTE_MAP[intent];
  const title = TITLE_MAP[intent];

  let body: React.ReactNode = null;

  if (intent === "tasks") {
    const todo = proj.tasks.filter((t) => t.status !== "Completato").slice(0, 3);
    body = (
      <div className="space-y-1.5">
        {todo.length === 0 ? (
          <p className="text-[12.5px] text-muted-foreground">Nessun task aperto.</p>
        ) : (
          todo.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-2.5 py-1.5"
            >
              <span className="truncate text-[12.5px]">{t.title}</span>
              <span
                className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                  t.priority === "Alta"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.priority}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  if (intent === "budget") {
    const b = analyzeBudget(proj);
    body = (
      <div className="space-y-1 text-[12.5px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Budget</span>
          <span>{formatEuro(b.available)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">MVP stimato</span>
          <span>{formatEuro(b.estimated)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Differenza</span>
          <span className={b.delta >= 0 ? "text-success" : "text-warning"}>
            {b.delta >= 0 ? "+" : "-"}{formatEuro(Math.abs(b.delta))}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rischio</span>
          <span
            className={`font-medium ${
              b.risk === "alto" ? "text-warning" : b.risk === "medio" ? "text-brand" : "text-success"
            }`}
          >
            {b.risk.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  if (intent === "roadmap") {
    body = (
      <div className="space-y-1.5">
        {proj.roadmap.slice(0, 3).map((phase) => {
          const first = phase.items[0];
          return (
            <div
              key={phase.key}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5"
            >
              <span className="w-9 shrink-0 text-[10.5px] font-medium uppercase tracking-wider text-brand">
                {phase.key}gg
              </span>
              <span className="truncate text-[12.5px] text-muted-foreground">{first?.t ?? "—"}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (intent === "health") {
    const { score } = computeHealth(proj);
    body = (
      <div>
        <div className="mb-2 flex items-end gap-1.5">
          <span className="font-display text-3xl font-semibold">{score}</span>
          <span className="mb-1 text-[12px] text-muted-foreground">/ 100</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  }

  if (intent === "founder-guard") {
    const open = proj.founderAlerts.filter((a) => !a.resolved);
    const critical = open.find((a) => a.severity === "Alta") ?? open[0];
    body = (
      <div className="space-y-1.5">
        <p className="text-[12.5px]">
          <span className="font-medium">{open.length}</span>
          <span className="text-muted-foreground"> alert attivi</span>
        </p>
        {critical && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-2.5 py-2 text-[12px] text-warning">
            {critical.title}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 ml-9 rounded-xl border border-brand/20 bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-brand">{title}</span>
        <a
          href={route}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          Apri <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {body}
    </div>
  );
}
