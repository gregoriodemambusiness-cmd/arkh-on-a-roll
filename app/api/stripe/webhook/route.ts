import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe webhook handler — handles checkout.session.completed and
// subscription lifecycle events to keep user plans in sync with Stripe.
//
// Configure in Stripe Dashboard → Webhooks → Add endpoint:
//   URL: https://your-domain.com/api/stripe/webhook
//   Events: checkout.session.completed, customer.subscription.updated,
//           customer.subscription.deleted, invoice.payment_failed

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const PLAN_BY_AMOUNT: Record<number, string> = {
  2300: "starter",
  4900: "pro",
  9900: "founder",
  19900: "starter",  // annual equivalent lookup — amounts in cents
  23: "starter",
  49: "pro",
  99: "founder",
};

function planFromSession(session: Stripe.Checkout.Session): string {
  const meta = session.metadata?.plan;
  if (meta && ["starter", "pro", "founder"].includes(meta)) return meta;
  const amount = session.amount_total;
  if (amount) {
    const eur = amount / 100;
    return PLAN_BY_AMOUNT[eur] || PLAN_BY_AMOUNT[amount] || "starter";
  }
  return "starter";
}

async function upsertProfile(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  plan: string,
  sessionId: string,
  email?: string | null,
) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        current_plan: plan,
        plan_status: "active",
        ...(email ? { email } : {}),
        updated_at: now,
      },
      { onConflict: "id" },
    );
  if (error) console.error("[webhook] upsert profile error:", error);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev fallback: parse without signature verification
      event = JSON.parse(body) as Stripe.Event;
      console.warn("[webhook] No webhook secret — skipping signature verification");
    }
  } catch (err: unknown) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        if (!userId) {
          console.warn("[webhook] checkout.session.completed — no user id in session");
          break;
        }
        const plan = planFromSession(session);
        await upsertProfile(supabase, userId, plan, session.id, session.customer_email);
        console.log(`[webhook] plan=${plan} activated for user=${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        const status = sub.status === "active" ? "active" : "inactive";
        await supabase
          .from("profiles")
          .update({ plan_status: status, updated_at: new Date().toISOString() })
          .eq("id", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        await supabase
          .from("profiles")
          .update({ current_plan: "free", plan_status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", userId);
        console.log(`[webhook] subscription cancelled for user=${userId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          await supabase
            .from("profiles")
            .update({ plan_status: "payment_failed", updated_at: new Date().toISOString() })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
