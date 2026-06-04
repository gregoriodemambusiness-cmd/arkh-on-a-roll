import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useUser, setPlan, type PaymentRecord } from "@/lib/mockAuth";
import {
  BadgeCheck, ArrowUpRight, ArrowRight, Sparkles, Building2, Cog,
  Receipt, CreditCard, Calendar, TrendingUp, Activity,
} from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";
import { PLAN_BY_ID, PLAN_RANK, PLANS, suggestPlan, type PlanId, type PaidPlanId } from "@/lib/billing";
import { PlanConfirmModal } from "@/components/billing/PlanConfirmModal";
import { useProject } from "@/lib/projectStore";

export const Route = createFileRoute("/app/plan")({
  head: () => ({ meta: [{ title: "Plan & Usage — ARKHEON AI" }] }),
  component: Plan,
});

const PATH: PlanId[] = ["free", "starter", "pro", "founder", "enterprise"];

function Plan() {
  const user = useUser();
  const proj = useProject();
  const [confirm, setConfirm] = useState<PaidPlanId | null>(null);

  const plan = (user?.plan ?? "free") as PlanId;
  const meta = PLAN_BY_ID[plan];
  const completed = proj?.tasks.filter((t) => t.status === "Completato").length ?? 0;
  const totalTasks = Math.max(1, proj?.tasks.length ?? 1);
  const usagePct = Math.min(100, Math.round((completed / totalTasks) * 100) + 15);

  const trialDaysLeft = useMemo(() => {
    if (!user?.trialEndsAt || plan !== "free") return null;
    const ms = user.trialEndsAt - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  }, [user, plan]);

  const suggested = suggestPlan(plan);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Plan & Usage"
        subtitle="Tutti i piani includono il percorso completo. Cambia profondità, automazione e supporto in base alla fase del tuo progetto."
      />

      {/* Current plan */}
      <Card>
        <CardHeader
          title="Piano attuale"
          icon={BadgeCheck}
          action={<Pill tone="brand">{meta.name}</Pill>}
        />
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Stato</div>
            <div className="mt-1 font-display text-xl font-semibold">
              {plan === "free" ? "Trial attivo" : "Attivo (test)"}
            </div>
            {trialDaysLeft !== null && (
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                <Calendar className="mr-1 inline h-3 w-3" /> {trialDaysLeft} giorni rimasti
              </p>
            )}
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Capacità mensile inclusa</div>
            <div className="mt-1 font-display text-xl font-semibold">Coerente</div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Adatta alla fase del progetto.</p>
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Utilizzo del mese</div>
            <div className="mt-1 font-display text-xl font-semibold">{usagePct}%</div>
            <ProgressBar value={usagePct} tone={usagePct > 85 ? "warn" : "brand"} />
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Moduli più usati</div>
            <ul className="mt-1 space-y-0.5 text-[13px] text-muted-foreground">
              <li>1. Co-founder AI</li>
              <li>2. Task Center</li>
              <li>3. Budget Guard</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {plan !== "founder" && (
            <Button onClick={() => setConfirm(suggested)}>
              Passa a {PLAN_BY_ID[suggested].name} <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="secondary" onClick={() => document.getElementById("change-plan")?.scrollIntoView({ behavior: "smooth" })}>
            Cambia piano
          </Button>
          {plan !== "free" && (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm) return;
                if (window.confirm("Annullare il piano attuale? Tornerai al Free Trial (modalità demo).")) {
                  setPlan("free");
                }
              }}
            >
              Annulla piano (demo)
            </Button>
          )}
        </div>
      </Card>

      {/* Growth path */}
      <Card>
        <CardHeader title="Percorso di crescita" icon={TrendingUp} />
        <p className="text-[13.5px] text-muted-foreground">
          ARKHEON cresce insieme al tuo progetto. Parti gratis, organizza l'idea, costruisci il primo MVP, valida il mercato e passa a un piano più avanzato quando il progetto diventa più serio.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PATH.map((id) => {
            const m = PLAN_BY_ID[id];
            const current = id === plan;
            const past = PLAN_RANK[id] < PLAN_RANK[plan];
            return (
              <div
                key={id}
                className={`relative rounded-xl border p-3 text-center ${current ? "border-foreground bg-card shadow-card" : past ? "border-border bg-surface/60" : "border-border bg-surface/30"}`}
              >
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{id === "enterprise" ? "Org" : id}</div>
                <div className="mt-1 text-[13px] font-semibold">{m.name}</div>
                <div className="text-[11.5px] text-muted-foreground">{m.priceLabel}</div>
                {current && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
                    Attuale
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Suggestion */}
      {plan !== "founder" && (
        <Card>
          <CardHeader title="Piano consigliato" icon={Sparkles}
            action={<Pill tone="ok">Suggerito {PLAN_BY_ID[suggested].name}</Pill>} />
          <p className="text-[13.5px] text-muted-foreground">
            In base al tuo utilizzo, <b className="text-foreground">{PLAN_BY_ID[suggested].name}</b> aggiunge profondità, automazione e supporto coerenti con la fase del tuo progetto.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setConfirm(suggested)}>
              Attiva {PLAN_BY_ID[suggested].name} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Link to="/" hash="pricing" className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-accent">
              Confronta piani
            </Link>
          </div>
        </Card>
      )}

      {/* Change plan */}
      <div id="change-plan" className="grid gap-4 md:grid-cols-4">
        {PLANS.filter((p) => p.id !== "enterprise").map((p) => {
          const isCurrent = p.id === plan;
          const isPaid = p.id === "starter" || p.id === "pro" || p.id === "founder";
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border bg-card p-4 ${p.featured ? "border-foreground shadow-elegant" : "border-border"} ${isCurrent ? "ring-1 ring-foreground/20" : ""}`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-4 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">Più scelto</div>
              )}
              <div className="text-[12.5px] font-medium text-muted-foreground">{p.name}</div>
              <div className="mt-1 flex items-end gap-1">
                <span className="font-display text-2xl font-semibold">{p.priceLabel}</span>
                <span className="mb-1 text-[11.5px] text-muted-foreground">{p.per}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{p.desc}</p>
              <ul className="mt-3 flex-1 space-y-1">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f} className="text-[12px] text-muted-foreground">• {f}</li>
                ))}
              </ul>
              <div className="mt-4">
                {isCurrent ? (
                  <div className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground">
                    Piano attuale
                  </div>
                ) : p.id === "free" ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      if (window.confirm("Tornare al Free Trial (demo)?")) setPlan("free");
                    }}
                  >
                    Torna al Free
                  </Button>
                ) : isPaid ? (
                  <Button className="w-full" onClick={() => setConfirm(p.id as PaidPlanId)}>
                    {p.cta}
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment method + invoices */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Metodo di pagamento" icon={CreditCard} />
          {plan === "free" ? (
            <p className="text-[13px] text-muted-foreground">Nessun metodo di pagamento richiesto durante il Free Trial.</p>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-3 text-[13.5px]">
              Visa test •••• 4242 — scade 12/29
              <Pill tone="muted">test</Pill>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Fatture & storico pagamenti" icon={Receipt} />
          <InvoiceList items={user?.paymentHistory ?? []} />
        </Card>
      </div>

      {/* Activity */}
      <Card>
        <CardHeader title="Storico attività" icon={Activity} />
        <ul className="space-y-1.5 text-[13px] text-muted-foreground">
          {user?.planSince && (
            <li>• Piano <b className="text-foreground">{meta.name}</b> attivato il {fmtDate(user.planSince)}</li>
          )}
          {completed > 0 && <li>• {completed} task completati nel progetto attivo</li>}
          {proj && <li>• Progetto attivo: <b className="text-foreground">{proj.name}</b></li>}
          <li>• Modalità pagamenti: <b className="text-foreground">test / sandbox</b></li>
        </ul>
      </Card>

      {/* When the project grows */}
      <Card>
        <CardHeader title="Quando il progetto cresce" />
        <div className="grid gap-3 md:grid-cols-2">
          <GrowCard
            icon={Building2}
            title="ARKHEON Enterprise"
            desc="Per team e organizzazioni che vogliono usare ARKHEON come workspace AI per gestire idee, progetti e innovazione."
            cta="Richiedi una demo"
            to="/enterprise"
          />
          <GrowCard
            icon={Cog}
            title="ARKHEON Studio"
            desc="Per aziende che vogliono che il nostro team costruisca automazioni, app, dashboard o AI agent su misura."
            cta="Richiedi un audit operativo"
            to="/studio"
          />
        </div>
      </Card>

      <PlanConfirmModal plan={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

function InvoiceList({ items }: { items: PaymentRecord[] }) {
  if (!items.length) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Nessun pagamento registrato. Quando attivi un piano in modalità test, lo storico apparirà qui.
      </p>
    );
  }
  return (
    <ul className="space-y-2 text-[13px]">
      {items.slice().reverse().map((r, i) => (
        <li key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2">
          <span>
            {fmtDate(r.at)} · {PLAN_BY_ID[r.plan].name} · €{r.amount}
          </span>
          <Pill tone={r.mode === "demo" ? "muted" : "brand"}>{r.mode}</Pill>
        </li>
      ))}
    </ul>
  );
}

function GrowCard({ icon: Icon, title, desc, cta, to }: any) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-brand/10 p-2 text-brand"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-[13.5px] font-semibold">{title}</div>
          <div className="text-[12.5px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      <a href={to} className="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-accent">
        {cta}
      </a>
    </div>
  );
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}
