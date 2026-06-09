import { ShieldCheck, MessageCircle, Users, TrendingUp } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";



function Validation() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Validation" subtitle="Misura interesse, problem-fit e willingness to pay prima di costruire." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader title="Interviste" icon={MessageCircle} action={<Pill tone="brand">7 / 20</Pill>} /><ProgressBar value={35} /></Card>
        <Card><CardHeader title="Waitlist" icon={Users} action={<Pill tone="brand">128</Pill>} /><ProgressBar value={64} /></Card>
        <Card><CardHeader title="Conversion waitlist" icon={TrendingUp} action={<Pill tone="ok">+12%</Pill>} /><ProgressBar value={42} /></Card>
      </div>
      <Card>
        <CardHeader title="Insight da interviste" icon={ShieldCheck} />
        <ul className="space-y-2 text-[13.5px]">
          {[
            "Il 80% spende già su strumenti generici (Notion, fogli) non specifici.",
            "Il vero dolore è 'non sapere cosa fare oggi', più che strumenti mancanti.",
            "La willingness to pay si attesta su €25–50/mese per founder solo.",
          ].map((i) => <li key={i} className="rounded-lg border border-border bg-surface/60 p-3">{i}</li>)}
        </ul>
      </Card>
    </div>
  );
}

export default Validation;
