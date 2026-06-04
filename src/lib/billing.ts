// Central pricing + plan config (used by landing, modals, Plan & Usage, dashboard).
// Plans are stored locally; checkout amounts are passed to Stripe via price_data
// at session-creation time (no Stripe Product/Price IDs required).

export type PlanId = "free" | "starter" | "pro" | "founder" | "enterprise";

export type PaidPlanId = Extract<PlanId, "starter" | "pro" | "founder">;

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // EUR/month (0 for free; -1 = custom)
  priceLabel: string;
  per: string;
  desc: string;
  features: string[];
  cta: string;
  featured?: boolean;
  external?: { to: string; label: string };
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    priceLabel: "0€",
    per: "/ 30 giorni",
    desc: "Per chi ha un'idea e vuole capire se vale la pena costruirla.",
    features: [
      "1 progetto",
      "Idea Lab base",
      "Blueprint essenziale",
      "Roadmap base",
      "Primi task iniziali",
      "Budget Guard base",
      "Founder Guard base",
      "Co-founder AI base",
    ],
    cta: "Inizia gratis",
  },
  {
    id: "starter",
    name: "Starter",
    price: 23,
    priceLabel: "23€",
    per: "/mese",
    desc: "Per chi vuole organizzare seriamente la propria idea.",
    features: [
      "1 progetto",
      "Brand Studio base",
      "Business Model base",
      "MVP essenziale",
      "Roadmap 30 giorni",
      "Task guidati base",
      "Budget Guard essenziale",
      "Pitch breve",
      "Marketing base",
    ],
    cta: "Scegli Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceLabel: "49€",
    per: "/mese",
    desc: "Per chi vuole costruire, validare e preparare il lancio.",
    featured: true,
    features: [
      "Tutto Starter",
      "Blueprint completo",
      "Business Model completo",
      "MVP Planner completo",
      "Roadmap 30/60/90",
      "Task Manager completo",
      "Brand Studio completo",
      "Domain Finder demo",
      "Launch Plan",
      "Marketing completo",
      "Budget Guard completo",
      "Funding Assistant manuale",
      "Export PDF demo",
    ],
    cta: "Scegli Pro",
  },
  {
    id: "founder",
    name: "Founder",
    price: 99,
    priceLabel: "99€",
    per: "/mese",
    desc: "Per chi vuole portare il progetto a un livello serio.",
    features: [
      "3 progetti",
      "Tutto Pro",
      "Competitor Agent",
      "Product Architect",
      "UX/UI Agent",
      "Ads Agent · Content Agent",
      "Investor Kit",
      "Validation avanzata",
      "Startup Health avanzato",
      "Team Builder",
      "Founder Guard avanzato",
      "Bandi & Funding intelligente demo",
      "Trademark Assistant avanzato demo",
      "Budget alerts avanzati",
      "Integrazioni principali demo",
      "Workspace team base",
    ],
    cta: "Diventa Founder",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: -1,
    priceLabel: "Su misura",
    per: "",
    desc: "Per team, aziende, scuole, incubatori, università e startup studio.",
    features: [
      "Workspace e ruoli personalizzati",
      "Portfolio multi-progetto",
      "Dashboard admin",
      "Report organizzazione",
      "Onboarding e SLA dedicati",
    ],
    cta: "Richiedi una demo",
    external: { to: "/enterprise", label: "Richiedi una demo" },
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p])
) as Record<PlanId, Plan>;

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  founder: 3,
  enterprise: 4,
};

export function isUpgrade(current: PlanId, target: PlanId) {
  return PLAN_RANK[target] > PLAN_RANK[current];
}

export function suggestPlan(current: PlanId): PaidPlanId {
  if (current === "free") return "starter";
  if (current === "starter") return "pro";
  return "founder";
}

// EUR price -> Stripe smallest unit (cents)
export function toStripeAmount(eur: number): number {
  return Math.round(eur * 100);
}
