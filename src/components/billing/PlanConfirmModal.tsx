"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { PLAN_BY_ID, type PlanId, type PaidPlanId, type BillingPeriod, getPlanPrice } from "@/lib/billing";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { setPlan } from "@/lib/mockAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthRequiredModal } from "./AuthRequiredModal";

type Props = {
  plan: PaidPlanId | null;
  billing?: BillingPeriod;
  onClose: () => void;
};

export function PlanConfirmModal({ plan, billing = "monthly", onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [needsAuth, setNeedsAuth] = useState<PaidPlanId | null>(null);

  useEffect(() => {
    if (plan) {
      setError(null);
      setMissing(false);
    }
  }, [plan]);

  if (!plan) {
    return <AuthRequiredModal plan={needsAuth} onClose={() => setNeedsAuth(null)} />;
  }
  const p = PLAN_BY_ID[plan as PlanId];
  const isAnnual = billing === "annual";
  const totalAmount = getPlanPrice(p, billing);
  const monthlyEquiv = isAnnual ? (p.priceAnnualMonthly ?? p.price) : p.price;
  const savings = isAnnual ? p.savingsAnnual : undefined;

  const go = async () => {
    setLoading(true);
    setError(null);
    setMissing(false);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setLoading(false);
        setNeedsAuth(plan);
        onClose();
        return;
      }
      const res = await createCheckoutSession({
        plan,
        origin: window.location.origin,
        userId: sess.session.user.id,
        email: sess.session.user.email,
        billing,
        amount: totalAmount,
      });
      if (res.ok) {
        window.location.href = res.url;
        return;
      }
      setError(res.error);
      setMissing(!!(res as { missingKeys?: boolean }).missingKeys);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || "Errore inatteso durante l'avvio del checkout.");
    } finally {
      setLoading(false);
    }
  };

  const demoUpgrade = () => {
    setPlan(plan, { amount: totalAmount, mode: "demo" });
    onClose();
    window.location.href = `/payment-success?plan=${plan}&demo=1&billing=${billing}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-4 backdrop-blur-md md:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-brand" /> Modalità test / sandbox
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
              Conferma il piano
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Stai per attivare <b className="text-foreground">{p.name}</b>. Pagamento in modalità test, nessun addebito reale.
            </p>

            <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] font-medium">{p.name}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Periodo: <span className="font-medium text-foreground">{isAnnual ? "Annuale" : "Mensile"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div>
                    <span className="font-display text-2xl font-semibold">{monthlyEquiv}€</span>
                    <span className="ml-1 text-[12px] text-muted-foreground">/ mese</span>
                  </div>
                  {isAnnual && (
                    <div className="text-[11.5px] text-muted-foreground">
                      fatturato €{totalAmount}/anno
                    </div>
                  )}
                </div>
              </div>

              {savings && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2">
                  <span className="text-[12px] font-semibold text-emerald-600">🎉 Risparmi €{savings}/anno</span>
                  <span className="text-[11.5px] text-muted-foreground">rispetto al mensile</span>
                </div>
              )}

              {isAnnual && (
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  Fatturato oggi €{totalAmount}, poi €{totalAmount} ogni anno.
                </p>
              )}

              <ul className="mt-3 grid gap-1.5">
                {p.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 text-brand" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-[12.5px] text-warning">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <div className="font-medium">Checkout non disponibile</div>
                    <div className="mt-0.5 text-warning/90">{error}</div>
                    {missing && (
                      <div className="mt-1.5 text-[11.5px] text-muted-foreground">
                        Aggiungi <code className="rounded bg-muted px-1">STRIPE_PUBLISHABLE_KEY_TEST</code> e <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY_TEST</code> nei Secrets, poi riprova.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                disabled={loading}
                onClick={go}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Apertura checkout…</>
                ) : (
                  <>Vai al checkout test</>
                )}
              </button>
              {error && (
                <button
                  onClick={demoUpgrade}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-[12.5px] font-medium text-foreground hover:bg-accent"
                >
                  Attiva piano in modalità demo (senza Stripe)
                </button>
              )}
              <button
                onClick={onClose}
                className="text-[12.5px] text-muted-foreground hover:text-foreground"
              >
                Annulla
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Pagamento in modalità test/sandbox · nessun addebito reale
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
