"use client";
import { useState } from "react";
import { Wrench, X, CheckCircle2, Copy, Check, Wand2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { useProject, updateProject } from "@/lib/projectStore";

const STACK_MAP: Record<string, string[]> = {
  mobile:  ["React Native", "Expo", "Supabase", "Stripe", "EAS"],
  web:     ["Next.js", "Tailwind", "Supabase", "Stripe", "Vercel"],
  api:     ["Node.js", "Fastify", "PostgreSQL", "Redis", "Railway"],
  default: ["Next.js", "Tailwind", "Supabase", "Stripe", "Vercel"],
};

const TECH_CHECKLIST = [
  "Auth + session",
  "DB schema + RLS",
  "Stripe checkout test",
  "Email transazionali",
  "Monitoring base",
  "Deploy pipeline CI/CD",
];

function getStack(projectType: string): string[] {
  const t = (projectType || "").toLowerCase();
  if (t.includes("mobile") || t.includes("app")) return STACK_MAP.mobile;
  if (t.includes("api") || t.includes("backend")) return STACK_MAP.api;
  return STACK_MAP.web;
}

function buildNoCodePrompt(
  projectName: string,
  essentialFeatures: string[],
  target: string,
  problem: string
): string {
  return `Costruisci un'app web MVP per "${projectName}".

TARGET UTENTE: ${target || "startup founder"}
PROBLEMA RISOLTO: ${problem || "ottimizzare il workflow"}

FUNZIONI ESSENZIALI da implementare:
${essentialFeatures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

REQUISITI TECNICI:
- Stack: Next.js, Tailwind CSS, Supabase (auth + DB)
- Auth: email/password con conferma email
- UI: minimal, mobile-first, design system coerente
- DB: struttura normalizzata con RLS abilitato
- Deploy: pronto per Vercel

FLOW PRINCIPALE:
Landing → Signup → Onboarding → Core feature → Dashboard

Inizia dalla struttura delle pagine e dal DB schema.`;
}

export default function MVP() {
  const project = useProject();
  const [copied, setCopied] = useState(false);

  const essential: string[] = project?.mvpEssential ?? [];
  const deferred: string[] = project?.mvpDeferred ?? [];
  const completed: string[] = project?.mvpCompleted ?? [];
  const stack = getStack(project?.onboarding?.type ?? "");

  const toggleComplete = (feature: string) => {
    const next = completed.includes(feature)
      ? completed.filter((f) => f !== feature)
      : [...completed, feature];
    updateProject((p) => ({ ...p, mvpCompleted: next }));
  };

  const techCompleted = completed.filter((f) => TECH_CHECKLIST.includes(f));

  const toggleTech = (item: string) => {
    const next = completed.includes(item)
      ? completed.filter((f) => f !== item)
      : [...completed, item];
    updateProject((p) => ({ ...p, mvpCompleted: next }));
  };

  const generatePrompt = async () => {
    const prompt = buildNoCodePrompt(
      project?.name ?? "Il mio progetto",
      essential,
      project?.blueprint?.target ?? "",
      project?.blueprint?.problem ?? ""
    );
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const completedEssential = essential.filter((f) => completed.includes(f));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="MVP Builder"
        subtitle={`MVP realistico per ${project?.name ?? "il tuo progetto"} — funzioni, stack e checklist.`}
        action={
          <Button onClick={generatePrompt}>
            {copied
              ? <><Check className="h-3.5 w-3.5 text-brand" /> Copiato negli appunti!</>
              : <><Wand2 className="h-3.5 w-3.5" /> Genera prompt no-code</>
            }
          </Button>
        }
      />

      {!project && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13.5px] text-amber-600">
          Crea un progetto per visualizzare le feature del tuo MVP.
        </div>
      )}

      {copied && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-[13.5px] text-brand">
          Prompt no-code copiato! Incollalo su Lovable, Bolt, Cursor o v0 per generare il tuo MVP.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Essential features (real data from project) */}
        <Card>
          <CardHeader
            title="Funzioni essenziali"
            icon={Wrench}
            action={<Pill tone="ok">{completedEssential.length} / {essential.length || "—"}</Pill>}
          />
          {essential.length === 0 ? (
            <p className="text-[13.5px] text-muted-foreground">Nessuna feature ancora. Completa l'onboarding per generare le feature del tuo MVP.</p>
          ) : (
            <ul className="space-y-2 text-[13.5px]">
              {essential.map((f) => (
                <li key={f}>
                  <button
                    onClick={() => toggleComplete(f)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent text-left"
                  >
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${completed.includes(f) ? "text-brand" : "text-muted-foreground/30"}`} />
                    <span className={completed.includes(f) ? "line-through text-muted-foreground" : ""}>{f}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Deferred features */}
        <Card>
          <CardHeader
            title="Da rimandare"
            action={<Pill tone="warn">{deferred.length} idee</Pill>}
          />
          {deferred.length === 0 ? (
            <p className="text-[13.5px] text-muted-foreground">Nessuna feature da rimandare ancora.</p>
          ) : (
            <ul className="space-y-1.5 text-[13.5px] text-muted-foreground">
              {deferred.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <X className="h-3.5 w-3.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* User flow */}
        <Card className="md:col-span-2">
          <CardHeader title="User flow" subtitle="Basato sul tipo di progetto" />
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            {["Landing", "Signup", "Onboarding", project?.name ? `${project.name} core` : "Core feature", "Dashboard", "Upgrade"].map((s, i, a) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{s}</span>
                {i < a.length - 1 && <span className="text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
        </Card>

        {/* Stack */}
        <Card>
          <CardHeader
            title="Stack consigliato"
            subtitle={`Per ${project?.onboarding?.type ? `"${project.onboarding.type}"` : "web SaaS"}`}
          />
          <div className="flex flex-wrap gap-2 text-[12.5px]">
            {stack.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-1">{t}</span>
            ))}
          </div>
        </Card>

        {/* Tech checklist */}
        <Card>
          <CardHeader
            title="Checklist tecnica"
            action={<Pill tone={techCompleted.length === TECH_CHECKLIST.length ? "ok" : "brand"}>{techCompleted.length}/{TECH_CHECKLIST.length}</Pill>}
          />
          <ul className="space-y-1.5 text-[13.5px]">
            {TECH_CHECKLIST.map((item) => (
              <li key={item}>
                <button
                  onClick={() => toggleTech(item)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent text-left"
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${completed.includes(item) ? "text-brand" : "text-muted-foreground/30"}`} />
                  <span className={completed.includes(item) ? "line-through text-muted-foreground" : ""}>{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
