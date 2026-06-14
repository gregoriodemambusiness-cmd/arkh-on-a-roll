"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import NextLink from "next/link";

type Feature = {
  id: string;
  label: string;
  check: () => boolean;
  href: string;
  cta: string;
};

const FEATURES: Feature[] = [
  {
    id: "onboarding",
    label: "Onboarding completato",
    check: () => !!localStorage.getItem("pilot-onboarding"),
    href: "/onboarding",
    cta: "Completa onboarding",
  },
  {
    id: "blueprint",
    label: "Blueprint generato",
    check: () => {
      try { return !!JSON.parse(localStorage.getItem("pilot-project") || "{}").blueprint; } catch { return false; }
    },
    href: "/app/blueprint",
    cta: "Genera Blueprint",
  },
  {
    id: "budget",
    label: "Budget Guard utilizzato",
    check: () => !!localStorage.getItem("pilot-budget-used"),
    href: "/app/budget-guard",
    cta: "Apri Budget Guard",
  },
  {
    id: "founder-guard",
    label: "Founder Guard attivato",
    check: () => !!localStorage.getItem("pilot-fg-used"),
    href: "/app/founder-guard",
    cta: "Apri Founder Guard",
  },
  {
    id: "tasks",
    label: "3+ task completati",
    check: () => {
      try {
        const p = JSON.parse(localStorage.getItem("pilot-project") || "{}");
        return (p.tasks || []).filter((t: any) => t.status === "Completato").length >= 3;
      } catch { return false; }
    },
    href: "/app/task-center",
    cta: "Apri Task Center",
  },
  {
    id: "cofounder",
    label: "Co-founder AI consultato",
    check: () => !!localStorage.getItem("pilot-cofounder-used"),
    href: "/app/co-founder",
    cta: "Parla col Co-founder",
  },
  {
    id: "pricing",
    label: "Pricing definito nel Business Model",
    check: () => {
      try { return !!JSON.parse(localStorage.getItem("pilot-project") || "{}").businessModel?.pricing; } catch { return false; }
    },
    href: "/app/business-model",
    cta: "Definisci il Pricing",
  },
  {
    id: "roadmap",
    label: "Roadmap completata (almeno 1 milestone)",
    check: () => {
      try {
        const p = JSON.parse(localStorage.getItem("pilot-project") || "{}");
        return (p.roadmap || []).some((c: any) => (c.items || []).some((i: any) => i.done));
      } catch { return false; }
    },
    href: "/app/roadmap",
    cta: "Apri Roadmap",
  },
  {
    id: "mvp",
    label: "MVP Builder utilizzato",
    check: () => !!localStorage.getItem("pilot-mvp-used"),
    href: "/app/mvp-builder",
    cta: "Apri MVP Builder",
  },
  {
    id: "team",
    label: "Membro del team invitato",
    check: () => {
      try {
        const t = JSON.parse(localStorage.getItem("pilot-team-members") || "[]");
        return t.length > 0;
      } catch { return false; }
    },
    href: "/app/team",
    cta: "Invita un membro",
  },
];

export function PlanUtilization() {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const r: Record<string, boolean> = {};
    FEATURES.forEach((f) => { r[f.id] = f.check(); });
    setResults(r);
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const used = FEATURES.filter((f) => results[f.id]).length;
  const pct = Math.round((used / FEATURES.length) * 100);
  const unused = FEATURES.filter((f) => !results[f.id]).slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Zap className="h-4 w-4 text-brand" />
            Utilizzo del piano
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Stai usando il {pct}% delle funzionalità disponibili
          </p>
        </div>
        <span className="font-display text-2xl font-semibold text-brand">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1.5 text-[11.5px] text-muted-foreground">
        {used} di {FEATURES.length} funzionalità attivate
      </div>

      {/* Unused features */}
      {unused.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Da sbloccare
          </div>
          {unused.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2"
            >
              <span className="text-[13px] text-muted-foreground">{f.label}</span>
              <NextLink
                href={f.href}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand/10 px-2.5 py-1 text-[11.5px] font-medium text-brand hover:bg-brand/20"
              >
                {f.cta} <ArrowRight className="h-3 w-3" />
              </NextLink>
            </motion.div>
          ))}
        </div>
      )}

      {pct === 100 && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 rounded-xl border border-success/30 bg-success/10 p-3 text-center text-[13px] text-success"
        >
          Stai usando il 100% del piano — sei un founder serio!
        </motion.div>
      )}
    </div>
  );
}
