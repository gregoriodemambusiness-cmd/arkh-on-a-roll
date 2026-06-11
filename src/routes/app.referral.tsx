"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Share2, Copy, Check, Users, Percent, TrendingUp, ArrowRight,
} from "lucide-react";
import { PageHeader, Card, CardHeader, Button } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/mockAuth";

const STORAGE_KEY = "pilot-referral";

type ReferralState = {
  referredCount: number;
  referredEmails: string[];
};

function loadReferral(): ReferralState {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return { referredCount: 0, referredEmails: [] }; }
}

function discount(count: number): { pct: number; label: string } {
  if (count >= 6) return { pct: 40, label: "40% sconto" };
  if (count >= 4) return { pct: 30, label: "30% sconto" };
  if (count >= 2) return { pct: 20, label: "20% sconto" };
  return { pct: 0, label: "Nessuno sconto ancora" };
}

function nextTier(count: number): { need: number; pct: number } | null {
  if (count < 2) return { need: 2 - count, pct: 20 };
  if (count < 4) return { need: 4 - count, pct: 30 };
  if (count < 6) return { need: 6 - count, pct: 40 };
  return null;
}

const TIERS = [
  { min: 1,  max: 1, pct: 0,  label: "1 persona",      color: "text-muted-foreground" },
  { min: 2,  max: 3, pct: 20, label: "2-3 persone",     color: "text-brand" },
  { min: 4,  max: 5, pct: 30, label: "4-5 persone",     color: "text-violet-500" },
  { min: 6,  max: 99,pct: 40, label: "6+ persone",      color: "text-emerald-500" },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Condividi il tuo link",
    desc: "Ogni link è unico — tracciamo automaticamente chi si iscrive con il tuo referral.",
  },
  {
    n: "02",
    title: "Il tuo amico ottiene 30 giorni gratis",
    desc: "Chi si iscrive con il tuo link riceve un mese di prova gratuita sul piano Starter.",
  },
  {
    n: "03",
    title: "Tu ricevi lo sconto permanente",
    desc: "Più amici inviti, maggiore è lo sconto mensile sul tuo piano. Cumulabile nel tempo.",
  },
];

export default function ReferralPage() {
  const user = useUser();
  const [state, setState] = useState<ReferralState>({ referredCount: 0, referredEmails: [] });
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = loadReferral();
    setState({ referredCount: s.referredCount ?? 0, referredEmails: s.referredEmails ?? [] });
    setLoaded(true);
  }, []);

  const refLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(user?.email ?? "pilot")}`
    : "https://app.pilotai.co/signup?ref=pilot";

  const copyLink = async () => {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const count = state.referredCount;
  const { pct, label } = discount(count);
  const next = nextTier(count);
  // Monthly savings: assume base plan €29/mo
  const basePlan = 29;
  const savings = Math.round(basePlan * (pct / 100) * 10) / 10;

  const whatsappText = encodeURIComponent(
    `Sto usando Pilot AI per costruire la mia startup in modo organizzato — se ti iscrivi con il mio link ottieni 30 giorni gratis e io sconto sul piano 🚀\n\n${refLink}`,
  );
  const linkedinText = encodeURIComponent(
    `Sto costruendo la mia startup con Pilot AI — ti permette di passare dall'idea al primo cliente con metodo. Se ti iscrivi con il mio link hai 30 giorni gratis: ${refLink}`,
  );

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Referral & Sconti Gruppo"
        subtitle="Invita altri founder e ottieni sconti permanenti sul tuo piano."
      />

      {/* Hero stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Persone invitate",
            value: count.toString(),
            icon: Users,
            color: "text-brand",
            bg: "bg-brand/10",
          },
          {
            label: "Sconto attuale",
            value: pct > 0 ? `${pct}%` : "—",
            icon: Percent,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
          {
            label: "Risparmio mensile",
            value: savings > 0 ? `€${savings}` : "—",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
        ].map(({ label: l, value: v, icon: Icon, color, bg }, i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className={cn("mb-3 inline-flex rounded-lg p-2", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div className={cn("font-display text-3xl font-semibold", color)}>{v}</div>
            <div className="mt-1 text-[12.5px] text-muted-foreground">{l}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress to next tier */}
      <Card>
        <CardHeader title="Livello sconto" icon={Percent} subtitle={label} />
        <div className="space-y-3">
          {TIERS.map((tier) => {
            const active = count >= tier.min && count <= tier.max;
            const reached = count >= tier.min;
            const progress = tier.max === 99
              ? Math.min(100, count >= tier.min ? 100 : 0)
              : Math.min(100, Math.max(0, ((count - tier.min + 1) / (tier.max - tier.min + 1)) * 100));

            return (
              <div key={tier.pct} className={cn(
                "rounded-xl border p-3 transition-colors",
                active ? "border-brand/40 bg-brand/5" : reached ? "border-border bg-surface/60" : "border-border/40 opacity-50",
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium">{tier.label}</span>
                  <span className={cn("text-[13px] font-semibold", tier.pct > 0 ? tier.color : "text-muted-foreground")}>
                    {tier.pct > 0 ? `${tier.pct}% sconto` : "Prezzo pieno"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    animate={{ width: reached ? "100%" : "0%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {next && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-[12.5px]"
          >
            <ArrowRight className="h-3.5 w-3.5 text-brand shrink-0" />
            <span className="text-muted-foreground">
              Invita ancora <strong className="text-foreground">{next.need}</strong> {next.need === 1 ? "persona" : "persone"} per sbloccare il <strong className="text-foreground">{next.pct}%</strong> di sconto
            </span>
          </motion.div>
        )}
      </Card>

      {/* Link + share */}
      <Card>
        <CardHeader title="Il tuo link referral" icon={Share2} />
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
          <span className="flex-1 truncate text-[13px] text-muted-foreground">{refLink}</span>
          <button
            onClick={copyLink}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-1.5 text-[12.5px] font-medium text-brand hover:bg-brand/20"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiato!" : "Copia"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium hover:bg-accent"
          >
            <span className="text-base">💬</span> WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refLink)}&summary=${linkedinText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium hover:bg-accent"
          >
            <span className="text-base">🔗</span> LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Sto costruendo la mia startup con @PilotAI — ottieni 30 giorni gratis con il mio link: ${refLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium hover:bg-accent"
          >
            <span className="text-base">𝕏</span> X / Twitter
          </a>
        </div>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader title="Come funziona" />
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-xl border border-border bg-surface/60 p-4"
            >
              <div className="font-display text-3xl font-semibold text-brand/20">{step.n}</div>
              <div className="mt-2 text-[13.5px] font-semibold">{step.title}</div>
              <div className="mt-1 text-[12.5px] text-muted-foreground">{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
