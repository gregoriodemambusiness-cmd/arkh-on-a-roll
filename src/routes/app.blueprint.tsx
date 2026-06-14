import { FileText, Download, Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, PageHeader, Button, Pill } from "@/components/app/ui";
import { useProject, updateBlueprint, type Blueprint } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";

const FIELDS: { key: keyof Blueprint; label: string }[] = [
  { key: "mission", label: "Mission" },
  { key: "vision", label: "Vision" },
  { key: "problem", label: "Problema" },
  { key: "solution", label: "Soluzione" },
  { key: "target", label: "Target" },
  { key: "valueProp", label: "Value Proposition" },
  { key: "businessModel", label: "Business Model" },
  { key: "mvp", label: "MVP" },
  { key: "goToMarket", label: "Go-to-market" },
  { key: "risks", label: "Rischi principali" },
  { key: "nextActions", label: "Prossime azioni" },
];

function BlueprintPage() {
  const proj = useProject();
  const user = useUser();
  const [local, setLocal] = useState<Blueprint | null>(null);
  const [saved, setSaved] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (proj && !local) setLocal(proj.blueprint);
  }, [proj]);

  if (!proj || !local) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const save = () => {
    updateBlueprint(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const runAI = async () => {
    const plan = user?.plan ?? "free";
    const usage = checkUsageLimit(plan);
    if (!usage.allowed) { setAiResult("Limite chiamate AI raggiunto. Upgrada il piano."); return; }

    setAiLoading(true);
    setAiResult(null);
    incrementUsage();
    const result = await askCoFounder(
      "Analizza SOLO i dati reali forniti. Se un dato non è disponibile di' esplicitamente che non è ancora nel progetto. Struttura la risposta con: 1. Situazione attuale del blueprint basata sui dati reali. 2. Almeno 3 punti critici numerati su value proposition e target. 3. Piano d'azione step by step con almeno 5 step concreti per migliorare il blueprint. 4. Una sola azione da fare nelle prossime 2 ore. Minimo 250 parole. Testo plain, no markdown, no asterischi.",
      [
        `Progetto: ${proj.name}`,
        `Problema: ${local.problem}`,
        `Soluzione: ${local.solution}`,
        `Target: ${local.target}`,
        `Value Proposition: ${local.valueProp}`,
        `Business Model: ${local.businessModel}`,
        `Mission: ${local.mission}`,
        `Vision: ${local.vision}`,
      ].join("\n"),
    );
    setAiLoading(false);
    setAiResult(result.ok ? result.text : `Errore: ${result.error}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Blueprint"
        subtitle={`${proj.name} — modifica e salva ogni sezione.`}
        action={
          <div className="flex gap-2">
            {saved && <Pill tone="ok"><Check className="h-3 w-3" /> Salvato</Pill>}
            <button
              onClick={runAI}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-brand/10 px-3.5 py-2 text-[13px] font-medium text-brand hover:bg-brand/20 disabled:opacity-60"
            >
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {aiLoading ? "Analisi…" : "Analizza con AI"}
            </button>
            <Button variant="secondary" onClick={save}>Salva modifiche</Button>
            <Button onClick={() => window.print()}><Download className="h-3.5 w-3.5" /> Esporta</Button>
          </div>
        }
      />

      {aiResult && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-[13.5px] leading-relaxed">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Suggerimenti AI per il Blueprint
          </div>
          {aiResult}
        </div>
      )}

      <Card>
        <CardHeader title="Documento" icon={FileText} subtitle={`${FIELDS.length} sezioni`} />
        <div className="divide-y divide-border">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
              <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
              <textarea
                value={local[key]}
                onChange={(e) => setLocal({ ...local, [key]: e.target.value })}
                rows={2}
                className="w-full resize-none rounded-lg border border-transparent bg-transparent p-2 text-[14.5px] leading-relaxed transition hover:border-border focus:border-brand focus:bg-surface"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default BlueprintPage;
