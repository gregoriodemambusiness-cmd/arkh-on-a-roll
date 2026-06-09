"use server";

const PAID_PLANS = {
  starter: { name: "PILOT Starter", amount: 2300 },
  pro: { name: "PILOT Pro", amount: 4900 },
  founder: { name: "PILOT Founder", amount: 9900 },
} as const;

type PaidPlan = keyof typeof PAID_PLANS;

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; missingKeys?: boolean };

export async function createCheckoutSession({
  plan,
  origin,
  userId,
  email,
}: {
  plan: string;
  origin: string;
  userId?: string;
  email?: string;
}): Promise<CheckoutResult> {
  const secret = process.env.STRIPE_SECRET_KEY_TEST;
  if (!secret) {
    return {
      ok: false,
      missingKeys: true,
      error:
        "Stripe sandbox non configurato. Aggiungi STRIPE_SECRET_KEY_TEST nei Secrets del progetto.",
    };
  }
  if (!secret.startsWith("sk_test_")) {
    return {
      ok: false,
      error:
        "Per sicurezza il sandbox accetta solo chiavi di test (sk_test_…). La chiave configurata non è una test key.",
    };
  }

  const planData = PAID_PLANS[plan as PaidPlan];
  if (!planData) return { ok: false, error: "Piano non valido." };

  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("success_url", `${origin}/payment-success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/payment-cancel?plan=${plan}`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][product_data][name]", planData.name);
  params.set("line_items[0][price_data][unit_amount]", String(planData.amount));
  params.set("line_items[0][price_data][recurring][interval]", "month");
  if (email) params.set("customer_email", email);
  if (userId) {
    params.set("client_reference_id", userId);
    params.set("metadata[user_id]", userId);
  }
  params.set("metadata[plan]", plan);
  params.set("metadata[source]", "pilot-ai");
  params.set("allow_promotion_codes", "true");

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg = ((body?.error as Record<string, unknown>)?.message as string) || `Stripe error ${res.status}`;
      console.error("Stripe checkout error:", msg);
      return { ok: false, error: msg };
    }
    if (!body?.url) return { ok: false, error: "Stripe non ha restituito un URL di checkout." };
    return { ok: true, url: body.url as string };
  } catch (e: unknown) {
    console.error("Stripe request failed:", e);
    return { ok: false, error: "Impossibile contattare Stripe. Riprova tra poco." };
  }
}
