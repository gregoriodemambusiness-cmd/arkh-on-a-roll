import { createFileRoute } from "@tanstack/react-router";
import { Coins, TrendingUp, Calculator } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";

export const Route = createFileRoute("/app/business-model")({
  head: () => ({ meta: [{ title: "Business Model — ARKHEON AI" }] }),
  component: BusinessModel,
});

function BusinessModel() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Business Model" subtitle="Pricing, ricavi, costi, margini, CAC/LTV e scenari." />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { k: "ARPU", v: "€49" },
          { k: "CAC stimato", v: "€38" },
          { k: "LTV stimato", v: "€720" },
          { k: "Margine lordo", v: "82%" },
        ].map((s) => (
          <Card key={s.k}>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
            <div className="mt-1 font-display text-2xl font-semibold">{s.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Pricing" icon={Coins} />
          <div className="space-y-2 text-[13.5px]">
            {[
              ["Starter","€23/m"], ["Pro","€49/m"], ["Founder","€99/m"], ["Enterprise","custom"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2">
                <span>{k}</span><Pill tone="brand">{v}</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Canali di vendita" icon={TrendingUp} />
          <ul className="space-y-2 text-[13.5px]">
            <li className="flex justify-between"><span>SEO + content</span><span className="text-muted-foreground">38%</span></li>
            <li><ProgressBar value={38} /></li>
            <li className="flex justify-between pt-2"><span>Community founder</span><span className="text-muted-foreground">26%</span></li>
            <li><ProgressBar value={26} /></li>
            <li className="flex justify-between pt-2"><span>Partner & incubatori</span><span className="text-muted-foreground">22%</span></li>
            <li><ProgressBar value={22} /></li>
            <li className="flex justify-between pt-2"><span>Paid ads</span><span className="text-muted-foreground">14%</span></li>
            <li><ProgressBar value={14} /></li>
          </ul>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Scenari economici" icon={Calculator} />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { n: "Conservativo", mrr: "€8.000", be: "Mese 14" },
              { n: "Base", mrr: "€22.000", be: "Mese 9" },
              { n: "Ottimistico", mrr: "€48.000", be: "Mese 6" },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-surface/60 p-4">
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground">{s.n}</div>
                <div className="mt-1 font-display text-xl font-semibold">{s.mrr}</div>
                <div className="text-[12px] text-muted-foreground">Break-even: {s.be}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
