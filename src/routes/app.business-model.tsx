"use client";
import { useState, useEffect } from "react";
import { Coins, TrendingUp, Calculator, Edit3, Check } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";
import { useProject, updateProject } from "@/lib/projectStore";

function EditableMetric({
  label,
  value,
  suffix = "",
  prefix = "",
  onSave,
  readOnly,
  readOnlyLabel,
}: {
  label: string;
  value: number | undefined;
  suffix?: string;
  prefix?: string;
  onSave?: (v: number) => void;
  readOnly?: boolean;
  readOnlyLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const display = value !== undefined && value > 0
    ? `${prefix}${value.toLocaleString("it-IT")}${suffix}`
    : readOnlyLabel ?? "—";

  const startEdit = () => {
    if (readOnly) return;
    setDraft(value?.toString() ?? "");
    setEditing(true);
  };

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) onSave?.(n);
    setEditing(false);
  };

  return (
    <Card>
      <div className="text-[12px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {editing ? (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-muted-foreground">{prefix}</span>
          <input
            autoFocus
            type="number"
            min="0"
            step="0.01"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="w-24 rounded-lg border border-brand bg-surface px-2 py-1 font-display text-xl font-semibold outline-none"
          />
          <span className="text-muted-foreground">{suffix}</span>
          <button onClick={commit} className="text-brand"><Check className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <span className="font-display text-2xl font-semibold">{display}</span>
          {!readOnly && (
            <button onClick={startEdit} className="text-muted-foreground/40 hover:text-muted-foreground">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

const CHANNELS = [
  { label: "SEO + content", key: "seo" },
  { label: "Community founder", key: "community" },
  { label: "Partner & incubatori", key: "partner" },
  { label: "Paid ads", key: "ads" },
];

export default function BusinessModel() {
  const project = useProject();
  const [channelPct, setChannelPct] = useState([38, 26, 22, 14]);

  const bm = project?.businessModel ?? {};
  const arpu = bm.arpu;
  const cac = bm.cac;
  const churn = bm.churn;
  const ltv = arpu && churn && churn > 0 ? Math.round(arpu / (churn / 100)) : undefined;

  const saveArpu = (v: number) => updateProject((p) => ({ ...p, businessModel: { ...p.businessModel, arpu: v } }));
  const saveCac  = (v: number) => updateProject((p) => ({ ...p, businessModel: { ...p.businessModel, cac: v } }));
  const saveChurn = (v: number) => updateProject((p) => ({ ...p, businessModel: { ...p.businessModel, churn: v } }));

  // Derived scenarios based on real ARPU
  const base = arpu ? arpu * 100 : undefined;
  const conservative = base ? Math.round(base * 0.4) : undefined;
  const optimistic = base ? Math.round(base * 2.2) : undefined;

  const gmPct = cac && arpu && cac < arpu ? Math.round(((arpu - cac) / arpu) * 100) : undefined;

  useEffect(() => {
    // Randomize channels slightly based on project sector for variety
    const sector = project?.onboarding?.sector?.toLowerCase() ?? "";
    if (sector.includes("tech") || sector.includes("saas")) {
      setChannelPct([42, 22, 20, 16]);
    } else if (sector.includes("market") || sector.includes("e-commerce")) {
      setChannelPct([20, 18, 12, 50]);
    } else {
      setChannelPct([38, 26, 22, 14]);
    }
  }, [project?.onboarding?.sector]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Business Model"
        subtitle="Inserisci i tuoi dati reali per calcolare LTV, margini e scenari. Clicca su un valore per modificarlo."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <EditableMetric label="ARPU mensile" value={arpu} prefix="€" onSave={saveArpu} />
        <EditableMetric label="CAC stimato" value={cac} prefix="€" onSave={saveCac} />
        <EditableMetric label="Churn mensile" value={churn} suffix="%" onSave={saveChurn} />
        <EditableMetric
          label="LTV stimato"
          value={ltv}
          prefix="€"
          readOnly
          readOnlyLabel={arpu && churn ? "—" : "Inserisci ARPU e churn"}
        />
      </div>

      {arpu && churn ? null : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13.5px] text-amber-600">
          Inserisci ARPU e Churn per calcolare LTV, margine e scenari automaticamente.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Pricing attuale" icon={Coins} />
          <div className="space-y-2 text-[13.5px]">
            {[["Starter", "€23/m"], ["Pro", "€49/m"], ["Founder", "€99/m"], ["Enterprise", "custom"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2">
                <span>{k}</span><Pill tone="brand">{v}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Canali di vendita" icon={TrendingUp} />
          <ul className="space-y-2 text-[13.5px]">
            {CHANNELS.map((c, i) => (
              <li key={c.key}>
                <div className="flex justify-between">
                  <span>{c.label}</span>
                  <span className="text-muted-foreground">{channelPct[i]}%</span>
                </div>
                <ProgressBar value={channelPct[i]} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Scenari economici" icon={Calculator} subtitle={arpu ? "Basati sul tuo ARPU reale" : "Inserisci ARPU per calcoli reali"} />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { n: "Conservativo", mrr: conservative, be: "Mese 14" },
              { n: "Base", mrr: base, be: "Mese 9" },
              { n: "Ottimistico", mrr: optimistic, be: "Mese 6" },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-surface/60 p-4">
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground">{s.n}</div>
                <div className="mt-1 font-display text-xl font-semibold">
                  {s.mrr ? `€ ${s.mrr.toLocaleString("it-IT")}` : "—"}
                </div>
                <div className="text-[12px] text-muted-foreground">Break-even: {s.mrr ? s.be : "—"}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {gmPct !== undefined && (
        <Card>
          <CardHeader title="Metriche chiave" />
          <div className="grid gap-4 md:grid-cols-3 text-[13.5px]">
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Margine lordo</div>
              <div className="mt-1 font-display text-xl font-semibold">{gmPct}%</div>
            </div>
            {ltv && cac && (
              <div className="rounded-xl border border-border bg-surface/60 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">LTV / CAC ratio</div>
                <div className={`mt-1 font-display text-xl font-semibold ${(ltv / cac) >= 3 ? "text-emerald-500" : "text-amber-500"}`}>
                  {(ltv / cac).toFixed(1)}x
                </div>
              </div>
            )}
            {arpu && churn && (
              <div className="rounded-xl border border-border bg-surface/60 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Payback period</div>
                <div className="mt-1 font-display text-xl font-semibold">
                  {cac ? `${Math.round(cac / arpu)} mesi` : "—"}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
