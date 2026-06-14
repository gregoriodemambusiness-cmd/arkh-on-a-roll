"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { startAuthSync } from "@/lib/authSync";

const CORRECT_CODE = "000000"; // "000-000" without dash

export default function VerifyPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "wrong" | "loading" | "success" | "needsConfirm">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus first empty input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigit = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    setError(null);
    if (char && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
    // Auto-submit when last digit is filled
    if (char && i === 5) {
      submitCode(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  // Handle paste: fill all 6 digits at once
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setDigits(next);
      inputRefs.current[5]?.focus();
      submitCode(pasted);
    }
  };

  const submitCode = async (code: string) => {
    if (code.length < 6) return;
    if (code !== CORRECT_CODE) {
      setStatus("wrong");
      setError("Codice non valido. Il codice corretto è 000-000.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        setStatus("idle");
        inputRefs.current[0]?.focus();
      }, 700);
      return;
    }

    setStatus("loading");

    try {
      // Try to get existing session (works if Supabase has email confirm disabled)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const stored = sessionStorage.getItem("pilot-pending-auth");
        if (stored) {
          const { email, password } = JSON.parse(stored) as { email: string; password: string };
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

          if (signInErr) {
            const needsConfirm =
              signInErr.message.toLowerCase().includes("email not confirmed") ||
              signInErr.message.toLowerCase().includes("invalid login");

            if (needsConfirm) {
              // OTP code was correct — let user continue even without a session
              setStatus("needsConfirm");
              return;
            }
            setError(signInErr.message);
            setStatus("idle");
            return;
          }
        }
      }

      sessionStorage.removeItem("pilot-pending-auth");
      startAuthSync();
      setStatus("success");
      setTimeout(() => {
        sessionStorage.setItem("pilot-welcome", "1");
        const dest = localStorage.getItem("pilot-onboarding-complete") ? "/" : "/onboarding-chat";
        router.push(dest);
      }, 900);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Errore di autenticazione.");
      setStatus("idle");
    }
  };

  const codeValue = digits.join("");
  const filled = codeValue.length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm text-center"
      >
        <Logo size={28} className="mx-auto mb-8" />

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <p className="text-[15px] font-medium">Verifica completata!</p>
              <p className="text-[13px] text-muted-foreground">Reindirizzamento in corso…</p>
            </motion.div>
          ) : status === "needsConfirm" ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold">Codice corretto ✓</p>
                <p className="mt-1.5 max-w-xs text-[13.5px] text-muted-foreground">
                  Supabase richiede la conferma email prima del primo accesso.
                  Controlla la tua casella e clicca il link di conferma.
                </p>
                <p className="mt-2 text-[12.5px] text-muted-foreground">
                  Oppure, disabilita <strong>"Confirm email"</strong> in{" "}
                  <span className="font-medium text-foreground">
                    Supabase → Authentication → Providers → Email
                  </span>
                  .
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <button
                  onClick={() => {
                    sessionStorage.setItem("pilot-welcome", "1");
                    const dest = localStorage.getItem("pilot-onboarding-complete") ? "/" : "/onboarding-chat";
                    router.push(dest);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[14px] font-medium text-background hover:opacity-90"
                >
                  Continua <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-2.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                  Vai al login (dopo aver confermato l'email)
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Verifica il tuo account
              </h1>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                Inserisci il codice di verifica.<br />
                <span className="font-medium text-foreground">Per questo MVP usa: 000-000</span>
              </p>

              {/* 6-digit input with dash */}
              <motion.div
                className="mt-8 flex items-center justify-center gap-2"
                animate={status === "wrong" ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.45 }}
                onPaste={handlePaste}
              >
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`h-14 w-12 rounded-xl border-2 bg-surface text-center font-display text-2xl font-semibold outline-none transition-all
                      ${digits[i] ? "border-brand text-foreground" : "border-border text-muted-foreground"}
                      ${status === "wrong" ? "border-destructive" : ""}
                      focus:border-brand`}
                  />
                ))}
                <span className="text-2xl font-light text-muted-foreground">-</span>
                {[3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`h-14 w-12 rounded-xl border-2 bg-surface text-center font-display text-2xl font-semibold outline-none transition-all
                      ${digits[i] ? "border-brand text-foreground" : "border-border text-muted-foreground"}
                      ${status === "wrong" ? "border-destructive" : ""}
                      focus:border-brand`}
                  />
                ))}
              </motion.div>

              {/* Progress dots */}
              <div className="mt-4 flex justify-center gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${i < filled ? "bg-brand" : "bg-border"}`}
                    animate={i < filled ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-[12.5px] text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Manual submit */}
              <button
                onClick={() => submitCode(codeValue)}
                disabled={filled < 6 || status === "loading"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[14px] font-medium text-background hover:opacity-90 disabled:opacity-40"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verifica e accedi"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
