import { createFileRoute } from "@tanstack/react-router";
import { Wallet, AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";

export const Route = createFileRoute("/app/budget-guard")({
  head: () => ({ meta: [{ title: "Budget Guard — ARKHEON AI" }] }),
  component: BudgetGuard,
});

function BudgetGuard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Budget Guard" subtitle="Protegge il tuo budget. Niente sviluppo prima della validazione." />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Budget disponibile","€ 3.200"],
          ["MVP stimato","€ 5.800"],
          ["Spese previste","€ 4.100"],
          ["Runway","4 mesi"],
        ].map(([k,v]) => (
          <Card key={k}>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-2xl font-semibold">{v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Alert attivi" icon={AlertTriangle} action={<Pill tone="warn">3 alert</Pill>} />
        <div className="space-y-2">
          {[
            "Hai 400€ disponibili, ma il tuo MVP stimato costa 2.800€.",
            "Riduci da 18 feature a 3 funzioni essenziali.",
            "Stai pianificando sviluppo prima della validazione.",
          ].map((a) => (
            <div key={a} className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-[13.5px] text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {a}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Tool attivi" icon={Wallet} />
          <ul className="space-y-2 text-[13px]">
            {[
              ["Vercel","€ 0"],["Supabase","€ 25/m"],["Stripe","€ 0"],["Resend","€ 20/m"],["Posthog","€ 0"],["Notion","€ 12/m"],
            ].map(([k,v]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><span className="text-muted-foreground">{v}</span></li>
            ))}
          </ul>
          <div className="mt-3"><Pill tone="brand">Totale: € 57/m</Pill></div>
        </Card>
        <Card>
          <CardHeader title="Distribuzione spesa" icon={TrendingDown} />
          {[
            ["Sviluppo", 60], ["Marketing", 20], ["Tool", 12], ["Legal", 8],
          ].map(([k,v]) => (
            <div key={k as string} className="mb-3">
              <div className="mb-1 flex justify-between text-[12.5px]"><span>{k}</span><span className="text-muted-foreground">{v}%</span></div>
              <ProgressBar value={v as number} tone={(v as number) > 50 ? "warn" : "brand"} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
