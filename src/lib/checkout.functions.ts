"use server";

// Stripe Checkout — supports both live and test keys.
// Priority: STRIPE_SECRET_KEY (live) > STRIPE_SECRET_KEY_TEST (sandbox)
//
// Required env vars:
//   STRIPE_SECRET_KEY          — live secret key (sk_live_...)
//   STRIPE_SECRET_KEY_TEST     — test secret key (sk_test_...)
//   STRIPE_WEBHOOK_SECRET      — webhook signing secret (whsec_...)

const PAID_PLANS = {
  starter: { name: "PILOT Starter", amount: 2300 },
  pro:     { name: "PILOT Pro",     amount: 4900 },
  founder: { name: "PILOT Founder", amount: 9900 },
} as const;

type PaidPlan = keyof typeof PAID_PLANS;

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; missingKeys?: boolean };

function resolveStripeKey(): { key: string; isLive: boolean } | null {
  const live = process.env.STRIPE_SECRET_KEY;
  if (live?.startsWith("sk_live_")) return { key: live, isLive: true };

  const test = process.env.STRIPE_SECRET_KEY_TEST;
  if (test?.startsWith("sk_test_")) return { key: test, isLive: false };

  return null;
}

export async function createCheckoutSession({
  plan,
  origin,
  userId,
  email,
  billing = "monthly",
  amount,
}: {
  plan: string;
  origin: string;
  userId?: string;
  email?: string;
  billing?: "monthly" | "annual";
  amount?: number;
}): Promise<CheckoutResult> {
  const resolved = resolveStripeKey();
  if (!resolved) {
    return {
      ok: false,
      missingKeys: true,
      error:
        "Stripe non configurato. Aggiungi STRIPE_SECRET_KEY (live) o STRIPE_SECRET_KEY_TEST (sandbox) nei Secrets.",
    };
  }

  const { key, isLive } = resolved;
  const planData = PAID_PLANS[plan as PaidPlan];
  if (!planData) return { ok: false, error: "Piano non valido." };

  const isAnnual = billing === "annual";
  // amount is in EUR (e.g. 23 or 199); convert to cents
  const unitAmount = amount ? Math.round(amount * 100) : planData.amount;
  const productName = `${planData.name}${isAnnual ? " (Annuale)" : ""}`;
  const interval = isAnnual ? "year" : "month";

  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("success_url", `${origin}/payment-success?plan=${plan}&billing=${billing}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/payment-cancel?plan=${plan}`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][product_data][name]", productName);
  params.set("line_items[0][price_data][unit_amount]", String(unitAmount));
  params.set("line_items[0][price_data][recurring][interval]", interval);
  params.set("metadata[plan]", plan);
  params.set("metadata[billing]", billing);
  params.set("metadata[source]", "pilot-ai");
  if (email) params.set("customer_email", email);
  if (userId) {
    params.set("client_reference_id", userId);
    params.set("metadata[user_id]", userId);
  }
  params.set("allow_promotion_codes", "true");
  if (!isLive) {
    // In test mode label the product for clarity in Stripe dashboard
    params.set("line_items[0][price_data][product_data][description]", "[TEST MODE] Nessun addebito reale");
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg = ((body?.error as Record<string, unknown>)?.message as string) || `Stripe error ${res.status}`;
      console.error("[checkout] Stripe error:", msg);
      return { ok: false, error: msg };
    }
    if (!body?.url) return { ok: false, error: "Stripe non ha restituito un URL di checkout." };
    return { ok: true, url: body.url as string };
  } catch (e: unknown) {
    console.error("[checkout] request failed:", e);
    return { ok: false, error: "Impossibile contattare Stripe. Riprova tra poco." };
  }
}

export async function isLiveMode(): Promise<boolean> {
  const resolved = resolveStripeKey();
  return resolved?.isLive ?? false;
}
