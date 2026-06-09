import { useNavigate } from "@/lib/nextCompat";
import { useState } from "react";
import { motion } from "framer-motion";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { getUser, setUser } from "@/lib/mockAuth";
import { ArrowRight } from "lucide-react";
import { generateProject } from "@/lib/projectGenerator";
import { saveProject } from "@/lib/projectStore";

export default Onboarding;

const steps = [
  { key: "idea", q: "Qual è la tua idea?", placeholder: "Es. App che aiuta freelance a gestire tasse e clienti…", type: "textarea" },
  { key: "sector", q: "In che settore opera?", options: ["SaaS","Fintech","Edtech","Health","Marketplace","E-commerce","AI Tool","Altro"] },
  { key: "type", q: "Che tipo di progetto è?", options: ["App","SaaS","Marketplace","Servizio","E-commerce","AI tool"] },
  { key: "target", q: "Chi è il tuo target?", placeholder: "Es. freelance creativi in Italia, 25-45 anni" },
  { key: "location", q: "Dove vuoi lanciarlo?", options: ["Italia","Europa","Mondo","Solo locale"] },
  { key: "budget", q: "Che budget hai disponibile?", options: ["< 500€","500–2.000€","2.000–10.000€","10.000–50.000€","> 50.000€"] },
  { key: "stage", q: "In che fase sei?", options: ["Solo un'idea","Sto validando","Sto costruendo","Già live"] },
  { key: "team", q: "Sei da solo o in team?", options: ["Solo founder","2–3 persone","4+ persone"] },
  { key: "goal", q: "Qual è il tuo obiettivo principale?", options: ["Validare l'idea","Lanciare un MVP","Trovare i primi clienti","Cercare investitori"] },
];

function Onboarding() {
  const nav = useNavigate();
  const user = getUser();
  const [i, setI] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const step = steps[i];
  const value = data[step.key] || "";
  const set = (v: string) => setData((d) => ({ ...d, [step.key]: v }));

  const next = () => {
    if (!value) return;
    if (i < steps.length - 1) setI(i + 1);
    else finalize();
  };

  const finalize = () => {
    setLoading(true);
    setTimeout(() => {
      const onboarding = {
        idea: data.idea || "",
        sector: data.sector || "",
        type: data.type || "",
        target: data.target || "",
        location: data.location || "",
        budget: data.budget || "",
        stage: data.stage || "",
        team: data.team || "",
        goal: data.goal || "",
      };
      const project = generateProject(onboarding);
      saveProject(project);
      setUser({
        ...user,
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
      nav({ to: "/app" });
    }, 1800);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
            <LogoMark size={56} className="text-brand" />
          </motion.div>
          <p className="mt-6 font-display text-lg">Pilot sta trasformando la tua idea</p>
          <p className="mt-1 text-[13.5px] text-muted-foreground">in un progetto operativo…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border px-5">
        <Logo size={22} />
        <div className="text-[12px] text-muted-foreground">{i + 1} / {steps.length}</div>
      </header>

      <div className="h-0.5 w-full bg-border">
        <motion.div className="h-full bg-brand" initial={false} animate={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-10">
        <motion.div key={step.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Passo {i + 1}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{step.q}</h1>

          <div className="mt-6 space-y-2.5">
            {step.type === "textarea" ? (
              <textarea
                rows={5}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={step.placeholder}
                className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-[15px] outline-none focus:border-brand"
              />
            ) : step.options ? (
              <div className="flex flex-wrap gap-2">
                {step.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => set(o)}
                    className={`rounded-xl border px-4 py-2.5 text-[14px] transition ${
                      value === o ? "border-foreground bg-foreground text-background" : "border-border bg-surface hover:border-foreground/40"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={step.placeholder}
                className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-[15px] outline-none focus:border-brand"
              />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => i > 0 && setI(i - 1)}
              className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={i === 0}
            >
              Indietro
            </button>
            <button
              onClick={next}
              disabled={!value}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-[13.5px] font-medium text-background disabled:opacity-40"
            >
              {i === steps.length - 1 ? "Genera il mio progetto" : "Avanti"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
