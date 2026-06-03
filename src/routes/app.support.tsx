import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Sparkles, Send, Search } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { useState } from "react";

export const Route = createFileRoute("/app/support")({
  head: () => ({ meta: [{ title: "Support — ARKHEON AI" }] }),
  component: Support,
});

const faqs = [
  { q: "Come funziona la capacità mensile inclusa?", a: "Ogni piano include un utilizzo equo pensato per la tua fase. Se cresci, ti proponiamo il piano più adatto." },
  { q: "Posso usare ARKHEON AI con il mio team?", a: "Sì, dai piani Founder ed Enterprise hai workspace e ruoli." },
  { q: "Come esporto il mio progetto?", a: "Da Settings → Data & Export oppure dal singolo modulo (Blueprint, Pitch, Task)." },
];

function Support() {
  const [q, setQ] = useState("");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Support" subtitle="Help Center, guide, ticket e Support AI." />

      <Card>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nel Help Center…" className="flex-1 bg-transparent text-[14px] outline-none" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Support AI" icon={Sparkles} subtitle="Ti aiuta sull'uso della piattaforma." action={<Pill tone="brand">Online</Pill>} />
          <div className="space-y-2 text-[13.5px]">
            <div className="rounded-xl bg-muted px-3 py-2">Come cambio piano?</div>
            <div className="rounded-xl border border-brand/30 bg-brand/5 px-3 py-2">Da Plan & Usage → "Cambia piano". L'upgrade è immediato; il downgrade parte al ciclo successivo.</div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
            <input className="flex-1 bg-transparent px-2 text-[14px] outline-none" placeholder="Chiedi al Support AI…" />
            <Button><Send className="h-3 w-3" /></Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Apri ticket" icon={LifeBuoy} />
          <div className="space-y-2">
            <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[14px]">
              <option>Categoria</option><option>Account</option><option>Pagamenti</option><option>Bug</option><option>Feature request</option>
            </select>
            <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[14px]" placeholder="Oggetto" />
            <textarea rows={4} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[14px]" placeholder="Descrivi il problema…" />
            <div className="flex items-center justify-between">
              <select className="rounded-lg border border-border bg-surface px-3 py-2 text-[13px]">
                <option>Priorità: Normale</option><option>Priorità: Alta</option><option>Priorità: Bassa</option>
              </select>
              <Button>Invia richiesta</Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="FAQ" />
        <div className="divide-y divide-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="flex cursor-pointer items-center justify-between text-[14px] font-medium">{f.q}<span className="text-muted-foreground transition group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-[13.5px] text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Livello di supporto per piano" />
        <ul className="grid gap-2 text-[13px] md:grid-cols-2">
          {[
            ["Free","Help Center + FAQ"],
            ["Starter","Email standard"],
            ["Pro","Supporto prioritario"],
            ["Founder","Supporto avanzato"],
            ["Enterprise","Dedicato + onboarding + SLA"],
          ].map(([k,v]) => (
            <li key={k} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2"><span className="font-medium">{k}</span><span className="text-muted-foreground">{v}</span></li>
          ))}
        </ul>
      </Card>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="text-[14px] font-semibold">Hai bisogno di un'automazione su misura?</div>
            <div className="text-[13px] text-muted-foreground">Scopri ARKHEON Studio: analisi processi, app, dashboard e AI agent costruiti dal nostro team.</div>
          </div>
          <a href="/studio" target="_blank" rel="noreferrer" className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-accent">Scopri Studio</a>
        </div>
      </div>
    </div>
  );
}
