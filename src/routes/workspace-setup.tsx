"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, ArrowRight, Copy, Check, Loader2, AlertTriangle, ChevronLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { createWorkspace, joinWorkspace, setActiveWorkspaceId } from "@/lib/workspaces";

type View = "choice" | "create" | "created" | "join";

export default function WorkspaceSetup() {
  const router = useRouter();
  const [view, setView] = useState<View>("choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create flow
  const [wsName, setWsName] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Join flow
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;
    setLoading(true);
    setError(null);
    const ws = await createWorkspace(wsName.trim());
    setLoading(false);
    if (!ws) { setError("Errore durante la creazione. Riprova."); return; }
    setActiveWorkspaceId(ws.id);
    setCreatedCode(ws.invite_code ?? null);
    setView("created");
  };

  const handleCopy = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleJoinDigit = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    setError(null);
    if (char && i < 5) digitRefs.current[i + 1]?.focus();
    if (char && i === 5) submitJoin(next.join(""));
  };

  const handleJoinKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) digitRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) digitRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) digitRefs.current[i + 1]?.focus();
  };

  const handleJoinPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      digitRefs.current[5]?.focus();
      submitJoin(pasted);
    }
  };

  const submitJoin = async (code: string) => {
    if (code.length < 6) return;
    setLoading(true);
    setError(null);
    const result = await joinWorkspace(code);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => digitRefs.current[0]?.focus(), 50);
      return;
    }
    setActiveWorkspaceId(result.workspace.id);
    router.push("/app");
  };

  const goToDashboard = () => {
    const hasOnboarding = localStorage.getItem("pilot-onboarding-complete");
    router.push(hasOnboarding ? "/app" : "/onboarding-chat");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-radial-brand" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="mb-8 flex justify-center">
          <Logo size={26} />
        </div>

        <AnimatePresence mode="wait">

          {/* ─── CHOICE ─── */}
          {view === "choice" && (
            <motion.div key="choice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="mb-2 text-center font-display text-2xl font-semibold tracking-tight">
                Benvenuto in PILOT
              </h1>
              <p className="mb-8 text-center text-[14px] text-muted-foreground">
                Crea il tuo workspace o unisciti a uno esistente con un codice invito.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChoiceCard
                  icon={<Plus className="h-6 w-6" />}
                  title="Crea il mio workspace"
                  desc="Inizia un nuovo progetto startup da zero."
                  onClick={() => setView("create")}
                />
                <ChoiceCard
                  icon={<Users className="h-6 w-6" />}
                  title="Unisciti a un workspace"
                  desc="Inserisci il codice a 6 cifre ricevuto dal tuo team."
                  onClick={() => setView("join")}
                />
              </div>
            </motion.div>
          )}

          {/* ─── CREATE ─── */}
          {view === "create" && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button
                onClick={() => { setView("choice"); setError(null); }}
                className="mb-6 flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Indietro
              </button>

              <div className="rounded-2xl border border-border bg-card p-7 shadow-elegant">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Plus className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">Crea workspace</h2>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                  Dai un nome al tuo workspace. Riceverai un codice invito da condividere con il tuo team.
                </p>

                <form onSubmit={handleCreate} className="mt-5 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                      Nome workspace
                    </label>
                    <input
                      autoFocus
                      type="text"
                      value={wsName}
                      onChange={(e) => { setWsName(e.target.value); setError(null); }}
                      placeholder="Es. LaunchPilot, Progetto Alpha..."
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] outline-none transition focus:border-brand"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-2.5 text-[12.5px] text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !wsName.trim()}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[13.5px] font-medium text-background hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crea workspace <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── CREATED (show code) ─── */}
          {view === "created" && (
            <motion.div key="created" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl border border-border bg-card p-7 shadow-elegant">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/12 text-success">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">Workspace creato!</h2>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                  Condividi questo codice con chi vuoi invitare nel tuo workspace.
                </p>

                {/* Code display */}
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Codice invito
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-6 py-4">
                    <span className="font-display text-3xl font-bold tracking-[0.3em] text-brand">
                      {createdCode?.slice(0, 3)}&nbsp;{createdCode?.slice(3)}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/30 bg-background text-brand hover:bg-brand/10"
                      title="Copia codice"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-[12px] text-success">Codice copiato!</span>
                  )}
                  <p className="text-center text-[12px] text-muted-foreground">
                    Puoi recuperare questo codice in qualsiasi momento da Impostazioni → Workspace.
                  </p>
                </div>

                <button
                  onClick={goToDashboard}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[13.5px] font-medium text-background hover:opacity-90"
                >
                  Vai alla dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── JOIN ─── */}
          {view === "join" && (
            <motion.div key="join" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button
                onClick={() => { setView("choice"); setError(null); setDigits(["", "", "", "", "", ""]); }}
                className="mb-6 flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Indietro
              </button>

              <div className="rounded-2xl border border-border bg-card p-7 shadow-elegant">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">Unisciti a un workspace</h2>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                  Inserisci il codice a 6 cifre che hai ricevuto dall'admin del workspace.
                </p>

                <div className="mt-6">
                  <div className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Codice invito
                  </div>
                  <div className="flex justify-center gap-2" onPaste={handleJoinPaste}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { digitRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleJoinDigit(i, e.target.value)}
                        onKeyDown={(e) => handleJoinKey(i, e)}
                        disabled={loading}
                        className={[
                          "h-14 w-12 rounded-xl border bg-surface text-center font-display text-2xl font-semibold outline-none transition",
                          error
                            ? "border-destructive/60 text-destructive"
                            : d
                            ? "border-brand/60 text-foreground"
                            : "border-border text-foreground",
                          "focus:border-brand",
                        ].join(" ")}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-destructive"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> {error}
                    </motion.div>
                  )}

                  <button
                    onClick={() => submitJoin(digits.join(""))}
                    disabled={loading || digits.join("").length < 6}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[13.5px] font-medium text-background hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entra nel workspace <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ChoiceCard({
  icon, title, desc, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-card transition hover:border-brand/40 hover:shadow-elegant"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/8 text-brand transition group-hover:bg-brand/15">
        {icon}
      </div>
      <div>
        <div className="text-[14.5px] font-semibold tracking-tight">{title}</div>
        <div className="mt-1 text-[13px] text-muted-foreground">{desc}</div>
      </div>
      <div className="mt-auto flex items-center gap-1 text-[12.5px] font-medium text-brand opacity-0 transition group-hover:opacity-100">
        Inizia <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </motion.button>
  );
}
