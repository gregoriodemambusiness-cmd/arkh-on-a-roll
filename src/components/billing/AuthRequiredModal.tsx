import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/lib/nextCompat";
import { X, UserPlus, LogIn, Lock } from "lucide-react";
import { PLAN_BY_ID, type PaidPlanId } from "@/lib/billing";
import { setPendingPlan } from "@/lib/pendingPlan";

type Props = {
  plan: PaidPlanId | null;
  onClose: () => void;
};

export function AuthRequiredModal({ plan, onClose }: Props) {
  if (!plan) return null;
  const p = PLAN_BY_ID[plan];

  const remember = () => {
    setPendingPlan(plan);
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
              <Lock className="h-3 w-3 text-brand" /> Account richiesto
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
              Crea un account prima di scegliere il piano
            </h2>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              Per collegare <b className="text-foreground">{p.name}</b> al tuo workspace Pilot, devi prima creare un account o accedere. Il pagamento test resta inalterato.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/signup"
                onClick={remember}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90"
              >
                <UserPlus className="h-3.5 w-3.5" /> Crea account
              </Link>
              <Link
                to="/login"
                onClick={remember}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground hover:bg-accent"
              >
                <LogIn className="h-3.5 w-3.5" /> Accedi
              </Link>
              <button
                onClick={onClose}
                className="text-[12.5px] text-muted-foreground hover:text-foreground"
              >
                Annulla
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
