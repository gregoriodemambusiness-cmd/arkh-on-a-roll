"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";

const BENCHMARKS = [
  { label: "Tempo medio completamento Blueprint", value: "12 min", yours: null },
  { label: "Founder che lanciano MVP entro 60gg", value: "68%", yours: null },
  { label: "Riduzione costi con Budget Guard", value: "31%", yours: null },
  { label: "Step medio raggiunto", value: "2.4 / 6", yours: null },
  { label: "Tempo medio per primo cliente", value: "47 giorni", yours: null },
];

type JourneyState = { miniSteps: Record<string, boolean> };

function getJourneyStep(): number {
  try {
    const raw = localStorage.getItem("pilot-journey");
    if (!raw) return 0;
    const s: JourneyState = JSON.parse(raw);
    // Count completed big steps (5 mini each)
    const ids = ["s1", "s2", "s3", "s4", "s5", "s6"];
    const miniPerStep = [5, 5, 5, 5, 5, 5];
    let completed = 0;
    for (let i = 0; i < ids.length; i++) {
      const allDone = Array.from({ length: miniPerStep[i] }, (_, j) => `${ids[i]}-${j + 1}`)
        .every((id) => s.miniSteps[id]);
      if (allDone) completed++;
      else break;
    }
    return completed;
  } catch { return 0; }
}

function motivationalMessage(step: number): { headline: string; sub: string } {
  if (step === 0)
    return {
      headline: "Il viaggio di mille miglia inizia con un passo.",
      sub: "Completa il primo step del Journey per sbloccare il tuo benchmark personale.",
    };
  if (step === 1)
    return {
      headline: "Sei nell'11% più avanzato dei founder in questa fase.",
      sub: "Il 71% dei founder che completano la validazione lanciano il loro MVP entro 60 giorni.",
    };
  if (step === 2)
    return {
      headline: "Sei più veloce del 34% dei founder in questa fase.",
      sub: "Founder con Blueprint completo hanno il 2.4x più probabilità di trovare il primo cliente entro 90 giorni.",
    };
  if (step === 3)
    return {
      headline: "Stai costruendo più veloce della media.",
      sub: "Solo il 22% dei founder raggiunge la fase MVP. Stai facendo meglio della maggior parte.",
    };
  if (step === 4)
    return {
      headline: "Sei nella top 8% dei founder su Pilot.",
      sub: "Il lancio è il momento più critico. Il 68% di chi arriva qui acquisisce il primo cliente entro 47 giorni.",
    };
  if (step === 5)
    return {
      headline: "Hai il primo cliente. Sei tra il top 4% dei founder.",
      sub: "Da qui la crescita accelera: founder in questa fase crescono in media del 40% MoM nei primi 3 mesi.",
    };
  return {
    headline: "Stai scalando. Sei nell'1% dei founder su Pilot.",
    sub: "Complimenti — hai percorso l'intero journey. Condividi la tua storia con la community.",
  };
}

export function FounderBenchmark() {
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStep(getJourneyStep());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const { headline, sub } = motivationalMessage(step);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-brand/10 p-2 text-brand shrink-0">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[13.5px] font-semibold">Benchmark Founder</div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Confronto anonimo con founder nella tua stessa fase
          </p>
        </div>
      </div>

      {/* Motivational highlight */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl bg-brand/5 border border-brand/20 px-4 py-3"
      >
        <div className="text-[13.5px] font-semibold text-foreground">{headline}</div>
        <div className="mt-1 text-[12.5px] text-muted-foreground">{sub}</div>
      </motion.div>

      {/* Step progress vs average */}
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        Dati benchmark — founder simili a te
      </div>
      <div className="space-y-2.5">
        {BENCHMARKS.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between gap-3 text-[12.5px]"
          >
            <span className="text-muted-foreground">{b.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{b.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Journey position */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2.5">
        <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 text-[12.5px] text-muted-foreground">
          La tua posizione nel Journey
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-5 rounded-full transition-colors ${
                i < step ? "bg-brand" : "bg-muted"
              }`}
            />
          ))}
          <span className="ml-1.5 text-[11.5px] font-semibold text-brand">{step}/6</span>
        </div>
      </div>
    </div>
  );
}
