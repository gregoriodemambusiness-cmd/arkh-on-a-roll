import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Calendar, FileText } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill } from "@/components/app/ui";

export const Route = createFileRoute("/app/marketing")({
  head: () => ({ meta: [{ title: "Marketing & Launch — ARKHEON AI" }] }),
  component: Marketing,
});

function Marketing() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Marketing & Launch" subtitle="Posizionamento, contenuti, script, ads, outreach e calendario lancio." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Posizionamento" icon={Megaphone} />
          <p className="text-[14px]">Il co-founder AI per founder seri che vogliono validare prima di costruire.</p>
        </Card>
        <Card>
          <CardHeader title="Landing copy" icon={FileText} />
          <ul className="space-y-1 text-[13.5px] text-muted-foreground">
            <li>• Hero: "Trasforma la tua idea in una startup organizzata."</li>
            <li>• Sotto-hero: "Prima valida. Poi costruisci."</li>
            <li>• CTA: "Inizia gratis"</li>
          </ul>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader title="Piano contenuti — 4 settimane" icon={Calendar} />
          <div className="grid gap-3 md:grid-cols-4">
            {["Validazione","MVP","Pricing","Lancio"].map((s, i) => (
              <div key={s} className="rounded-xl border border-border bg-surface/60 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Settimana {i+1}</div>
                <div className="mt-1 text-[13.5px] font-medium">{s}</div>
                <Pill tone="brand">3 post · 1 reel · 1 newsletter</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Ads — bozze" />
          <ul className="space-y-1.5 text-[13px]">
            <li>📱 IG · "Smetti di costruire MVP che nessuno usa."</li>
            <li>🔍 Google · "Validazione startup AI"</li>
            <li>💼 LinkedIn · "Per founder seri."</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Email outreach" />
          <ul className="space-y-1.5 text-[13px]">
            <li>📨 Cold-email v1 (founder 1° tempo)</li>
            <li>📨 Follow-up a 3 giorni</li>
            <li>📨 Case study breve</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
