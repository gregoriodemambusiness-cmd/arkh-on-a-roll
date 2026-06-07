import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill } from "@/components/app/ui";

export const Route = createFileRoute("/app/finance")({
  head: () => ({ meta: [{ title: "Finance — PILOT AI" }] }),
  component: Finance,
});

function Finance() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Finance" subtitle="Entrate, uscite, runway e proiezioni." />
      <div className="grid gap-4 md:grid-cols-4">
        {[["MRR","€0"],["Spese mese","€142"],["Cassa","€3.200"],["Runway","4 mesi"]].map(([k,v]) => (
          <Card key={k}><div className="text-[12px] uppercase tracking-wider text-muted-foreground">{k}</div><div className="mt-1 font-display text-2xl font-semibold">{v}</div></Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Movimenti recenti" icon={Receipt} />
        <div className="divide-y divide-border text-[13.5px]">
          {[["-€25","Supabase Pro","12 Mar"],["-€20","Resend","11 Mar"],["-€12","Notion","09 Mar"],["+€0","—","—"]].map(([a,d,t], i) => (
            <div key={i} className="flex items-center justify-between py-2"><span>{d}</span><span className="text-muted-foreground">{t}</span><Pill tone={a.startsWith("+")?"ok":"muted"}>{a}</Pill></div>
          ))}
        </div>
      </Card>
    </div>
  );
}
