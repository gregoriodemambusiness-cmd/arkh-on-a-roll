"use client";
import { Link } from "@/lib/nextCompat";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { PLAN_BY_ID, type PaidPlanId } from "@/lib/billing";
import { setPlan } from "@/lib/mockAuth";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { updateMyPlan, recordPayment } from "@/lib/profile.functions";

function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") as "starter" | "pro" | "founder" | null | undefined;
  const session_id = searchParams.get("session_id") ?? undefined;
  const demo = searchParams.get("demo") ?? undefined;

  const [status, setStatus] = useState<"checking" | "needs-login" | "saving" | "done" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!plan) {
        setStatus("done");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (demo) {
          setPlan(plan, { amount: PLAN_BY_ID[plan as PaidPlanId].price, mode: "demo", sessionId: session_id });
          setStatus("done");
          return;
        }
        setStatus("needs-login");
        return;
      }
      setStatus("saving");
      try {
        const userId = data.session.user.id;
        const planMeta = PLAN_BY_ID[plan as PaidPlanId];

        // 1. Persist to Supabase (authoritative)
        await updateMyPlan({
          data: { userId, plan, stripe_session_id: session_id },
        });
        // 2. Record payment for history
        await recordPayment({
          data: {
            userId,
            plan,
            amount: planMeta.price,
            currency: "eur",
            stripe_session_id: session_id,
            status: demo ? "demo" : "paid",
          },
        });
        // 3. Mirror into local cache so the topbar / Plan & Usage refresh instantly
        setPlan(plan, { amount: planMeta.price, mode: demo ? "demo" : "test", sessionId: session_id });
        if (!cancelled) setStatus("done");
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) {
          setError((e as { message?: string })?.message || "Errore nel collegamento del piano.");
          setStatus("error");
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [plan, session_id, demo]);

  const planMeta = plan ? PLAN_BY_ID[plan as PaidPlanId] : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-5">
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <header className="absolute left-0 right-0 top-0 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5"><Link to="/"><Logo size={22} /></Link></div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant"
      >
        {status === "needs-login" ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-center font-display text-2xl font-semibold tracking-tight">Accedi per completare il collegamento del piano</h1>
            <p className="mt-2 text-center text-[14px] text-muted-foreground">
              Il pagamento test è stato registrato da Stripe, ma serve un account per collegarlo al tuo workspace.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => router.push("/login")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90"
              >
                Accedi <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Link to="/signup" className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-[12.5px] text-foreground hover:bg-accent">
                Crea un account
              </Link>
            </div>
          </>
        ) : status === "error" ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-center font-display text-2xl font-semibold tracking-tight">Collegamento non riuscito</h1>
            <p className="mt-2 text-center text-[13.5px] text-muted-foreground">{error}</p>
            <Link to="/app/plan" className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-[12.5px] text-foreground hover:bg-accent">
              Apri Plan & Usage
            </Link>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 18 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success"
            >
              {status === "done" ? <CheckCircle2 className="h-7 w-7" /> : <Loader2 className="h-7 w-7 animate-spin" />}
            </motion.div>
            <h1 className="mt-5 text-center font-display text-2xl font-semibold tracking-tight">
              {status === "done" ? `Pagamento ${demo ? "demo" : "test"} completato` : "Stiamo collegando il piano…"}
            </h1>
            <p className="mt-2 text-center text-[14px] text-muted-foreground">
              {status === "done"
                ? "Il tuo piano è stato collegato al tuo account. Nessun addebito reale è stato effettuato."
                : "Aggiorniamo il tuo workspace, ci vuole un attimo."}
            </p>

            {planMeta && (
              <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-4">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-brand" /> {planMeta.name}
                  </div>
                  <div>
                    <span className="font-display text-xl font-semibold">{planMeta.priceLabel}</span>
                    <span className="ml-1 text-[12px] text-muted-foreground">{planMeta.per}</span>
                  </div>
                </div>
                <p className="mt-2 text-[12.5px] text-muted-foreground">{planMeta.desc}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/app"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90"
              >
                Vai alla dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/app/plan"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-[12.5px] text-foreground hover:bg-accent"
              >
                Vedi Plan & Usage
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default PaymentSuccess;
