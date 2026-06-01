import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { setUser, getUser } from "@/lib/mockAuth";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Crea il tuo primo progetto startup — ARKHEON AI" }] }),
  component: Signup,
});

function Signup() {
  return <AuthShell mode="signup" />;
}

export function AuthShell({ mode }: { mode: "signup" | "login" }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = getUser();
    setUser({
      email: email || existing?.email || "founder@arkheon.ai",
      name: name || existing?.name || email.split("@")[0] || "Founder",
      plan: existing?.plan ?? "free",
      onboarded: mode === "login" ? existing?.onboarded ?? false : false,
      project: existing?.project,
    });
    nav({ to: mode === "signup" || !existing?.onboarded ? "/onboarding" : "/app" });
  };

  const social = (provider: string) => {
    setUser({ email: `you@${provider}.com`, name: "Founder", plan: "free", onboarded: false });
    nav({ to: "/onboarding" });
  };

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 md:flex">
        <Link to="/"><Logo size={24} /></Link>
        <div className="bg-radial-brand pointer-events-none absolute inset-0" />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
            Prima valida.<br/>Poi costruisci.
          </h2>
          <p className="mt-3 max-w-sm text-[14px] text-muted-foreground">
            ARKHEON AI ti guida dalla prima idea al primo cliente, senza bruciare budget.
          </p>
          <div className="mt-10 space-y-3">
            {["Idea Lab + Validation","Blueprint + Business Model","MVP, Roadmap e Task guidati","Co-founder AI sempre con te"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-[12px] text-muted-foreground">© ARKHEON AI</p>
      </div>

      <div className="flex flex-col px-5 py-8 md:p-10">
        <div className="flex items-center justify-between md:hidden">
          <Link to="/"><Logo size={22} /></Link>
        </div>
        <div className="mx-auto mt-12 w-full max-w-sm md:mt-auto">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {mode === "signup" ? "Crea il tuo primo progetto startup" : "Accedi al tuo workspace"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {mode === "signup" ? "30 giorni gratis. Nessuna carta richiesta." : "Bentornato. Continuiamo da dove avevi lasciato."}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { id: "google", label: "Google" },
              { id: "apple", label: "Apple" },
              { id: "github", label: "GitHub" },
            ].map((s) => (
              <button key={s.id} onClick={() => social(s.id)} className="rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-medium hover:bg-accent">
                {s.label}
              </button>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> oppure email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Input label="Nome" value={name} onChange={setName} placeholder="Il tuo nome" />
            )}
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@startup.com" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90">
              {mode === "signup" ? "Crea workspace" : "Entra"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            {mode === "signup" ? (
              <>Hai già un account? <Link to="/login" className="text-foreground hover:underline">Accedi</Link></>
            ) : (
              <>Non hai un account? <Link to="/signup" className="text-foreground hover:underline">Crea workspace</Link></>
            )}
          </p>
        </div>
        <div className="mt-auto" />
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required }: any) {
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
