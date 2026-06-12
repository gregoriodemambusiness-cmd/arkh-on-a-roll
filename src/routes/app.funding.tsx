"use client";
import { useState } from "react";
import { Banknote, FileCheck2, Calendar, Lock, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar, Button } from "@/components/app/ui";
import { useProject } from "@/lib/projectStore";

const ALL_OPPS = [
  {
    n: "Smart&Start Italia",
    sectors: ["tech", "saas", "ai", "software", "innovazione"],
    match: 78,
    dl: "30/06/2026",
    req: ["Costituzione SRL", "Business plan", "Budget dettagliato"],
    url: "https://www.invitalia.it/cosa-facciamo/creiamo-nuove-aziende/smart-start-italia",
    amount: "Fino a €1.500.000",
  },
  {
    n: "Bando regionale innovazione",
    sectors: ["tech", "digital", "produzione", "innovazione", "software"],
    match: 84,
    dl: "15/05/2026",
    req: ["Sede operativa regionale", "Pitch deck", "Roadmap 12 mesi"],
    url: "https://www.mise.gov.it/",
    amount: "Fino a €200.000",
  },
  {
    n: "Acceleratore Tech EU",
    sectors: ["tech", "saas", "ai", "deep tech", "software"],
    match: 62,
    dl: "10/07/2026",
    req: ["MVP funzionante", "Trazione minima", "Team 2+ persone"],
    url: "https://eic.ec.europa.eu/",
    amount: "Fino a €2.500.000",
  },
  {
    n: "Grant ricerca AI",
    sectors: ["ai", "machine learning", "deep tech", "ricerca"],
    match: 35,
    dl: "Aperto",
    req: ["Validazione completa", "Team tecnico", "Partner accademico"],
    url: "https://horizon-europe.ec.europa.eu/",
    amount: "Variabile",
  },
  {
    n: "CDP Venture Capital",
    sectors: ["startup", "tech", "innovazione", "saas", "fintech"],
    match: 55,
    dl: "Continuo",
    req: ["Costituzione SRL/SPA", "Trazione dimostrabile", "Team esperienza"],
    url: "https://cdpventurecapital.it/",
    amount: "Seed 200K - 1M",
  },
];

function buildDraft(opp: typeof ALL_OPPS[0], projectName: string, problem: string, solution: string, target: string): string {
  return `BOZZA CANDIDATURA — ${opp.n}
Importo: ${opp.amount}
Deadline: ${opp.dl}

--- PROGETTO ---
Nome: ${projectName}

Problema affrontato:
${problem || "Descrivere il problema di mercato affrontato dal progetto."}

Soluzione proposta:
${solution || "Descrivere la soluzione e il suo impatto."}

Target di mercato:
${target || "Descrivere il segmento di mercato target."}

--- REQUISITI SODDISFATTI ---
${opp.req.map((r) => `☐ ${r}`).join("\n")}

--- NOTE ---
Personalizza questa bozza con i tuoi dati reali prima dell'invio.
Visita: ${opp.url}`;
}

export default function Funding() {
  const project = useProject();
  const [urlInput, setUrlInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sector = (project?.onboarding?.sector ?? "").toLowerCase();
  const projectName = project?.name ?? "Il tuo progetto";
  const problem = project?.blueprint?.problem ?? "";
  const solution = project?.blueprint?.solution ?? "";
  const target = project?.blueprint?.target ?? "";

  // Sort by sector relevance
  const opps = [...ALL_OPPS].sort((a, b) => {
    const aMatch = a.sectors.some((s) => sector.includes(s) || s.includes(sector));
    const bMatch = b.sectors.some((s) => sector.includes(s) || s.includes(sector));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return b.match - a.match;
  });

  const copyDraft = async (opp: typeof ALL_OPPS[0]) => {
    const draft = buildDraft(opp, projectName, problem, solution, target);
    await navigator.clipboard.writeText(draft);
    setCopiedId(opp.n);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const analyzeUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      const validUrl = url.startsWith("http") ? url : `https://${url}`;
      window.open(validUrl, "_blank", "noopener,noreferrer");
    } catch {
      // invalid url, do nothing
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Bandi & Funding"
        subtitle={`Opportunità che si sbloccano in base alla fase di ${projectName}.`}
      />

      {/* Analyze custom grant */}
      <Card>
        <CardHeader
          title="Analizza un bando"
          icon={FileCheck2}
          subtitle="Incolla il link del bando per aprirlo direttamente."
        />
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeUrl()}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
            placeholder="URL del bando (es. https://…)"
          />
          <Button onClick={analyzeUrl}>
            <ExternalLink className="h-3.5 w-3.5" /> Apri bando
          </Button>
        </div>
      </Card>

      {sector && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5 text-[13px] text-brand">
          Bandi ordinati per rilevanza rispetto al settore: <strong>{project?.onboarding?.sector}</strong>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {opps.map((o) => {
          const isLocked = o.match < 40;
          const tone = isLocked ? "muted" : o.match >= 75 ? "ok" : "brand";
          const copied = copiedId === o.n;

          return (
            <Card key={o.n}>
              <CardHeader
                title={o.n}
                icon={Banknote}
                subtitle={o.amount}
                action={
                  <Pill tone={tone}>
                    {isLocked && <Lock className="h-3 w-3" />} {o.match}%
                  </Pill>
                }
              />
              <div className="mb-2 flex justify-between text-[12.5px]">
                <span className="text-muted-foreground">Compatibilità</span>
                <span>{o.match}%</span>
              </div>
              <ProgressBar value={o.match} />
              <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Deadline: {o.dl}
              </div>
              <div className="mt-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Requisiti</div>
                <ul className="mt-1.5 space-y-1 text-[13px]">
                  {o.req.map((r) => <li key={r}>• {r}</li>)}
                </ul>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => copyDraft(o)}
                >
                  {copied
                    ? <><Check className="h-3.5 w-3.5 text-brand" /> Copiata!</>
                    : <><Copy className="h-3.5 w-3.5" /> Genera bozza</>
                  }
                </Button>
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-medium transition ${
                    isLocked
                      ? "cursor-not-allowed border-border bg-surface/40 text-muted-foreground/40"
                      : "border-foreground bg-foreground text-background hover:opacity-90"
                  }`}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Apri
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
