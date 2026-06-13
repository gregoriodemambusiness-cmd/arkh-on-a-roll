"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight } from "lucide-react";

const DONE_KEY = "pilot-tutorial-done";

type Step = {
  selector: string | null;
  title: string;
  text: string;
  button: string;
};

const STEPS: Step[] = [
  {
    selector: '[data-tutorial="today-focus"]',
    title: "Il tuo focus di oggi",
    text: "Ogni giorno Pilot ti mostra i 3 task più importanti da completare. Non una lista infinita — solo quello che conta davvero oggi.",
    button: "Avanti",
  },
  {
    selector: '[data-tutorial="health-score"]',
    title: "La salute del tuo progetto",
    text: "Il tuo score misura 6 dimensioni chiave. Sotto 50 significa che c'è qualcosa di critico da sistemare subito.",
    button: "Avanti",
  },
  {
    selector: '[data-tutorial="cofounder-ai"]',
    title: "Il tuo co-founder AI",
    text: "Conosce il tuo progetto in ogni dettaglio. Chiedili cosa fare oggi, come ridurre i costi, come validare la tua idea. Risposte specifiche, non generiche.",
    button: "Avanti",
  },
  {
    selector: '[data-tutorial="journey"]',
    title: "Il tuo percorso startup",
    text: "Sei all'inizio di un percorso in 6 grandi fasi. Ogni mini-step completato ti avvicina al lancio.",
    button: "Avanti",
  },
  {
    selector: '[data-tutorial="budget-guard"]',
    title: "Proteggi il tuo budget",
    text: "Budget Guard ti avvisa prima che tu faccia errori costosi. È il tuo guardian finanziario.",
    button: "Avanti",
  },
  {
    selector: null,
    title: "Sei pronto a costruire!",
    text: "Hai tutto quello che ti serve. Inizia dal tuo primo task di oggi — o chiedi al Co-founder AI da dove partire.",
    button: "Inizia →",
  },
];

const PAD = 12;
const TOOLTIP_W = 340;
const TOOLTIP_H = 200;

type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number };

function getTooltipPos(rect: Rect, vw: number, vh: number): { top: number; left: number } {
  // Sidebar element (left third of screen): tooltip to the right
  if (rect.left < vw / 3) {
    return {
      left: Math.min(rect.right + PAD, vw - TOOLTIP_W - PAD),
      top: Math.max(PAD, Math.min(rect.top + rect.height / 2 - TOOLTIP_H / 2, vh - TOOLTIP_H - PAD)),
    };
  }
  // Main content: below if fits, else above
  if (rect.bottom + PAD + TOOLTIP_H < vh) {
    return {
      top: rect.bottom + PAD,
      left: Math.max(PAD, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - PAD)),
    };
  }
  return {
    top: Math.max(PAD, rect.top - TOOLTIP_H - PAD),
    left: Math.max(PAD, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - PAD)),
  };
}

export function AppTutorial() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(DONE_KEY)) {
      // Brief delay so dashboard elements have rendered
      const t = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const updateSpot = useCallback(() => {
    const sel = STEPS[step]?.selector;
    if (!sel) { setSpotRect(null); return; }
    const el = document.querySelector(sel);
    if (!el) { setSpotRect(null); return; }
    const r = el.getBoundingClientRect();
    setSpotRect({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    updateSpot();
    window.addEventListener("resize", updateSpot);
    return () => window.removeEventListener("resize", updateSpot);
  }, [active, updateSpot]);

  const finish = () => {
    localStorage.setItem(DONE_KEY, "1");
    setActive(false);
  };

  const next = () => {
    if (step >= STEPS.length - 1) { finish(); return; }
    setStep((s) => s + 1);
  };

  if (!mounted || !active) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cur = STEPS[step];

  // SVG path: outer rect (clockwise) + spotlight hole (counter-clockwise) with evenodd = hole
  let svgPath = `M 0 0 H ${vw} V ${vh} H 0 Z`;
  let glowRect: Rect | null = null;
  let tooltipPos = { top: vh / 2 - TOOLTIP_H / 2, left: vw / 2 - TOOLTIP_W / 2 };

  if (spotRect) {
    const x = spotRect.left - PAD;
    const y = spotRect.top - PAD;
    const w = spotRect.width + PAD * 2;
    const h = spotRect.height + PAD * 2;
    // Counter-clockwise inner path for the hole
    svgPath += ` M ${x} ${y} V ${y + h} H ${x + w} V ${y} Z`;
    glowRect = { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h };
    tooltipPos = getTooltipPos(spotRect, vw, vh);
  } else {
    tooltipPos = { top: vh / 2 - TOOLTIP_H / 2 - 20, left: vw / 2 - TOOLTIP_W / 2 };
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      {/* Dark overlay with spotlight hole */}
      <svg
        width={vw}
        height={vh}
        className="absolute inset-0"
        style={{ pointerEvents: "all" }}
        onClick={finish}
      >
        <path d={svgPath} fillRule="evenodd" fill="rgba(0,0,0,0.72)" />
        {/* Glow border around spotlight */}
        {glowRect && (
          <rect
            x={glowRect.left}
            y={glowRect.top}
            width={glowRect.width}
            height={glowRect.height}
            rx="10"
            fill="none"
            stroke="#7B2FFF"
            strokeWidth="2"
            opacity="0.85"
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        className="pointer-events-auto absolute rounded-2xl border border-brand/30 bg-card p-5 shadow-elegant"
        style={{ width: TOOLTIP_W, top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11.5px] font-medium text-brand">
            {step + 1} di {STEPS.length}
          </span>
          <button
            onClick={finish}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h3 className="font-display text-[16px] font-semibold tracking-tight">{cur.title}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{cur.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-4 bg-brand" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
          >
            {cur.button} {step < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
        <button
          onClick={finish}
          className="mt-2 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
        >
          Salta tutorial
        </button>
      </div>
    </div>,
    document.body,
  );
}
