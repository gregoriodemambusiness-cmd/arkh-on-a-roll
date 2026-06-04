import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { z } from "zod";
import { PLAN_BY_ID, type PaidPlanId } from "@/lib/billing";
import { setPlan, getUser } from "@/lib/mockAuth";
import { Logo } from "@/components/brand/Logo";

const searchSchema = z.object({
  plan: z.enum(["starter", "pro", "founder"]).optional(),
  session_id: z.string().optional(),
  demo: z.string().optional(),
});

export const Route = createFileRoute("/payment-success")({
  head: () => ({ meta: [{ title: "Pagamento test completato — ARKHEON AI" }] }),
  validateSearch: searchSchema,
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { plan, session_id, demo } = useSearch({ from: "/payment-success" }) as z.infer<typeof searchSchema>;
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!plan) return;
    const user = getUser();
    if (!user) return;
    // Avoid double-recording if user refreshes.
    const dup = user.paymentHistory?.find((p) => session_id && p.sessionId === session_id);
    if (dup) {
      setApplied(true);
      return;
    }
    setPlan(plan, {
      amount: PLAN_BY_ID[plan].price,
      mode: demo ? "demo" : "test",
      sessionId: session_id,
    });
    setApplied(true);
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
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 18 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 className="h-7 w-7" />
        </motion.div>
        <h1 className="mt-5 text-center font-display text-2xl font-semibold tracking-tight">
          Pagamento {demo ? "demo" : "test"} completato
        </h1>
        <p className="mt-2 text-center text-[14px] text-muted-foreground">
          Il tuo piano è stato aggiornato. Nessun addebito reale è stato effettuato.
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

        {!applied && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Applicazione del piano in corso…
          </p>
        )}
      </motion.div>
    </div>
  );
}
