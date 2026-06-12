"use client";
import { useState } from "react";
import { Palette, Globe, AtSign, FileText, CheckCircle2, Loader2, Check, Copy, Wand2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { useProject, updateProject } from "@/lib/projectStore";

const SECTOR_PALETTES: Record<string, string[]> = {
  tech:     ["#0A0A0A", "#FFFFFF", "#1F8FFF", "#7CE0FF", "#F5F5F7"],
  health:   ["#0A0A0A", "#FFFFFF", "#10B981", "#6EE7B7", "#F0FDF4"],
  finance:  ["#0A0A0A", "#FFFFFF", "#6366F1", "#A5B4FC", "#F5F3FF"],
  food:     ["#0A0A0A", "#FFFFFF", "#F59E0B", "#FCD34D", "#FFFBEB"],
  education:["#0A0A0A", "#FFFFFF", "#8B5CF6", "#C4B5FD", "#F5F3FF"],
  default:  ["#0A0A0A", "#FFFFFF", "#1F8FFF", "#7CE0FF", "#F5F5F7"],
};

function getPalette(sector: string): string[] {
  const s = sector?.toLowerCase() ?? "";
  if (s.includes("health") || s.includes("medic") || s.includes("salute")) return SECTOR_PALETTES.health;
  if (s.includes("finan") || s.includes("invest") || s.includes("fintech")) return SECTOR_PALETTES.finance;
  if (s.includes("food") || s.includes("ristor") || s.includes("food")) return SECTOR_PALETTES.food;
  if (s.includes("edu") || s.includes("form") || s.includes("scuol")) return SECTOR_PALETTES.education;
  if (s.includes("tech") || s.includes("saas") || s.includes("ai") || s.includes("software")) return SECTOR_PALETTES.tech;
  return SECTOR_PALETTES.default;
}

function generateNameVariants(base: string): string[] {
  if (!base) return [];
  const clean = base.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
  const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
  const lower = clean.toLowerCase();
  return [
    cap,
    `${cap}ly`,
    `${cap}AI`,
    `Go${cap}`,
    `Use${cap}`,
  ].slice(0, 5);
}

const CHECKLIST = [
  "Verifica disponibilità nominativa",
  "Controllo classi Nizza pertinenti",
  "Ricerca anteriorità EU/IT",
  "Decisione registrazione EUIPO",
];

export default function BrandStudio() {
  const project = useProject();
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const brandData = project?.brand ?? {};
  const projectName = project?.name ?? "";
  const sector = project?.onboarding?.sector ?? "";

  const selectedName = brandData.selectedName ?? projectName;
  const colors = brandData.colors ?? getPalette(sector);
  const nameVariants = generateNameVariants(projectName);

  const selectName = (name: string) => {
    updateProject((p) => ({ ...p, brand: { ...p.brand, selectedName: name } }));
  };

  const generateIdentity = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newColors = getPalette(sector);
    updateProject((p) => ({ ...p, brand: { ...p.brand, colors: newColors } }));
    setGenerating(false);
  };

  const copyColor = async (color: string) => {
    await navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  const domainName = (selectedName || projectName).toLowerCase().replace(/\s+/g, "");
  const domainUrl = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domainName)}`;
  const socialUrl = `https://www.namecheckr.com/${encodeURIComponent(domainName)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Brand Studio"
        subtitle={`Identità visiva per ${projectName || "il tuo progetto"} — nome, palette, dominio e checklist marchio.`}
        action={
          <Button onClick={generateIdentity} disabled={generating}>
            {generating ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generando…</>
            ) : (
              <><Wand2 className="h-3.5 w-3.5" /> Genera identità</>
            )}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {/* Name variants */}
        <Card className="md:col-span-2">
          <CardHeader title="Nome proposto" icon={Palette} subtitle="Basato sul nome del tuo progetto" />
          {nameVariants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nameVariants.map((n) => (
                <button
                  key={n}
                  onClick={() => selectName(n)}
                  className={`rounded-xl border px-4 py-2.5 text-[13.5px] transition ${
                    (selectedName || projectName) === n
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface hover:border-foreground/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[13.5px] text-muted-foreground">
              Crea prima un progetto con un nome per generare varianti del brand.
            </p>
          )}
        </Card>

        {/* Logo preview */}
        <Card>
          <CardHeader title="Logo preview" />
          <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-surface text-foreground">
            <div className="font-display text-2xl font-semibold tracking-tight">
              {selectedName || projectName || "Pilot"}<span className="text-brand">.</span>
            </div>
          </div>
        </Card>

        {/* Palette */}
        <Card>
          <CardHeader title="Palette colori" subtitle="Clicca per copiare il codice hex" />
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => copyColor(c)}
                className="group flex-1 rounded-lg border border-border transition hover:border-foreground/30"
                title={`Copia ${c}`}
              >
                <div className="h-14 rounded-t-lg" style={{ background: c }} />
                <div className="flex items-center justify-center gap-1 px-1.5 py-1 text-center text-[10px] text-muted-foreground">
                  {copied === c ? <Check className="h-3 w-3 text-brand" /> : null}
                  {c}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Font */}
        <Card>
          <CardHeader title="Font" />
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="font-display text-xl font-semibold">Display: SF Pro</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-[14px]">Body: Inter</div>
            </div>
          </div>
        </Card>

        {/* Tone of voice */}
        <Card>
          <CardHeader title="Tono di voce" />
          <p className="text-[13.5px] text-muted-foreground">
            Diretto, chiaro, premium. Niente fuffa, niente buzzword. Frasi corte, esempi concreti.
          </p>
        </Card>

        {/* Domain */}
        <Card>
          <CardHeader title="Dominio" icon={Globe} />
          <ul className="space-y-2 text-[13.5px]">
            {[`${domainName}.com`, `${domainName}.app`, `use${domainName}.com`].map((d) => (
              <li key={d} className="flex items-center justify-between">
                <span>{d}</span>
                <a
                  href={domainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-2.5 py-1 text-[11.5px] font-medium hover:bg-accent"
                >
                  Cerca →
                </a>
              </li>
            ))}
          </ul>
        </Card>

        {/* Social handles */}
        <Card>
          <CardHeader title="Social handle" icon={AtSign} />
          <ul className="space-y-2 text-[13.5px]">
            {[`@${domainName}`, `@use${domainName}`, `@${domainName}app`].map((h) => (
              <li key={h} className="flex items-center justify-between">
                <span>{h}</span>
                <a
                  href={socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-2.5 py-1 text-[11.5px] font-medium hover:bg-accent"
                >
                  Verifica →
                </a>
              </li>
            ))}
          </ul>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader title="Checklist marchio" icon={FileText} action={<Pill tone="warn">Guida iniziale, non consulenza legale</Pill>} />
          <ul className="space-y-1.5 text-[13.5px]">
            {CHECKLIST.map((t, i) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${i === 0 ? "text-brand" : "text-muted-foreground/40"}`} />
                {t}
              </li>
            ))}
          </ul>
          <a
            href="https://euipo.europa.eu/eSearch/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[12.5px] text-brand hover:underline"
          >
            Cerca marchi su EUIPO →
          </a>
        </Card>
      </div>
    </div>
  );
}
