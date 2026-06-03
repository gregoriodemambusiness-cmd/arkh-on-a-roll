import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight, Sparkles, ShieldCheck, Wallet, Map, ListChecks, Target,
  Check, Star, Quote, Lightbulb, Building2, GraduationCap, Rocket, Zap, BarChart3, Cog,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARKHEON AI — Dalla tua idea alla tua startup." },
      { name: "description", content: "Il co-founder AI che trasforma la tua idea in una startup organizzata. Business model, MVP, roadmap, brand, budget e piano di lancio." },
      { property: "og:title", content: "ARKHEON AI — Dalla tua idea alla tua startup." },
      { property: "og:description", content: "Prima valida. Poi costruisci." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <Hero />
      <IdeaAnalyzer />
      <ChoosePath />
      <DashboardPreview />
      <Features />
      <Targets />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function PublicNav() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-5">
        <Link to="/"><Logo size={22} /></Link>
        <nav className="ml-10 hidden items-center gap-7 text-[13.5px] text-muted-foreground md:flex">
          <a href="#paths" className="hover:text-foreground">Per Founder</a>
          <Link to="/enterprise" className="hover:text-foreground">Enterprise</Link>
          <Link to="/studio" className="hover:text-foreground">Studio</Link>
          <a href="#pricing" className="hover:text-foreground">Prezzi</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggle} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground sm:inline-flex">Accedi</Link>
          <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-[13.5px] font-medium text-background hover:opacity-90">
            Inizia gratis <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 md:pb-24 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[12px] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Il co-founder AI per founder seri
          </span>
          <h1 className="mt-6 font-display text-[42px] font-semibold leading-[1.05] tracking-tight md:text-[64px]">
            Trasforma la tua idea
            <br />
            in una <span className="text-gradient">startup organizzata.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            Inserisci la tua idea e ottieni business model, MVP, roadmap, task, brand, budget,
            rischi e piano di lancio. <span className="text-foreground">Prima valida. Poi costruisci.</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-elegant hover:opacity-90">
              Inizia gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-5 py-3 text-[14px] font-medium text-foreground backdrop-blur hover:bg-surface">
              Guarda come funziona
            </a>
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">30 giorni gratis · Nessuna carta richiesta</p>
        </motion.div>
      </div>
    </section>
  );
}

function IdeaAnalyzer() {
  const [idea, setIdea] = useState("");
  const [analyzed, setAnalyzed] = useState<null | { score: number; risk: string; mvp: string; next: string }>(null);
  const examples = [
    "App per trovare personal trainer vicino a te",
    "SaaS che genera contratti legali con AI",
    "Marketplace di artigiani italiani",
  ];

  const analyze = () => {
    if (!idea.trim()) return;
    const len = idea.trim().length;
    const score = Math.min(92, 48 + Math.floor(len / 4));
    setAnalyzed({
      score,
      risk: score > 75 ? "Basso" : score > 60 ? "Medio" : "Alto",
      mvp: "Landing + 1 flusso core + waitlist",
      next: "Validazione su 20 utenti target in 7 giorni",
    });
  };

  return (
    <section id="demo" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Prova l'Idea Analyzer</h2>
        <p className="mt-3 text-muted-foreground">Scrivi un'idea. Vedi cosa farebbe Arkhéon.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="glass-strong rounded-3xl p-5 shadow-elegant">
            <label className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">La tua idea</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Es. App che aiuta freelance a gestire tasse e clienti…"
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/60 p-3 text-[14.5px] outline-none transition focus:border-brand"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground hover:border-brand hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              onClick={analyze}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[14px] font-medium text-background hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Analizza idea
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="glass-strong h-full rounded-3xl p-5 shadow-elegant">
            {!analyzed ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-muted-foreground">
                <LogoMark size={36} className="text-brand opacity-70" />
                <p className="mt-3 text-[13.5px]">Inserisci un'idea per vedere l'analisi.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Startup Health</div>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-display text-4xl font-semibold">{analyzed.score}</span>
                    <span className="mb-1 text-[12px] text-muted-foreground">/ 100</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${analyzed.score}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-brand" />
                  </div>
                </div>
                <Row icon={ShieldCheck} label="Rischio" value={analyzed.risk} />
                <Row icon={Wrench} label="MVP consigliato" value={analyzed.mvp} />
                <Row icon={Target} label="Prossima azione" value={analyzed.next} />
                <Link to="/signup" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-medium text-background hover:opacity-90">
                  Sblocca analisi completa <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Wrench(props: any) {
  return <Map {...props} />;
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
      <div className="rounded-lg bg-brand/10 p-1.5 text-brand"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[13.5px] font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ChoosePath() {
  const cards = [
    {
      tag: "Per Founder",
      icon: Rocket,
      title: "ARKHEON AI",
      desc: "Trasforma la tua idea in una startup organizzata con business model, MVP, roadmap, task, budget, rischi e piano di lancio.",
      cta: "Inizia gratis",
      to: "/signup" as const,
      href: undefined,
    },
    {
      tag: "Per Team",
      icon: Building2,
      title: "ARKHEON Enterprise",
      desc: "Gestisci idee, progetti, team e innovazione in un workspace AI pensato per aziende, scuole, incubatori e startup studio.",
      cta: "Richiedi una demo",
      to: "/enterprise" as const,
      href: undefined,
      featured: true,
    },
    {
      tag: "Per Aziende operative",
      icon: Cog,
      title: "ARKHEON Studio",
      desc: "Hai un processo lento o ripetitivo? Noi analizziamo il problema e costruiamo automazioni, app e sistemi AI su misura.",
      cta: "Richiedi un audit operativo",
      to: "/studio" as const,
      href: undefined,
    },
  ];
  return (
    <section id="paths" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Scegli il tuo percorso</h2>
        <p className="mt-3 text-muted-foreground">Tre modi per costruire con metodo: idea, team, processi.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className={`relative flex flex-col rounded-3xl border bg-card p-6 transition hover:shadow-elegant ${(c as any).featured ? "border-foreground shadow-elegant" : "border-border hover:border-foreground/20"}`}
            >
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {c.tag}
              </div>
              <div className="mt-4 inline-flex w-fit rounded-xl bg-brand/10 p-2.5 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-display text-xl font-semibold tracking-tight">{c.title}</div>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{c.desc}</p>
              <Link
                to={c.to}
                className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13.5px] font-medium ${(c as any).featured ? "bg-foreground text-background hover:opacity-90" : "border border-border text-foreground hover:bg-accent"}`}
              >
                {c.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Una dashboard che ti dice cosa fare oggi.</h2>
        <p className="mt-3 text-muted-foreground">Today Focus, Health Score, Budget Guard, Roadmap, Co-founder AI. Tutto in un posto.</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-strong overflow-hidden rounded-3xl p-3 shadow-elegant md:p-5"
      >
        <div className="grid grid-cols-12 gap-3">
          <PreviewCard className="col-span-12 md:col-span-5" title="Today Focus" icon={Target}>
            {["Definisci value proposition", "Intervista 5 utenti target", "Bozza landing page"].map((t, i) => (
              <div key={t} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${i===0?"bg-brand":"bg-muted-foreground/40"}`} />
                  <span className="text-[13px]">{t}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{["30m","2h","1h"][i]}</span>
              </div>
            ))}
          </PreviewCard>
          <PreviewCard className="col-span-6 md:col-span-3" title="Startup Health" icon={BarChart3}>
            <div className="flex items-end gap-2">
              <span className="font-display text-4xl font-semibold">72</span>
              <span className="mb-1 text-[12px] text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[72%] rounded-full bg-brand" />
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">Validazione: da migliorare</p>
          </PreviewCard>
          <PreviewCard className="col-span-6 md:col-span-4" title="Budget Guard" icon={Wallet}>
            <div className="text-[12px] text-muted-foreground">Budget disponibile</div>
            <div className="font-display text-2xl font-semibold">€ 3.200</div>
            <div className="mt-1 rounded-md bg-warning/15 px-2 py-1 text-[11.5px] text-warning">⚠ MVP stimato: € 5.800 — riduci scope</div>
          </PreviewCard>
          <PreviewCard className="col-span-12 md:col-span-7" title="Roadmap 30/60/90" icon={Map}>
            <div className="grid grid-cols-3 gap-2">
              {["Validazione","MVP","Lancio"].map((p, i) => (
                <div key={p} className="rounded-lg border border-border bg-surface/60 p-2.5">
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{["30 gg","60 gg","90 gg"][i]}</div>
                  <div className="mt-0.5 text-[13px] font-medium">{p}</div>
                  <div className="mt-2 h-1 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${[60,25,5][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </PreviewCard>
          <PreviewCard className="col-span-12 md:col-span-5" title="Co-founder AI" icon={Sparkles}>
            <div className="space-y-2 text-[12.5px]">
              <div className="rounded-lg bg-muted px-2.5 py-1.5">Come definisco il MVP più piccolo possibile?</div>
              <div className="rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1.5 text-foreground">
                Concentrati sul singolo flusso che produce il valore principale. Tutto il resto può essere fake o manuale.
              </div>
            </div>
          </PreviewCard>
        </div>
      </motion.div>
    </section>
  );
}

function PreviewCard({ className = "", title, icon: Icon, children }: any) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-3.5 shadow-card ${className}`}>
      <div className="mb-2.5 flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: Lightbulb, t: "Idea Lab", d: "Analizza idea, target, opportunità e rischi reali." },
    { icon: Map, t: "Roadmap 30/60/90", d: "Struttura, MVP e lancio con milestone concrete." },
    { icon: Wallet, t: "Budget Guard", d: "Niente budget bruciato. Alert prima di spendere." },
    { icon: ShieldCheck, t: "Founder Guard", d: "Evita gli errori che uccidono le startup early." },
    { icon: ListChecks, t: "Task Center", d: "Task guidati con output atteso e scadenze." },
    { icon: Sparkles, t: "Co-founder AI", d: "Chat contestuale che conosce il tuo progetto." },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Tutto quello che serve. Niente di quello che distrae.</h2>
        <p className="mt-3 text-muted-foreground">Una piattaforma unica per passare dal caos iniziale a un progetto pronto da costruire.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((f) => (
          <div key={f.t} className="rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/20 hover:shadow-elegant">
            <div className="mb-4 inline-flex rounded-xl bg-brand/10 p-2 text-brand">
              <f.icon className="h-5 w-5" />
            </div>
            <div className="text-[15px] font-semibold">{f.t}</div>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Targets() {
  const items = [
    { icon: Rocket, t: "Founder & startup" },
    { icon: Lightbulb, t: "Creator & freelance" },
    { icon: GraduationCap, t: "Scuole & università" },
    { icon: Building2, t: "Incubatori & studio" },
  ];
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-10 md:grid-cols-4">
        {items.map((i) => (
          <div key={i.t} className="flex items-center gap-3 text-[13.5px] text-muted-foreground">
            <i.icon className="h-4 w-4 text-brand" /> {i.t}
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Free Trial", price: "0€", per: "/ 30 giorni", desc: "Provala. Crea la prima struttura.", features: ["1 progetto","Idea Lab base","Roadmap base","Co-founder AI base"], cta: "Inizia gratis", to: "/signup" },
    { name: "Starter", price: "23€", per: "/mese", desc: "Organizza l'idea.", features: ["1 progetto","Brand Studio base","Business Model base","MVP essenziale","Roadmap 30 giorni"], cta: "Scegli Starter", to: "/signup" },
    { name: "Pro", price: "49€", per: "/mese", desc: "Costruisci il progetto.", featured: true, features: ["1 progetto","Blueprint completo","MVP Planner","Roadmap 30/60/90","Launch Plan","Export PDF"], cta: "Più scelto", to: "/signup" },
    { name: "Founder", price: "99€", per: "/mese", desc: "Valida, presenta, scala.", features: ["3 progetti","Investor Kit","Validation avanzata","Funding intelligente","Integrazioni principali","Team workspace"], cta: "Scegli Founder", to: "/signup" },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Un piano per ogni fase.</h2>
        <p className="mt-3 text-muted-foreground">Ogni piano include un utilizzo equo pensato per la tua fase. Niente limiti scomodi.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl border bg-card p-5 ${p.featured ? "border-foreground shadow-elegant" : "border-border"}`}
          >
            {p.featured && (
              <div className="absolute -top-3 left-5 rounded-full bg-foreground px-2.5 py-0.5 text-[10.5px] font-medium text-background">Più scelto</div>
            )}
            <div className="text-[13px] font-medium text-muted-foreground">{p.name}</div>
            <div className="mt-2 flex items-end gap-1">
              <span className="font-display text-3xl font-semibold">{p.price}</span>
              <span className="mb-1 text-[12px] text-muted-foreground">{p.per}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">{p.desc}</p>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px]">
                  <Check className="mt-0.5 h-3.5 w-3.5 text-brand" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to={p.to}
              className={`mt-5 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-[13px] font-medium ${p.featured ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-accent"}`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 md:flex-row">
        <div>
          <div className="text-[13px] font-medium">Enterprise</div>
          <div className="text-[13px] text-muted-foreground">Per team, incubatori, scuole e startup studio. Workflow e integrazioni custom.</div>
        </div>
        <Link to="/enterprise" className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-accent">Richiedi una demo</Link>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "Mi ha fatto risparmiare 3 mesi e migliaia di euro su un MVP che non serviva.", a: "Sara, founder SaaS" },
    { q: "Finalmente uno strumento che ti dice cosa fare oggi, non solo cosa pensare.", a: "Luca, indie hacker" },
    { q: "Lo usiamo con i nostri studenti: dall'idea a un blueprint serio in 2 settimane.", a: "Prof. Conti, università" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((t, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <Quote className="h-5 w-5 text-brand" />
            <p className="mt-3 text-[14px] leading-relaxed">{t.q}</p>
            <div className="mt-4 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-foreground text-foreground" />)}
              <span className="ml-2">{t.a}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Devo essere tecnico per usare ARKHEON AI?", a: "No. La piattaforma è pensata per founder, creator, studenti e team non tecnici." },
    { q: "Funziona per qualunque tipo di startup?", a: "Sì: app, SaaS, marketplace, servizi, e-commerce, AI tool. Adatta il percorso al tuo tipo." },
    { q: "Cosa succede dopo il free trial?", a: "Puoi scegliere Starter, Pro o Founder. Nessun blocco brutto: ti mostriamo il piano più adatto." },
    { q: "I miei dati sono privati?", a: "Sì. Ogni progetto è privato e accessibile solo a te e al tuo team." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <h2 className="mb-8 text-center font-display text-3xl font-semibold tracking-tight md:text-4xl">Domande frequenti</h2>
      <div className="space-y-3">
        {items.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
            <summary className="flex cursor-pointer items-center justify-between text-[14px] font-medium">
              {f.q}
              <span className="text-muted-foreground transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-[13.5px] text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 py-20 text-center">
        <Zap className="mx-auto h-6 w-6 text-brand" />
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
          Da idea confusa a startup organizzata.
        </h2>
        <p className="mt-3 text-muted-foreground">Inizia gratis. Senza carta. Senza fuffa.</p>
        <Link to="/signup" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[14px] font-medium text-background shadow-elegant hover:opacity-90">
          Crea il tuo workspace <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
        <Logo size={20} />
        <p className="text-[12px] text-muted-foreground">© {new Date().getFullYear()} ARKHEON AI · Dalla tua idea alla tua startup.</p>
      </div>
    </footer>
  );
}
