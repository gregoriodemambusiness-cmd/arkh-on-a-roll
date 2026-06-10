"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { addClientToCRM } from "@/lib/notion";
import NextLink from "next/link";

export default function SignupPage() {
  return <AuthShell mode="signup" />;
}

export function AuthShell({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (password !== confirm) { setError("Le due password non coincidono."); return; }
      if (password.length < 6) { setError("La password deve avere almeno 6 caratteri."); return; }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || email.split("@")[0] } },
        });
        if (signUpErr) throw signUpErr;

        // Store credentials for the verify page (in case email confirm is required)
        sessionStorage.setItem(
          "pilot-pending-auth",
          JSON.stringify({ email, password, name: name || email.split("@")[0] }),
        );

        // Fire-and-forget CRM
        addClientToCRM({
          name: name || email.split("@")[0],
          email,
          plan: "free",
          healthScore: 50,
        }).catch((err) => console.warn("[notion] addClientToCRM:", err));

        router.push("/verify");
      } else {
        // LOGIN
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;

        // Import dynamically to avoid SSR issues
        const { startAuthSync } = await import("@/lib/authSync");
        startAuthSync();

        // Set welcome flag if first login (no workspaces yet — checked on landing)
        sessionStorage.setItem("pilot-welcome", "1");
        router.push("/");
      }
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || "Errore di autenticazione.");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 md:flex">
        <NextLink href="/"><Logo size={24} /></NextLink>
        <div className="bg-radial-brand pointer-events-none absolute inset-0" />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
            Prima valida.<br />Poi costruisci.
          </h2>
          <p className="mt-3 max-w-sm text-[14px] text-muted-foreground">
            PILOT AI ti guida dalla prima idea al primo cliente, senza bruciare budget.
          </p>
          <div className="mt-10 space-y-3">
            {[
              "Idea Lab + Validation",
              "Blueprint + Business Model",
              "MVP, Roadmap e Task guidati",
              "Co-founder AI sempre con te",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-[12px] text-muted-foreground">© PILOT AI</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col px-5 py-8 md:p-10">
        <div className="flex items-center justify-between md:hidden">
          <NextLink href="/"><Logo size={22} /></NextLink>
        </div>
        <div className="mx-auto mt-12 w-full max-w-sm md:mt-auto">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {mode === "signup" ? "Crea il tuo workspace Pilot" : "Bentornato in Pilot"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {mode === "signup"
              ? "Salva il tuo progetto, collega il piano e continua a costruire con metodo."
              : "Accedi al tuo workspace e continua dal prossimo step."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <Field label="Nome" value={name} onChange={setName} placeholder="Il tuo nome" />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@startup.com" required />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            {mode === "signup" && (
              <Field label="Conferma password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" required />
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-2.5 text-[12.5px] text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signup" ? (
                "Continua"
              ) : (
                "Entra"
              )}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            {mode === "signup" ? (
              <>
                Hai già un account?{" "}
                <NextLink href="/login" className="text-foreground hover:underline">
                  Accedi
                </NextLink>
              </>
            ) : (
              <>
                Non hai un account?{" "}
                <NextLink href="/signup" className="text-foreground hover:underline">
                  Crea workspace
                </NextLink>
              </>
            )}
          </p>
        </div>
        <div className="mt-auto" />
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-brand"
      />
    </label>
  );
}
