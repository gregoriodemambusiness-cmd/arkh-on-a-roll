import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Stripe Checkout (Sandbox / test mode) created via REST API.
// Requires an authenticated Supabase session — the user id is taken from the
// validated bearer token so checkout is always tied to a real account.

const PAID_PLANS = {
  starter: { name: "PILOT Starter", amount: 2300 },
  pro: { name: "PILOT Pro", amount: 4900 },
  founder: { name: "PILOT Founder", amount: 9900 },
} as const;

type PaidPlan = keyof typeof PAID_PLANS;

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; missingKeys?: boolean };

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        plan: z.enum(["starter", "pro", "founder"]),
        origin: z.string().url(),
      })
      .parse(d)
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
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

    const { userId, claims } = context;
    const email = (claims as any)?.email as string | undefined;
    const plan = PAID_PLANS[data.plan as PaidPlan];
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set(
      "success_url",
      `${data.origin}/payment-success?plan=${data.plan}&session_id={CHECKOUT_SESSION_ID}`
    );
    params.set("cancel_url", `${data.origin}/payment-cancel?plan=${data.plan}`);
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][product_data][name]", plan.name);
    params.set("line_items[0][price_data][unit_amount]", String(plan.amount));
    params.set("line_items[0][price_data][recurring][interval]", "month");
    if (email) params.set("customer_email", email);
    params.set("client_reference_id", userId);
    params.set("metadata[user_id]", userId);
    params.set("metadata[plan]", data.plan);
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
      const body = (await res.json()) as any;
      if (!res.ok) {
        const msg = body?.error?.message || `Stripe error ${res.status}`;
        console.error("Stripe checkout error:", msg);
        return { ok: false, error: msg };
      }
      if (!body?.url) return { ok: false, error: "Stripe non ha restituito un URL di checkout." };
      return { ok: true, url: body.url as string };
    } catch (e: any) {
      console.error("Stripe request failed:", e);
      return { ok: false, error: "Impossibile contattare Stripe. Riprova tra poco." };
    }
  });
