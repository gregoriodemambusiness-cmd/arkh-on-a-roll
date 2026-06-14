"use client";
import { useState, useEffect } from "react";
import { Loader2, Sparkles, Copy, Check, Grid } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/app/ui";
import { useProject } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";

const CANVAS_SECTIONS = [
  { key: "problema", label: "Problema", desc: "Quale problema risolvi" },
  { key: "segmenti", label: "Segmenti clienti", desc: "Chi ha questo problema" },
  { key: "proposta", label: "Proposta di valore", desc: "Perche scegliere te" },
  { key: "soluzione", label: "Soluzione", desc: "Come risolvi il problema" },
  { key: "canali", label: "Canali", desc: "Come raggiungi i clienti" },
  { key: "revenue", label: "Revenue streams", desc: "Come guadagni" },
  { key: "costi", label: "Struttura costi", desc: "Cosa ti costa" },
  { key: "metriche", label: "Metriche chiave", desc: "Cosa misuri" },
  { key: "vantaggio", label: "Vantaggio competitivo", desc: "Cosa ti differenzia" },
] as const;

type SectionKey = typeof CANVAS_SECTIONS[number]["key"];
type CanvasData = Partial<Record<SectionKey, string>>;

const STORAGE_KEY = (id: string) => `pilot-mvp-canvas-${id}`;

export default function MVPCanvas() {
  const proj = useProject();
  const user = useUser();
  const [canvas, setCanvas] = useState<CanvasData>({});
  const [loading, setLoading] = useState<SectionKey | "all" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!proj) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY(proj.id));
      if (saved) setCanvas(JSON.parse(saved));
    } catch {}
  }, [proj]);

  const save = (key: SectionKey, value: string) => {
    if (!proj) return;
    const next = { ...canvas, [key]: value };
    setCanvas(next);
    try {
      localStorage.setItem(STORAGE_KEY(proj.id), JSON.stringify(next));
    } catch {}
  };

  const generateSection = async (key: SectionKey) => {
    if (!proj) return;
    const plan = user?.plan ?? "free";
    const usage = checkUsageLimit(plan);
    if (!usage.allowed) { save(key, "Limite AI raggiunto. Upgrada il piano."); return; }

    setLoading(key);
    incrementUsage();
    const section = CANVAS_SECTIONS.find((s) => s.key === key)!;
    const result = await askCoFounder(
      `Genera il contenuto per la sezione "${section.label}" (${section.desc}) del MVP Canvas. Basati SOLO sui dati reali del progetto. Risposta diretta, max 5 righe, testo plain senza emoji.`,
      [
        `Progetto: ${proj.name}`,
        `Problema: ${proj.blueprint?.problem}`,
        `Soluzione: ${proj.blueprint?.solution}`,
        `Target: ${proj.blueprint?.target}`,
        `Value Prop: ${proj.blueprint?.valueProp}`,
        `Business Model: ${proj.blueprint?.businessModel}`,
      ].join("\n"),
    );
    setLoading(null);
    if (result.ok) save(key, result.text);
  };

  const generateAll = async () => {
    if (!proj) return;
    const plan = user?.plan ?? "free";
    setLoading("all");
    for (const sec of CANVAS_SECTIONS) {
      const usage = checkUsageLimit(plan);
      if (!usage.allowed) break;
      incrementUsage();
      const result = await askCoFounder(
        `Genera il contenuto per la sezione "${sec.label}" (${sec.desc}) del MVP Canvas. Basati SOLO sui dati reali del progetto. Risposta diretta, max 4 righe, testo plain senza emoji.`,
        [
          `Progetto: ${proj.name}`,
          `Problema: ${proj.blueprint?.problem}`,
          `Soluzione: ${proj.blueprint?.solution}`,
          `Target: ${proj.blueprint?.target}`,
          `Value Prop: ${proj.blueprint?.valueProp}`,
          `Business Model: ${proj.blueprint?.businessModel}`,
        ].join("\n"),
      );
      if (result.ok) {
        setCanvas((prev) => {
          const next = { ...prev, [sec.key]: result.text };
          if (proj) {
            try { localStorage.setItem(STORAGE_KEY(proj.id), JSON.stringify(next)); } catch {}
          }
          return next;
        });
      }
    }
    setLoading(null);
  };

  const exportToClipboard = async () => {
    const text = CANVAS_SECTIONS.map((s) =>
      `${s.label.toUpperCase()}\n${canvas[s.key] || "(vuoto)"}`
    ).join("\n\n");
    await navigator.clipboard.writeText(`MVP CANVAS — ${proj?.name ?? ""}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!proj) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">
        Nessun progetto attivo.
      </div>
    );
  }

  const isGeneratingAll = loading === "all";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="MVP Canvas"
        subtitle="Definisci cosa costruire davvero"
        action={
          <div className="flex gap-2">
            <button
              onClick={exportToClipboard}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiato" : "Esporta"}
            </button>
            <button
              onClick={generateAll}
              disabled={isGeneratingAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {isGeneratingAll
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Sparkles className="h-3.5 w-3.5" />
              }
              {isGeneratingAll ? "Generazione..." : "Genera tutto con AI"}
            </button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        {CANVAS_SECTIONS.map((sec) => {
          const isLoading = loading === sec.key || isGeneratingAll;
          return (
            <Card key={sec.key} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] font-semibold">{sec.label}</div>
                  <div className="text-[11.5px] text-muted-foreground">{sec.desc}</div>
                </div>
                <button
                  onClick={() => generateSection(sec.key)}
                  disabled={!!loading}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/8 px-2 py-1 text-[11.5px] font-medium text-brand hover:bg-brand/15 disabled:opacity-50"
                >
                  {isLoading
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Sparkles className="h-3 w-3" />
                  }
                  {isLoading ? "" : "AI"}
                </button>
              </div>
              <textarea
                value={canvas[sec.key] ?? ""}
                onChange={(e) => save(sec.key, e.target.value)}
                placeholder={`Inserisci ${sec.desc.toLowerCase()}...`}
                rows={4}
                className="w-full flex-1 resize-none rounded-lg border border-transparent bg-surface/60 p-2.5 text-[13px] leading-relaxed transition hover:border-border focus:border-brand focus:bg-surface focus:outline-none"
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
