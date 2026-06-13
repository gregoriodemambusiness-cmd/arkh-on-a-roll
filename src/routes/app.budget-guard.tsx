import { Wallet, AlertTriangle, TrendingDown, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";
import { useProject, analyzeBudget, formatEuro } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";

function BudgetGuard() {
  const proj = useProject();
  const user = useUser();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!proj) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const b = analyzeBudget(proj);
  const tone = b.risk === "alto" ? "warn" : b.risk === "medio" ? "brand" : "ok";
  const ToneIcon = b.risk === "basso" ? CheckCircle2 : AlertTriangle;
  const pct = Math.min(100, Math.round((b.available / Math.max(1, b.estimated)) * 100));

  const runAI = async () => {
    const plan = user?.plan ?? "free";
    const usage = checkUsageLimit(plan);
    if (!usage.allowed) { setAiResult("Limite chiamate AI raggiunto. Upgrada il piano."); return; }

    setAiLoading(true);
    setAiResult(null);
    incrementUsage();
    const result = await askCoFounder(
      "Dimmi se il budget è sufficiente, quali feature tagliare se non lo è, e come ridurre i costi del 30%. Testo plain, no markdown, max 200 parole.",
      [
        `Budget disponibile: ${formatEuro(b.available)}`,
        `Costo MVP stimato: ${formatEuro(b.estimated)}`,
        `Differenza: ${formatEuro(b.delta)}`,
        `Rischio: ${b.risk}`,
        `Feature MVP essenziali: ${proj.mvpEssential.join(", ")}`,
        `Feature MVP da rimandare: ${proj.mvpDeferred.join(", ")}`,
        `Fase: ${proj.onboarding.stage}`,
        `Tipo progetto: ${proj.onboarding.type}`,
      ].join("\n"),
    );
    setAiLoading(false);
    setAiResult(result.ok ? result.text : `Errore: ${result.error}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Budget Guard" subtitle={`Confronto budget vs MVP — ${proj.name}`} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Budget disponibile</div>
          <div className="mt-1 font-display text-2xl font-semibold">{formatEuro(b.available)}</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{proj.onboarding.budget}</div>
        </Card>
        <Card>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Costo MVP stimato</div>
          <div className="mt-1 font-display text-2xl font-semibold">{formatEuro(b.estimated)}</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">Tipo: {proj.onboarding.type}</div>
        </Card>
        <Card>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Differenza</div>
          <div className={`mt-1 font-display text-2xl font-semibold ${b.delta < 0 ? "text-warning" : "text-success"}`}>
            {b.delta >= 0 ? "+" : "−"}{formatEuro(Math.abs(b.delta)).replace("€ ", "€ ")}
          </div>
        </Card>
        <Card>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Livello rischio</div>
          <div className="mt-1 flex items-center gap-2"><Pill tone={tone}>{b.risk.toUpperCase()}</Pill></div>
          <div className="mt-2"><ProgressBar value={pct} tone={tone === "ok" ? "ok" : tone === "warn" ? "warn" : "brand"} /></div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Raccomandazione Budget Guard"
          icon={ToneIcon}
          action={<Pill tone={tone}>Rischio {b.risk}</Pill>}
        />
        <div className={`rounded-xl border p-4 text-[14px] leading-relaxed ${b.risk === "alto" ? "border-warning/30 bg-warning/10 text-warning" : b.risk === "medio" ? "border-brand/30 bg-brand/5" : "border-success/30 bg-success/10 text-success"}`}>
          {b.recommendation}
        </div>
      </Card>

      {/* AI Budget Analysis */}
      <Card>
        <CardHeader title="Ottimizzazione AI" icon={Sparkles} subtitle="Analisi e riduzione costi con Claude" />
        <button
          onClick={runAI}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {aiLoading ? "Analisi in corso…" : "Ottimizza budget con AI"}
        </button>
        {aiResult && (
          <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4 text-[13.5px] leading-relaxed">
            {aiResult}
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Funzioni essenziali (incluse nell'MVP)" icon={Wallet} />
          <ul className="space-y-2 text-[13px]">
            {proj.mvpEssential.map((k) => (
              <li key={k} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> {k}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Funzioni da rimandare" icon={TrendingDown} />
          <ul className="space-y-2 text-[13px] text-muted-foreground">
            {proj.mvpDeferred.map((k) => (
              <li key={k} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" /> {k}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default BudgetGuard;
