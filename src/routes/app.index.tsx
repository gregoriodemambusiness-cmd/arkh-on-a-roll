import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Target, BarChart3, Wallet, Map, Sparkles, ShieldAlert, Palette, Banknote,
  ArrowRight, CheckCircle2, AlertTriangle, Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/lib/mockAuth";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — ARKHEON AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useUser();
  const proj = user?.project;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`Buongiorno, ${user?.name?.split(" ")[0] || "Founder"}.`}
        subtitle={proj ? `Progetto: ${proj.name} — ${proj.stage}` : "Inizia creando il tuo primo progetto."}
        action={
          <div className="flex gap-2">
            <Button variant="secondary">Nuovo progetto</Button>
            <Button>Continua dove avevo lasciato <ArrowRight className="h-3.5 w-3.5" /></Button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Today Focus */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Today Focus" subtitle="3 task prioritari per oggi" icon={Target}
            action={<Pill tone="brand">3 task</Pill>} />
          <div className="space-y-2.5">
            {[
              { t: "Definisci value proposition", d: "30m", o: "1 frase chiara", p: "Alta" },
              { t: "Intervista 5 utenti target", d: "2h", o: "Note + pattern", p: "Alta" },
              { t: "Bozza landing page", d: "1h", o: "Hero + CTA", p: "Media" },
            ].map((t, i) => (
              <motion.div
                key={t.t}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface/60 p-3 hover:border-foreground/20"
              >
                <span className={`h-2 w-2 rounded-full ${i === 0 ? "bg-brand" : "bg-muted-foreground/40"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">{t.t}</div>
                  <div className="text-[11.5px] text-muted-foreground">{t.d} · Output atteso: {t.o}</div>
                </div>
                <Pill tone={t.p === "Alta" ? "warn" : "muted"}>{t.p}</Pill>
                <Button variant="secondary">Chiedi all'AI</Button>
                <Button>Inizia</Button>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Startup Health */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-5">
          <CardHeader title="Startup Health Score" icon={BarChart3} subtitle="Aggiornato oggi" />
          <div className="flex items-end gap-3">
            <div className="font-display text-5xl font-semibold">72</div>
            <div className="mb-2 text-[12px] text-muted-foreground">/ 100</div>
            <Pill tone="ok">+8 questa settimana</Pill>
          </div>
          <ProgressBar value={72} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-[12.5px]">
            {[
              ["Idea", 85], ["Target", 78], ["Business Model", 62],
              ["MVP", 60], ["Marketing", 55], ["Validation", 48],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg border border-border bg-surface/60 p-2">
                <div className="flex justify-between text-muted-foreground"><span>{k}</span><span>{v}</span></div>
                <ProgressBar value={v as number} tone={(v as number) < 60 ? "warn" : "brand"} />
              </div>
            ))}
          </div>
        </Card>

        {/* Project Snapshot */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Project Snapshot" subtitle="One-line, fase, prossimo milestone" />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Nome</div>
              <div className="font-display text-lg font-semibold">{proj?.name || "La mia startup"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">One-line pitch</div>
              <div className="text-[14px]">{proj?.idea ? `${proj.idea.slice(0, 120)}…` : "Una soluzione che aiuta il tuo target a risolvere un problema reale."}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Fase</div>
              <div className="text-[14px]">{proj?.stage || "Validazione"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Prossimo milestone</div>
              <div className="text-[14px]">Completare 20 interviste utente</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ultima modifica</div>
              <div className="text-[14px]">2 ore fa</div>
            </div>
          </div>
        </Card>

        {/* Budget Guard */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-5">
          <CardHeader title="Budget Guard" icon={Wallet} subtitle="Niente budget bruciato"
            action={<Link to="/app/budget-guard" className="text-[12px] text-muted-foreground hover:text-foreground">Apri →</Link>} />
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <Stat label="Disponibile" value="€ 3.200" />
            <Stat label="MVP stimato" value="€ 5.800" tone="warn" />
            <Stat label="Runway" value="4 mesi" />
            <Stat label="Tool attivi" value="€ 142/m" />
          </div>
          <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[12.5px] text-warning">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
            Riduci da 18 a 3 funzioni essenziali per rientrare nel budget.
          </div>
        </Card>

        {/* Roadmap */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader title="Roadmap 30 / 60 / 90" icon={Map}
            action={<Link to="/app/roadmap" className="text-[12px] text-muted-foreground hover:text-foreground">Apri →</Link>} />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { p: "Validazione", d: "30 giorni", v: 60, items: ["20 interviste","Landing waitlist","Test pricing"] },
              { p: "MVP", d: "60 giorni", v: 25, items: ["Flusso core","Onboarding","Pagamenti"] },
              { p: "Lancio", d: "90 giorni", v: 5, items: ["Launch plan","Press kit","Primi 100 utenti"] },
            ].map((c) => (
              <div key={c.p} className="rounded-xl border border-border bg-surface/60 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold">{c.p}</div>
                  <Pill>{c.d}</Pill>
                </div>
                <div className="mt-2"><ProgressBar value={c.v} /></div>
                <ul className="mt-3 space-y-1.5 text-[12.5px] text-muted-foreground">
                  {c.items.map((i) => <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-brand" /> {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Co-founder AI */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Co-founder AI" icon={Sparkles} subtitle="Chat contestuale del progetto" />
          <div className="space-y-2 text-[13px]">
            <div className="rounded-xl bg-muted px-3 py-2">Da dove inizio per validare la mia idea?</div>
            <div className="rounded-xl border border-brand/30 bg-brand/5 px-3 py-2">
              Identifica 20 persone del tuo target. Intervistale con 5 domande aperte sul problema, non sulla soluzione.
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11.5px]">
            {["Genera 5 domande","Crea outline pitch","Trova competitor","Stima MVP"].map((s) => (
              <button key={s} className="rounded-full border border-border bg-surface px-2.5 py-1 text-muted-foreground hover:border-brand hover:text-foreground">{s}</button>
            ))}
          </div>
          <Link to="/app/co-founder" className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-muted-foreground hover:border-brand hover:text-foreground">
            <input className="flex-1 bg-transparent outline-none" placeholder="Chiedi al tuo co-founder…" readOnly />
            <Send className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Founder Guard */}
        <Card className="col-span-12 sm:col-span-6">
          <CardHeader title="Founder Guard" icon={ShieldAlert} subtitle="Errori da evitare oggi"
            action={<Pill tone="warn">Risk score 38</Pill>} />
          <div className="space-y-2 text-[13px]">
            {[
              { sev: "Alta", area: "MVP", t: "MVP troppo grande: 18 feature pianificate" },
              { sev: "Media", area: "Validation", t: "Nessuna intervista completata" },
              { sev: "Bassa", area: "Tool", t: "Stripe attivato prima del lancio" },
            ].map((r) => (
              <div key={r.t} className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
                <AlertTriangle className={`mt-0.5 h-4 w-4 ${r.sev === "Alta" ? "text-destructive" : r.sev === "Media" ? "text-warning" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <div className="font-medium">{r.t}</div>
                  <div className="text-[11.5px] text-muted-foreground">{r.area} · gravità {r.sev}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Brand Progress */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3">
          <CardHeader title="Brand Progress" icon={Palette} />
          <ul className="space-y-2 text-[13px]">
            {[
              ["Nome", true], ["Logo", true], ["Palette", true],
              ["Dominio", false], ["Social handle", false], ["Marchio", false],
            ].map(([k, v]) => (
              <li key={k as string} className="flex items-center justify-between">
                <span className="text-muted-foreground">{k}</span>
                {v ? <Pill tone="ok">✓</Pill> : <Pill>—</Pill>}
              </li>
            ))}
          </ul>
        </Card>

        {/* Funding */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3">
          <CardHeader title="Funding Status" icon={Banknote} />
          <ul className="space-y-2 text-[13px]">
            {[
              ["Smart&Start", "suggested"], ["Bando regionale", "locked"],
              ["Acceleratore X", "unlocked"], ["Pitch competition", "active"],
            ].map(([k, s]) => (
              <li key={k as string} className="flex items-center justify-between">
                <span>{k}</span>
                <Pill tone={s === "active" ? "ok" : s === "locked" ? "muted" : s === "suggested" ? "warn" : "brand"}>{s as string}</Pill>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={`rounded-xl border border-border bg-surface/60 p-3 ${tone === "warn" ? "border-warning/30" : ""}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-display text-lg font-semibold ${tone === "warn" ? "text-warning" : ""}`}>{value}</div>
    </div>
  );
}
