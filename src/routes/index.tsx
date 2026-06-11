"use client";
import React from "react";
import { Link } from "@/lib/nextCompat";
import { useRouter } from "next/navigation";
import { motion, useInView, animate } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight, Sparkles, ShieldCheck, Wallet, Map, ListChecks, Target,
  Check, Star, Quote, Lightbulb, Building2, GraduationCap, Rocket, Zap,
  BarChart3, Cog, TrendingUp, Clock, Users,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
import { PLANS, type Plan, type PaidPlanId } from "@/lib/billing";
import { PlanConfirmModal } from "@/components/billing/PlanConfirmModal";
import { WelcomeModal } from "@/components/app/WelcomeModal";
import { listWorkspaces } from "@/lib/workspaces";
import { supabase } from "@/integrations/supabase/client";


function Landing() {
  const router = useRouter();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [hasWorkspaces, setHasWorkspaces] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Already logged in — skip landing and go straight to workspace
        router.replace("/app");
        return;
      }
      setAuthChecked(true);

      const flag = sessionStorage.getItem("pilot-welcome");
      if (!flag) return;
      sessionStorage.removeItem("pilot-welcome");
      const ws = await listWorkspaces();
      setHasWorkspaces(ws.length > 0);
      setWelcomeOpen(true);
    });
  }, [router]);

  // Avoid flash of landing while checking session
  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} hasWorkspaces={hasWorkspaces} />
      <PublicNav />
      <Hero />
      <SocialProofBar />
      <IdeaAnalyzer />
      <ChoosePath />
      <DashboardPreview />
      <BentoFeatures />
      <MetricsSection />
      <Targets />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

// ─────────────── NAV (unchanged) ───────────────

function PublicNav() {
  const { theme, toggle } = useTheme();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

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
          {loggedIn ? (
            <Link to="/app" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-[13.5px] font-medium text-background hover:opacity-90">
              Apri workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground sm:inline-flex">Accedi</Link>
              <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-[13.5px] font-medium text-background hover:opacity-90">
                Inizia gratis <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─────────────── HERO (enhanced) ───────────────

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

          {/* Credibility band */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 border-t border-border/50 pt-8"
          >
            <p className="text-[13px] text-muted-foreground">
              Già usato da{" "}
              <span className="font-semibold text-foreground">+2.400 founder</span>{" "}
              in 18 paesi
            </p>
            <div className="mt-5 flex flex-wrap items-start justify-center gap-6 md:gap-12">
              {[
                { stat: "94%", label: "completa il primo MVP plan" },
                { stat: "3.2×", label: "più veloce nella validazione" },
                { stat: "€0", label: "sprecati in feature inutili" },
              ].map(({ stat, label }) => (
                <div key={stat} className="flex flex-col items-center gap-1">
                  <span className="font-display text-[26px] font-semibold leading-none tracking-tight text-foreground">
                    {stat}
                  </span>
                  <span className="text-[12px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────── SOCIAL PROOF BAR ───────────────

function SocialProofBar() {
  const logos = [
    { name: "Y Combinator", style: "font-bold tracking-tight" },
    { name: "Techstars", style: "font-semibold tracking-wide uppercase text-[13px]" },
    { name: "Product Hunt", style: "font-semibold" },
    { name: "Forbes", style: "font-bold italic text-[17px]" },
    { name: "TechCrunch", style: "font-bold tracking-tighter text-[17px]" },
  ];
  return (
    <div className="border-b border-border/50 bg-surface/30 py-6">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-5 text-center text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground/50">
          Parlato di noi
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {logos.map(({ name, style }) => (
            <span
              key={name}
              className={`font-display text-[15px] text-foreground opacity-40 transition-opacity duration-300 hover:opacity-60 ${style}`}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────── IDEA ANALYZER (unchanged) ───────────────

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
        <p className="mt-3 text-muted-foreground">Scrivi un'idea. Vedi cosa farebbe Pilot.</p>
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

// ─────────────── CHOOSE PATH (unchanged) ───────────────

function ChoosePath() {
  const cards = [
    {
      tag: "Per Founder",
      icon: Rocket,
      title: "PILOT AI",
      desc: "Trasforma la tua idea in una startup organizzata con business model, MVP, roadmap, task, budget, rischi e piano di lancio.",
      cta: "Inizia gratis",
      to: "/signup" as const,
    },
    {
      tag: "Per Team",
      icon: Building2,
      title: "PILOT Enterprise",
      desc: "Gestisci idee, progetti, team e innovazione in un workspace AI pensato per aziende, scuole, incubatori e startup studio.",
      cta: "Richiedi una demo",
      to: "/enterprise" as const,
      featured: true,
    },
    {
      tag: "Per Aziende operative",
      icon: Cog,
      title: "PILOT Studio",
      desc: "Hai un processo lento o ripetitivo? Noi analizziamo il problema e costruiamo automazioni, app e sistemi AI su misura.",
      cta: "Richiedi un audit operativo",
      to: "/studio" as const,
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

// ─────────────── DASHBOARD PREVIEW (unchanged) ───────────────

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

// ─────────────── BENTO GRID FEATURES ───────────────

type BentoCardDef = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  className?: string;
  extra?: React.ReactNode;
};

const BENTO_CARDS: BentoCardDef[] = [
  {
    icon: Target,
    title: "Today Focus",
    desc: "Ogni giorno sai esattamente cosa fare, in quale ordine e perché. Niente paralisi da scelta.",
    className: "md:col-span-2 md:row-span-2",
    extra: (
      <div className="mt-4 space-y-2">
        {["Intervista 5 utenti target · 2h", "Bozza landing con value prop · 1h", "Definisci pricing ipotetico · 30m"].map((t, i) => (
          <div key={t} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/50 px-3 py-2.5">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${i === 0 ? "bg-brand" : "bg-muted-foreground/25"}`} />
            <span className="text-[12.5px] text-foreground/75">{t}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[33%] rounded-full bg-brand" />
          </div>
          <span className="text-[11px] text-muted-foreground">1 / 3 completati</span>
        </div>
      </div>
    ),
  },
  {
    icon: Map,
    title: "Blueprint AI",
    desc: "Business model, value prop, target, competitor e piano di lancio generati in meno di 10 minuti.",
    extra: (
      <div className="mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11.5px] font-medium text-brand">
          <Zap className="h-3 w-3" /> Genera in 10 min
        </span>
      </div>
    ),
  },
  {
    icon: Wallet,
    title: "Budget Guard",
    desc: "Monitora il budget, allerta sui rischi prima che accadano. Niente sorprese a fine MVP.",
    extra: (
      <div className="mt-3 rounded-lg border border-warning/30 bg-warning/8 px-2.5 py-2 text-[12px] text-warning">
        ⚠ MVP stimato eccede il budget di € 2.600
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Founder Guard",
    desc: "Il sistema che ti avverte quando stai per commettere gli errori più comuni nelle startup early-stage.",
  },
  {
    icon: Sparkles,
    title: "Co-founder AI",
    desc: "Chat contestuale che conosce tutto del tuo progetto. Non risponde in generico — risponde su di te.",
    extra: (
      <div className="mt-3 rounded-lg border border-brand/20 bg-brand/5 px-2.5 py-2 text-[12px] italic text-foreground/70">
        "Come riduco lo scope del MVP senza perdere valore core?"
      </div>
    ),
  },
  {
    icon: Lightbulb,
    title: "MVP Builder",
    desc: "Separa il must-have dal nice-to-have. Stima i costi. Taglia prima di costruire.",
  },
];

function BentoFeatures() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Tutto quello che serve. Niente di quello che distrae.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Una piattaforma unica per passare dal caos iniziale a un progetto pronto da costruire.
        </p>
      </div>

      <div className="grid auto-rows-[minmax(148px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
        {BENTO_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              whileHover={{ y: -3, scale: 1.012 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-foreground/15 hover:shadow-elegant ${(card as any).className ?? ""}`}
            >
              {/* subtle gradient on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand/0 to-brand/0 opacity-0 transition-opacity duration-300 group-hover:from-brand/4 group-hover:to-transparent group-hover:opacity-100" />

              <motion.div
                className="relative inline-flex rounded-xl bg-brand/10 p-2.5 text-brand"
                whileHover={{ scale: 1.1, rotate: 4 }}
                transition={{ duration: 0.18 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              <div className="relative mt-3 text-[15px] font-semibold tracking-tight">{card.title}</div>
              <p className="relative mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{card.desc}</p>
              {"extra" in card && <div className="relative">{card.extra}</div>}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────── METRICS SECTION ───────────────

function useCountUp(target: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    setValue(0);
    const steps = 60;
    const interval = durationMs / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      // ease-out curve
      const progress = 1 - Math.pow(1 - step / steps, 3);
      setValue(Math.round(progress * target));
      if (step >= steps) clearInterval(id);
    }, interval);
    return () => clearInterval(id);
  }, [active, target, durationMs]);
  return value;
}

type MetricDef = { end: number; suffix: string; headline: string; body: string; icon: React.ComponentType<{ className?: string }> };

function MetricCard({ metric: m, index: i, isInView }: { metric: MetricDef; index: number; isInView: boolean }) {
  const count = useCountUp(m.end, 1400, isInView);
  const Icon = m.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.1 + i * 0.12 }}
      className="flex flex-col gap-3 border-t border-background/10 pt-6"
    >
      <div className="inline-flex w-fit rounded-xl bg-white/8 p-2 text-background/60">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="font-display text-[58px] font-semibold leading-none tracking-tight text-background">
        {count}
        <span className="text-[36px] text-background/70">{m.suffix}</span>
      </div>
      <div className="text-[16px] font-medium text-background/90">{m.headline}</div>
      <p className="text-[13.5px] leading-relaxed text-background/45">{m.body}</p>
    </motion.div>
  );
}

const METRICS: MetricDef[] = [
  {
    end: 10,
    suffix: " min",
    headline: "al primo piano operativo",
    body: "Dall'idea grezza a blueprint, MVP, roadmap e task operativi — tutto prima di finire il caffè.",
    icon: Clock,
  },
  {
    end: 87,
    suffix: "%",
    headline: "riduzione errori MVP",
    body: "I founder che usano Budget Guard e Founder Guard evitano gli errori più costosi prima di scrivere una riga di codice.",
    icon: ShieldCheck,
  },
  {
    end: 3,
    suffix: "×",
    headline: "più veloce del metodo classico",
    body: "Dalla prima validazione al primo cliente in un terzo del tempo rispetto ai percorsi tradizionali.",
    icon: TrendingUp,
  },
] as const;

function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-foreground text-background">
      {/* subtle brand glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.62_0.2_235/0.18),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight text-background md:text-[40px]">
            Numeri che parlano chiaro.
          </h2>
          <p className="mt-3 text-[15px] text-background/55">
            Risultati misurati sulle prime centinaia di founder che hanno usato Pilot.
          </p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-3 md:gap-6">
          {METRICS.map((m, i) => (
            <MetricCard key={m.headline} metric={m} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────── TARGETS (unchanged) ───────────────

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

// ─────────────── PRICING (enterprise redesign) ───────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const el = ref.current;
    const ctrl = animate(0, target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) { el.textContent = Math.round(v).toString() + suffix; },
    });
    return ctrl.stop;
  }, [isInView, target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

function DotGrid() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in oklab, var(--brand) 28%, transparent) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      animate={{ opacity: [0.3, 0.65, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function PricingCard({
  plan,
  index,
  onSelect,
}: {
  plan: Plan;
  index: number;
  onSelect?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef as React.RefObject<Element>, { once: true, margin: "0px 0px -40px 0px" });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - r.left - r.width / 2;
    const cy = e.clientY - r.top - r.height / 2;
    setTilt({ x: -(cy / r.height) * 5, y: (cx / r.width) * 5 });
  };

  const isFree = plan.id === "free";
  const isPaid = ["starter", "pro", "founder"].includes(plan.id);

  // Card body (no badge — badge lives outside overflow-hidden layers for Pro)
  const cardInner = (
    <div className="relative flex h-full flex-col rounded-2xl bg-card p-5">
      <div className="text-[13px] font-medium text-muted-foreground">{plan.name}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="font-display text-3xl font-semibold">
          {plan.price === 0 ? "0€" : <AnimatedCounter target={plan.price} suffix="€" />}
        </span>
        <span className="mb-1 text-[12px] text-muted-foreground">{plan.per}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{plan.desc}</p>
      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.slice(0, 7).map((f, fi) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -8 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 + index * 0.15 + fi * 0.05 }}
            className="flex items-start gap-2 text-[13px]"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            {f}
          </motion.li>
        ))}
      </ul>
      {isFree ? (
        <Link
          to="/signup"
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-foreground hover:bg-accent"
        >
          {plan.cta}
        </Link>
      ) : isPaid ? (
        <button
          onClick={onSelect}
          className={`mt-5 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-[13px] font-medium transition-opacity ${
            plan.featured
              ? "bg-foreground text-background hover:opacity-90"
              : "border border-border text-foreground hover:bg-accent"
          }`}
        >
          {plan.cta}
        </button>
      ) : null}
    </div>
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      style={{ rotateX: tilt.x, rotateY: tilt.y, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="flex h-full flex-col"
    >
      {plan.featured ? (
        /* Rotating brand-color border + glow */
        <div className="relative flex-1">
          {/* Badge sits here — outside any overflow-hidden layer */}
          <motion.div
            className="absolute -top-3 left-5 z-20 rounded-full bg-foreground px-2.5 py-0.5 text-[10.5px] font-medium text-background"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Più scelto
          </motion.div>

          {/* Pulsing brand glow ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 0 1.5px oklch(0.62 0.2 235 / 0.35), 0 0 20px oklch(0.62 0.2 235 / 0.10)",
                "0 0 0 1.5px oklch(0.62 0.2 235 / 0.60), 0 0 36px oklch(0.62 0.2 235 / 0.20)",
                "0 0 0 1.5px oklch(0.62 0.2 235 / 0.35), 0 0 20px oklch(0.62 0.2 235 / 0.10)",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Spinning brand conic-gradient ring */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <motion.div
              className="absolute inset-[-100%] m-auto"
              style={{
                width: "200%",
                height: "200%",
                background:
                  "conic-gradient(from 0deg, oklch(0.62 0.2 235), oklch(0.70 0.19 232), oklch(0.78 0.16 228), oklch(0.70 0.19 232), oklch(0.62 0.2 235))",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative m-[1.5px] overflow-hidden rounded-[14px]">{cardInner}</div>
        </div>
      ) : (
        <div className="flex-1 rounded-2xl border border-border">{cardInner}</div>
      )}
    </motion.div>
  );
}

function Pricing() {
  const [confirm, setConfirm] = useState<PaidPlanId | null>(null);
  const paid = PLANS.filter((p) => p.id !== "enterprise") as Plan[];
  const separatorRef = useRef<HTMLDivElement>(null);
  const separatorInView = useInView(separatorRef as React.RefObject<Element>, { once: true });

  const studioServices = [
    { name: "Audit Operativo", price: 299, suffix: "€", note: "", desc: "Analisi processi + roadmap automazioni" },
    { name: "Prototipo AI", price: 1500, suffix: "€", note: "", desc: "Proof-of-concept in 2 settimane" },
    { name: "MVP Completo", price: 5000, suffix: "€", note: "", desc: "App o agent da zero, production-ready" },
    { name: "Manutenzione", price: 500, suffix: "€", note: "/mese", desc: "Monitoring, aggiornamenti e supporto" },
  ];

  return (
    <section id="pricing" className="overflow-hidden">

      {/* ─── B2C: dot grid + plans ─── */}
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <DotGrid />
        <motion.div
          className="relative mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="mb-3 inline-block rounded-full border border-border/60 px-3 py-1 text-[12px] font-medium"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab,var(--brand) 14%,transparent), color-mix(in oklab,var(--brand-glow) 10%,transparent))",
            }}
            animate={{ backgroundSize: ["100% 100%", "200% 100%", "100% 100%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            Per individui e founder
          </motion.span>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Un piano per ogni fase.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tutti i piani includono il percorso completo. La differenza è profondità,
            automazione, collaborazione e supporto.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-4" style={{ perspective: "1200px" }}>
          {paid.map((p, i) => (
            <PricingCard
              key={p.id}
              plan={p}
              index={i}
              onSelect={
                ["starter", "pro", "founder"].includes(p.id)
                  ? () => setConfirm(p.id as PaidPlanId)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* ─── Separator: expanding lines from centre ─── */}
      <div
        ref={separatorRef}
        className="mx-auto flex max-w-4xl items-center gap-6 px-5 pb-4 pt-2"
      >
        <motion.div
          className="h-px flex-1 bg-gradient-to-r from-transparent to-border"
          initial={{ scaleX: 0 }}
          animate={separatorInView ? { scaleX: 1 } : {}}
          style={{ transformOrigin: "right" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={separatorInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="whitespace-nowrap text-[12.5px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          Per team e aziende
        </motion.span>
        <motion.div
          className="h-px flex-1 bg-gradient-to-l from-transparent to-border"
          initial={{ scaleX: 0 }}
          animate={separatorInView ? { scaleX: 1 } : {}}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>

      {/* ─── Enterprise: near-black section ─── */}
      <div className="relative overflow-hidden bg-[#0A0A0A] py-20">
        {/* top fade: softens the cut from the white/light section above */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{ background: "linear-gradient(to bottom, var(--background), transparent)" }}
        />
        {/* subtle grid lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.024) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.024) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/6 text-white"
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Building2 className="h-7 w-7" />
              </motion.div>
              <h3 className="font-display text-3xl font-semibold text-white md:text-4xl">
                PILOT Enterprise
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                Il workspace AI per team e organizzazioni che vogliono gestire idee,
                progetti e innovazione a scala.
              </p>

              {/* stat counters */}
              <div className="mt-8 flex gap-12">
                {[
                  { target: 500, suffix: "+", label: "Aziende in lista d'attesa" },
                  { target: 12, suffix: "x", label: "Velocità decision-making" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-4xl font-bold text-white">
                      <AnimatedCounter target={s.target} suffix={s.suffix} />
                    </div>
                    <div className="mt-1 text-[12px] text-white/38">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* feature list */}
              <ul className="mt-8 space-y-3">
                {[
                  "Workspace multi-team con ruoli e permessi",
                  "Dashboard centralizzata progetti e KPI",
                  "AI agent personalizzati per i tuoi processi",
                  "Integrazioni Notion, Slack, CRM su misura",
                  "SLA, onboarding dedicato, supporto prioritario",
                ].map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="flex items-center gap-3 text-[14px] text-white/65"
                  >
                    <motion.span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10"
                      animate={{ scale: [1, 1.18, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.span>
                    {f}
                  </motion.li>
                ))}
              </ul>

              {/* CTA with shimmer */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
              >
                <Link
                  to="/enterprise"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-black"
                >
                  <motion.span
                    className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: "-120%" }}
                    animate={{ x: "220%" }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
                  />
                  <span className="relative">Richiedi una demo</span>
                  <ArrowRight className="relative h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* right: stat cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden space-y-3 md:block"
            >
              {[
                { icon: Users, label: "Team attivi", value: "1–500", color: "oklch(0.62 0.2 235)" },
                { icon: BarChart3, label: "Progetti gestiti", value: "illimitati", color: "oklch(0.70 0.18 290)" },
                { icon: Zap, label: "Automazioni AI", value: "custom", color: "oklch(0.78 0.18 190)" },
                { icon: ShieldCheck, label: "SLA garantito", value: "99.9%", color: "oklch(0.72 0.22 150)" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 22 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.09 }}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.04] px-5 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/8">
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-[12px] text-white/38">{item.label}</div>
                    <div className="text-[15px] font-semibold text-white">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Studio: brand-tinted section ─── */}
      <div
        className="relative overflow-hidden py-20"
        style={{
          background:
            "color-mix(in oklab, var(--brand) 10%, var(--background))",
        }}
      >
        {/* radial brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(75% 60% at 65% 50%, color-mix(in oklab,var(--brand) 18%,transparent) 0%,transparent 100%)",
          }}
        />
        {/* bottom fade: eases into the Testimonials section below */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            {/* left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Rocket className="h-7 w-7" />
              </motion.div>
              <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                PILOT Studio
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Per aziende che vogliono che il nostro team costruisca automazioni,
                app, dashboard o AI agent su misura.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Discovery call gratuita con il nostro team",
                  "Sviluppo custom in sprint da 2 settimane",
                  "Stack AI: Claude, GPT-4, Gemini, agenti locali",
                  "Deliverable: codice + documentazione + training",
                  "Post-launch: monitoring e manutenzione inclusa",
                ].map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.07 }}
                    className="flex items-center gap-3 text-[14px] text-muted-foreground"
                  >
                    <Check className="h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </motion.li>
                ))}
              </ul>

              {/* CTA with pulse ring */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/studio"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-brand-foreground"
                >
                  <motion.span
                    className="absolute inset-0 rounded-xl bg-brand-foreground/10"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <span className="relative">Richiedi un audit operativo</span>
                  <ArrowRight className="relative h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* right: service price cards */}
            <div className="grid grid-cols-2 gap-3">
              {studioServices.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.08 + i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="flex flex-col rounded-2xl border border-border/50 bg-background/65 p-4 backdrop-blur"
                >
                  <div className="flex items-end gap-1 font-display text-2xl font-semibold">
                    <AnimatedCounter target={s.price} suffix={s.suffix} />
                    {s.note && (
                      <span className="mb-0.5 text-[12px] font-normal text-muted-foreground">
                        {s.note}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[13px] font-medium">{s.name}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PlanConfirmModal plan={confirm} onClose={() => setConfirm(null)} />
    </section>
  );
}

// ─────────────── TESTIMONIALS (enhanced) ───────────────

const TESTIMONIALS = [
  {
    quote: "Mi ha fatto risparmiare 3 mesi e migliaia di euro su un MVP che non serviva a nessuno. Il Blueprint AI mi ha aperto gli occhi in 10 minuti.",
    name: "Sara M.",
    role: "Founder, SaaS HR Tech",
    avatar: "SM",
    stars: 5,
  },
  {
    quote: "Finalmente uno strumento che ti dice cosa fare oggi, non solo cosa pensare. Il Today Focus è diventato il mio punto di partenza ogni mattina.",
    name: "Luca R.",
    role: "Indie Hacker & Developer",
    avatar: "LR",
    stars: 5,
  },
  {
    quote: "Lo usiamo con i nostri studenti: dall'idea a un blueprint serio in 2 settimane. Un salto di qualità enorme rispetto ai canvas tradizionali.",
    name: "Prof. Marco C.",
    role: "Docente, Università Bocconi",
    avatar: "MC",
    stars: 5,
  },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Chi ha già iniziato.
        </h2>
        <p className="mt-3 text-muted-foreground">Storie vere da founder che hanno smesso di procrastinare.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-elegant"
          >
            <Quote className="h-4 w-4 text-brand/50" />
            <p className="mt-3 flex-1 text-[14px] leading-relaxed text-foreground/80">{t.quote}</p>
            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[12px] font-semibold text-brand">
                {t.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{t.name}</div>
                <div className="truncate text-[12px] text-muted-foreground">{t.role}</div>
              </div>
              <div className="ml-auto flex shrink-0 gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-brand text-brand" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─────────────── FAQ (unchanged) ───────────────

function FAQ() {
  const items = [
    { q: "Devo essere tecnico per usare PILOT AI?", a: "No. La piattaforma è pensata per founder, creator, studenti e team non tecnici." },
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

// ─────────────── CTA (unchanged) ───────────────

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

// ─────────────── FOOTER (unchanged) ───────────────

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
        <Logo size={20} />
        <p className="text-[12px] text-muted-foreground">© {new Date().getFullYear()} PILOT AI · Dalla tua idea alla tua startup.</p>
      </div>
    </footer>
  );
}

export default Landing;
