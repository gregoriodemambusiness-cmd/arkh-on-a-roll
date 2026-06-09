import { Banknote, FileCheck2, Calendar, Lock, Sparkles } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar, Button } from "@/components/app/ui";



const opps = [
  { n: "Smart&Start Italia", s: "Suggested", match: 78, dl: "30/06/2026", req: ["Costituzione SRL","Business plan","Budget dettagliato"] },
  { n: "Bando regionale innovazione", s: "Active", match: 84, dl: "15/05/2026", req: ["Sede operativa regionale","Pitch deck","Roadmap 12 mesi"] },
  { n: "Acceleratore Tech EU", s: "Unlocked", match: 62, dl: "10/07/2026", req: ["MVP funzionante","Trazione minima","Team 2+ persone"] },
  { n: "Grant ricerca AI", s: "Locked", match: 35, dl: "—", req: ["Validazione completa","Team tecnico"] },
];

function Funding() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Bandi & Funding" subtitle="Opportunità che si sbloccano in base alla fase del tuo progetto."
        action={<Button><Sparkles className="h-3.5 w-3.5" /> Analizza un bando</Button>} />

      <Card>
        <CardHeader title="Aggiungi bando" icon={FileCheck2} subtitle="Incolla il testo o il link del bando per ottenere compatibilità, requisiti e bozza candidatura." />
        <div className="flex flex-col gap-2 md:flex-row">
          <input className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" placeholder="URL o testo del bando…" />
          <Button>Analizza</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {opps.map((o) => (
          <Card key={o.n}>
            <CardHeader
              title={o.n}
              icon={Banknote}
              action={
                <Pill tone={o.s === "Active" ? "ok" : o.s === "Locked" ? "muted" : o.s === "Unlocked" ? "brand" : "warn"}>
                  {o.s === "Locked" && <Lock className="h-3 w-3" />} {o.s}
                </Pill>
              }
            />
            <div className="mb-2 flex justify-between text-[12.5px]"><span className="text-muted-foreground">Compatibilità</span><span>{o.match}%</span></div>
            <ProgressBar value={o.match} />
            <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Deadline: {o.dl}</div>
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Requisiti</div>
              <ul className="mt-1.5 space-y-1 text-[13px]">
                {o.req.map((r) => <li key={r}>• {r}</li>)}
              </ul>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1">Genera bozza</Button>
              <Button className="flex-1" disabled={o.s === "Locked"}>Apri</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Funding;
