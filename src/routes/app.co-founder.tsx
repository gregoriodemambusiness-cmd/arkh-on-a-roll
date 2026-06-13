"use client";
import { useState } from "react";
import { Sparkles, Send, Wand2, HeadphonesIcon, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Card, PageHeader, Pill } from "@/components/app/ui";
import { useProject, analyzeBudget, computeHealth, formatEuro } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { submitSupportTicket } from "@/lib/notion.functions";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";

export default CoFounder;

type Msg = { role: "user" | "ai"; text: string };

function SupportModal({ onClose, userEmail }: { onClose: () => void; userEmail: string }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setStatus("loading");
    try {
      const result = await submitSupportTicket({
        title: title.trim(),
        email: userEmail,
        message: message.trim(),
        category: "domanda",
        priority: "media",
      });
      if (!result.ok) throw new Error(result.error);
      setStatus("ok");
    } catch (err) {
      console.error("[notion] createSupportTicket:", err);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5">
          <h2 className="font-display text-[17px] font-semibold tracking-tight">Contatta il supporto</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Ti risponderemo entro 24 ore lavorative.</p>
        </div>

        {status === "ok" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-brand" />
            <p className="font-medium">Ticket inviato!</p>
            <p className="text-[13px] text-muted-foreground">Il nostro team ti contatterà presto.</p>
            <button onClick={onClose} className="mt-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background hover:opacity-90">
              Chiudi
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Oggetto</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Non riesco ad aggiornare il piano"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Messaggio</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descrivi il problema o la domanda…"
                rows={4}
                required
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-brand"
              />
            </label>
            {status === "error" && (
              <p className="text-[12.5px] text-destructive">Invio fallito. Controlla la connessione e riprova.</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {status === "loading" ? "Invio…" : "Invia ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CoFounder() {
  const proj = useProject();
  const user = useUser();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Ciao 👋 Sono il tuo Co-founder AI. Conosco il tuo progetto. Da dove vuoi iniziare oggi?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const plan = user?.plan ?? "free";
  const usage = checkUsageLimit(plan);

  const buildContext = () => {
    if (!proj) return "Nessun progetto creato ancora.";
    const { score } = computeHealth(proj);
    const b = analyzeBudget(proj);
    const todo = proj.tasks.filter((t) => t.status !== "Completato");
    return [
      `Progetto: ${proj.name}`,
      `Descrizione: ${proj.onelinePitch ?? ""}`,
      `Fase: ${proj.onboarding.stage}`,
      `Settore: ${proj.onboarding.sector}`,
      `Target: ${proj.blueprint?.target ?? ""}`,
      `Problema: ${proj.blueprint?.problem ?? ""}`,
      `Soluzione: ${proj.blueprint?.solution ?? ""}`,
      `Modello di business: ${proj.blueprint?.businessModel ?? ""}`,
      `MVP essenziale: ${proj.mvpEssential?.join(", ") ?? ""}`,
      `Health score: ${score}/100`,
      `Budget disponibile: ${formatEuro(b.available)}, MVP stimato: ${formatEuro(b.estimated)}, rischio: ${b.risk}`,
      `Task aperti: ${todo.length}`,
      todo.length > 0 ? `Prossimo task: ${todo[0].title}` : "",
    ].filter(Boolean).join("\n");
  };

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || loading) return;

    const freshUsage = checkUsageLimit(plan);
    if (!freshUsage.allowed) {
      setMsgs((m) => [...m, {
        role: "ai",
        text: "Hai esaurito le chiamate AI per questo mese. Upgrada il piano per continuare.",
      }]);
      return;
    }

    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setLoading(true);

    incrementUsage();
    const result = await askCoFounder(t, buildContext());
    setLoading(false);

    if (result.ok) {
      setMsgs((m) => [...m, { role: "ai", text: result.text }]);
    } else {
      setMsgs((m) => [...m, { role: "ai", text: result.error }]);
    }
  };

  const suggestions = [
    "Cosa devo fare oggi?",
    "Il mio MVP è troppo grande?",
    "Come posso validare questa idea?",
    "Come posso ridurre i costi?",
    "Genera un pitch breve",
    "Migliora la roadmap",
  ];

  const usagePct = usage.limit < 999999 ? Math.round((usage.used / usage.limit) * 100) : 0;
  const usageWarning = usage.limit < 999999 && usage.remaining <= Math.ceil(usage.limit * 0.2);
  const usageExhausted = !usage.allowed;

  return (
    <div className="mx-auto flex h-[calc(100vh-160px)] max-w-4xl flex-col space-y-4">
      {showSupport && (
        <SupportModal
          onClose={() => setShowSupport(false)}
          userEmail={user?.email ?? ""}
        />
      )}
      <PageHeader
        title="Co-founder AI"
        subtitle={proj ? `Conosce: ${proj.name} · ${proj.onboarding.stage}` : "Crea prima un progetto."}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSupport(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            >
              <HeadphonesIcon className="h-3.5 w-3.5" /> Contatta supporto
            </button>
            {usageExhausted ? (
              <Pill tone="warn"><AlertTriangle className="h-3 w-3" /> Limite raggiunto</Pill>
            ) : (
              <Pill tone="brand"><Sparkles className="h-3 w-3" /> {usage.remaining} rimaste</Pill>
            )}
          </div>
        }
      />

      {/* Usage bar (only for metered plans) */}
      {usage.limit < 999999 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Chiamate AI usate</span>
              <span className={usageExhausted ? "text-destructive" : usageWarning ? "text-amber-500" : ""}>
                {usage.used} / {usage.limit}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${usageExhausted ? "bg-destructive" : usageWarning ? "bg-amber-500" : "bg-brand"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
          {(usageWarning || usageExhausted) && (
            <a
              href="/app/plan"
              className={`shrink-0 text-[11.5px] font-medium hover:underline ${usageExhausted ? "text-destructive" : "text-amber-500"}`}
            >
              Upgrade
            </a>
          )}
        </div>
      )}

      <Card className="flex flex-1 flex-col">
        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "ai" && <LogoMark size={22} className="mt-1 text-brand" />}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${m.role === "user" ? "bg-foreground text-background" : "border border-border bg-surface"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <LogoMark size={22} className="mt-1 text-brand" />
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sto pensando…
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading || usageExhausted}
              className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground hover:border-brand hover:text-foreground disabled:opacity-40"
            >
              <Wand2 className="mr-1 inline h-3 w-3" /> {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && send()}
            placeholder={usageExhausted ? "Limite chiamate raggiunto — upgrada il piano" : "Chiedi al tuo co-founder…"}
            disabled={usageExhausted}
            className="flex-1 bg-transparent px-2 text-[14px] outline-none disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading || usageExhausted}
            className="rounded-lg bg-foreground p-2 text-background hover:opacity-90 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
      </Card>
    </div>
  );
}
