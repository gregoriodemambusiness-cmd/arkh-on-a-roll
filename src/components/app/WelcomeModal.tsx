"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, X, ArrowRight, Loader2 } from "lucide-react";
import { createWorkspace } from "@/lib/workspaces";
import { useRouter } from "next/navigation";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  /** If user already has workspaces, skip the "create" step */
  hasWorkspaces?: boolean;
}

export function WelcomeModal({ open, onClose, hasWorkspaces = false }: WelcomeModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Inserisci un nome per il workspace."); return; }
    setLoading(true);
    const ws = await createWorkspace(name.trim());
    setLoading(false);
    if (!ws) { setError("Errore durante la creazione. Riprova."); return; }
    onClose();
    router.push("/onboarding");
  };

  const handleGoApp = () => {
    onClose();
    router.push("/app");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-border bg-card p-7 shadow-elegant"
            initial={{ opacity: 0, scale: 0.93, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.93, y: "-48%" }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Chiudi"
            >
              <X className="h-4 w-4" />
            </button>

            {hasWorkspaces ? (
              /* User already has workspaces — just welcome back */
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12 text-brand">
                  <Rocket className="h-7 w-7" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  Bentornato in PILOT!
                </h2>
                <p className="mt-2 text-[13.5px] text-muted-foreground">
                  I tuoi workspace sono pronti. Continua a costruire.
                </p>
                <button
                  onClick={handleGoApp}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[13.5px] font-medium text-background hover:opacity-90"
                >
                  Vai alla dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* New user — create first workspace */
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12 text-brand">
                  <Rocket className="h-7 w-7" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  Benvenuto in PILOT!
                </h2>
                <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                  Crea il tuo primo workspace per iniziare a costruire la tua startup con metodo.
                </p>

                <form onSubmit={handleCreate} className="mt-5 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-[12px] font-medium text-muted-foreground">
                      Nome del workspace
                    </span>
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(null); }}
                      placeholder="Es. LaunchPilot, Progetto Alpha…"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-brand"
                    />
                  </label>

                  {error && (
                    <p className="text-[12px] text-destructive">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[13.5px] font-medium text-background hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crea workspace <ArrowRight className="h-4 w-4" /></>}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    Fallo dopo
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
