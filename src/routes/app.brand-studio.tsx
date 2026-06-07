import { createFileRoute } from "@tanstack/react-router";
import { Palette, Globe, AtSign, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";

export const Route = createFileRoute("/app/brand-studio")({
  head: () => ({ meta: [{ title: "Brand Studio — PILOT AI" }] }),
  component: BrandStudio,
});

const palette = ["#0A0A0A", "#FFFFFF", "#1F8FFF", "#7CE0FF", "#F5F5F7"];

function BrandStudio() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Brand Studio"
        subtitle="Nome, logo, palette, font, tono di voce, dominio e checklist marchio."
        action={<Button>Genera identità completa</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader title="Nome proposto" icon={Palette} />
          <div className="flex flex-wrap gap-2">
            {["Lumio","Velora","Stryke","Norden","Pivora"].map((n, i) => (
              <button key={n} className={`rounded-xl border px-4 py-2.5 text-[13.5px] ${i===0?"border-foreground bg-foreground text-background":"border-border bg-surface hover:border-foreground/40"}`}>
                {n}
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Logo" />
          <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-surface text-foreground">
            <div className="font-display text-2xl font-semibold tracking-tight">Lumio<span className="text-brand">.</span></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Palette" />
          <div className="flex gap-2">
            {palette.map((c) => (
              <div key={c} className="flex-1 rounded-lg border border-border">
                <div className="h-14 rounded-t-lg" style={{ background: c }} />
                <div className="px-1.5 py-1 text-center text-[10px] text-muted-foreground">{c}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Font" />
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-surface p-3"><div className="font-display text-xl font-semibold">Display: SF Pro</div></div>
            <div className="rounded-lg border border-border bg-surface p-3"><div className="text-[14px]">Body: Inter</div></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Tono di voce" />
          <p className="text-[13.5px] text-muted-foreground">Diretto, chiaro, premium. Niente fuffa, niente buzzword. Frasi corte, esempi concreti.</p>
        </Card>

        <Card>
          <CardHeader title="Dominio" icon={Globe} />
          <ul className="space-y-1.5 text-[13.5px]">
            <li className="flex items-center justify-between"><span>lumio.com</span><Pill tone="warn">Occupato</Pill></li>
            <li className="flex items-center justify-between"><span>lumio.app</span><Pill tone="ok">Disponibile</Pill></li>
            <li className="flex items-center justify-between"><span>uselumio.com</span><Pill tone="ok">Disponibile</Pill></li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Social handle" icon={AtSign} />
          <ul className="space-y-1.5 text-[13.5px]">
            <li className="flex items-center justify-between"><span>@lumio</span><Pill tone="warn">Occupato</Pill></li>
            <li className="flex items-center justify-between"><span>@uselumio</span><Pill tone="ok">Disponibile</Pill></li>
            <li className="flex items-center justify-between"><span>@lumioapp</span><Pill tone="ok">Disponibile</Pill></li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Checklist marchio" icon={FileText} action={<Pill tone="warn">Guida iniziale, non consulenza legale</Pill>} />
          <ul className="space-y-1.5 text-[13.5px]">
            {[
              ["Verifica disponibilità nominativa", true],
              ["Controllo classi Nizza pertinenti", false],
              ["Ricerca anteriorità EU/IT", false],
              ["Decisione registrazione EUIPO", false],
            ].map(([t, ok]) => (
              <li key={t as string} className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${ok ? "text-brand" : "text-muted-foreground/40"}`} /> {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
