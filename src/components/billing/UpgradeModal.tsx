import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/lib/nextCompat";
import { X, ArrowRight, Sparkles, Check } from "lucide-react";
import { PLAN_BY_ID, type PlanId, type PaidPlanId } from "@/lib/billing";
import { PlanConfirmModal } from "./PlanConfirmModal";

type Reason = "feature" | "team" | "studio";

type Props = {
  open: boolean;
  onClose: () => void;
  current: PlanId;
  suggested: PaidPlanId | "enterprise";
  reason?: Reason;
  featureLabel?: string;
};

export function UpgradeModal({ open, onClose, current, suggested, featureLabel, reason = "feature" }: Props) {
  const [confirm, setConfirm] = useState<PaidPlanId | null>(null);

  if (!open) return null;
  const target = PLAN_BY_ID[suggested];
  const cur = PLAN_BY_ID[current];

  const choose = () => {
    if (suggested === "enterprise") {
      window.location.href = "/enterprise";
      return;
    }
    if (reason === "studio") {
      window.location.href = "/studio";
      return;
    }
    setConfirm(suggested as PaidPlanId);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center bg-background/70 p-4 backdrop-blur-md md:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
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
                <Sparkles className="h-3 w-3 text-brand" />
                {reason === "team" ? "Per il tuo team" : reason === "studio" ? "Costruito per te" : "Più profondità"}
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
                Sblocca più profondità per il tuo progetto
              </h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">
                {featureLabel ? <><b className="text-foreground">{featureLabel}</b> è disponibile nei piani superiori. </> : null}
                Questa funzione richiede un livello più avanzato di analisi, automazione e supporto.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface/60 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Piano attuale</div>
                  <div className="mt-1 font-display text-lg font-semibold">{cur.name}</div>
                  <div className="text-[12px] text-muted-foreground">{cur.priceLabel} {cur.per}</div>
                </div>
                <div className="rounded-2xl border border-foreground bg-card p-4 shadow-elegant">
                  <div className="text-[11px] uppercase tracking-wider text-brand">Consigliato</div>
                  <div className="mt-1 font-display text-lg font-semibold">{target.name}</div>
                  <div className="text-[12px] text-muted-foreground">{target.priceLabel} {target.per}</div>
                  <ul className="mt-3 space-y-1">
                    {target.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[12.5px]">
                        <Check className="mt-0.5 h-3 w-3 text-brand" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={choose}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90"
                >
                  {target.cta} <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-[13.5px] font-medium text-foreground hover:bg-accent"
                >
                  Continua con {cur.name}
                </button>
              </div>
              {reason !== "studio" && suggested !== "enterprise" && (
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Stai costruendo con un team? <Link to="/enterprise" className="text-foreground hover:underline">Scopri Enterprise</Link> · Vuoi un'automazione su misura? <Link to="/studio" className="text-foreground hover:underline">Scopri Studio</Link>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <PlanConfirmModal plan={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
