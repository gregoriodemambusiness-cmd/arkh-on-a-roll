"use client";
import { useState, useRef, useEffect } from "react";
import {
  RotateCcw, Sparkles, Loader2, AlertTriangle, Zap,
  Plus, ArrowUp, Paperclip, Globe, BarChart2, Layout, Plug, Presentation,
} from "lucide-react";
import { useProject, computeHealth, analyzeBudget, formatEuro } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";
import { cn } from "@/lib/utils";
import { ContextualPreview } from "@/components/app/ContextualPreview";

type Msg = { role: "user" | "ai"; text: string };

const PLUS_ITEMS = [
  { icon: Paperclip, label: "Allega file", action: "file" },
  { icon: Globe, label: "Cerca nel web", action: "web" },
  { icon: BarChart2, label: "Analizza il mio progetto", action: "analyze" },
  { icon: Layout, label: "Crea MVP Canvas", action: "canvas" },
  { icon: Plug, label: "Connetti integrazione", action: "integrations" },
  { icon: Presentation, label: "Genera pitch", action: "pitch" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-brand"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function PlusMenu({
  onClose,
  onAction,
}: {
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-plus-menu]")) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      data-plus-menu
      className="mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-elegant"
    >
      {PLUS_ITEMS.map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          onClick={() => { onAction(action); onClose(); }}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-[13px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function CoFounder() {
  const proj = useProject();
  const user = useUser();
  const plan = user?.plan ?? "free";
  const usage = checkUsageLimit(plan);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!proj || initialized.current) return;
    initialized.current = true;
    const key = `pilot-chat-${proj.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Msg[];
        if (parsed.length > 0) { setMsgs(parsed); return; }
      } catch {}
    }
    const { score } = computeHealth(proj);
    setMsgs([{
      role: "ai",
      text: `Benvenuto in Pilot. Sono il tuo Co-founder AI. Conosco il tuo progetto ${proj.name}. Sei in fase ${proj.onboarding.stage} con health score ${score}/100. Da dove vuoi iniziare?`,
    }]);
  }, [proj]);

  useEffect(() => {
    if (!proj || !initialized.current || msgs.length === 0) return;
    localStorage.setItem(`pilot-chat-${proj.id}`, JSON.stringify(msgs));
  }, [msgs, proj]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const buildContext = () => {
    if (!proj) return "";
    const { score } = computeHealth(proj);
    const b = analyzeBudget(proj);
    const todo = proj.tasks.filter((t) => t.status !== "Completato");
    const interviews = proj.validation?.interviews?.length ?? 0;
    const mrr = (proj.businessModel?.arpu ?? 0) * (proj.validation?.interviews?.length ?? 0);
    return [
      `Nome: ${proj.name}`,
      `Descrizione: ${proj.onelinePitch}`,
      `Fase: ${proj.onboarding.stage}`,
      `Budget disponibile: ${formatEuro(proj.budgetAvailable)}`,
      `Health Score: ${score}/100`,
      `Problema: ${proj.blueprint?.problem}`,
      `Soluzione: ${proj.blueprint?.solution}`,
      `Target: ${proj.blueprint?.target}`,
      `Task aperti: ${todo.length}${todo[0] ? ` (prossimo: ${todo[0].title})` : ""}`,
      `Interviste validazione: ${interviews}`,
      `Budget differenza: ${b.delta >= 0 ? "+" : ""}${formatEuro(b.delta)}, rischio: ${b.risk}`,
      mrr > 0 ? `MRR stimato: ${formatEuro(mrr)}` : null,
    ].filter(Boolean).join("\n");
  };

  const clearChat = () => {
    if (!proj) return;
    localStorage.removeItem(`pilot-chat-${proj.id}`);
    const { score } = computeHealth(proj);
    setMsgs([{
      role: "ai",
      text: `Benvenuto in Pilot. Sono il tuo Co-founder AI. Conosco il tuo progetto ${proj.name}. Sei in fase ${proj.onboarding.stage} con health score ${score}/100. Da dove vuoi iniziare?`,
    }]);
  };

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || loading) return;

    const fresh = checkUsageLimit(plan);
    if (!fresh.allowed) {
      setMsgs((m) => [...m, { role: "ai", text: "Hai esaurito le chiamate AI per questo mese. Upgrada il piano per continuare." }]);
      return;
    }

    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setLoading(true);
    incrementUsage();

    const result = await askCoFounder(t, buildContext());
    setLoading(false);
    setMsgs((m) => [...m, {
      role: "ai",
      text: result.ok ? result.text : `Non riesco a rispondere adesso. ${result.error}`,
    }]);
  };

  const handlePlusAction = (action: string) => {
    switch (action) {
      case "file":
        fileInputRef.current?.click();
        break;
      case "web":
        setInput("[WEBSEARCH] ");
        textareaRef.current?.focus();
        break;
      case "analyze":
        send("Fai una analisi completa del mio progetto con punti di forza, criticita e piano d'azione dettagliato");
        break;
      case "canvas":
        send("Aiutami a costruire il mio MVP Canvas passo per passo");
        break;
      case "integrations":
        window.location.href = "/app/integrations";
        break;
      case "pitch":
        send("Genera un pitch completo del mio progetto per investitori");
        break;
    }
  };

  const usageExhausted = !usage.allowed;
  const usageWarning = usage.limit < 999999 && usage.remaining <= Math.ceil(usage.limit * 0.2);
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";
  const canSend = !loading && !usageExhausted && !!input.trim();

  return (
    <div
      className="-mx-4 -mt-6 -mb-28 flex flex-col overflow-hidden md:-mx-8 md:-mb-12"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Co-founder AI</div>
            {proj && (
              <div className="text-[11.5px] text-muted-foreground">
                {proj.name} · {proj.onboarding.stage}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {usageExhausted ? (
            <span className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11.5px] font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" /> Limite raggiunto
            </span>
          ) : usage.limit < 999999 ? (
            <span className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
              usageWarning
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-brand/30 bg-brand/10 text-brand",
            )}>
              <Zap className="h-3 w-3" /> {usage.remaining} rimaste
            </span>
          ) : null}
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Nuova chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {msgs.map((m, i) => (
            <div key={i}>
              <div className={cn("flex items-end gap-2.5", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {m.role === "ai" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
                    P
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                    {initials}
                  </div>
                )}
                <div
                  className={cn("max-w-[75%] px-4 py-3 text-[14px] leading-relaxed", m.role === "ai" && "bg-card")}
                  style={{
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    backgroundColor: m.role === "user" ? "#7B2FFF" : undefined,
                    color: m.role === "user" ? "#fff" : undefined,
                    border: m.role === "ai" ? "1px solid rgba(123,47,255,0.2)" : "none",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              </div>
              {m.role === "ai" && i > 0 && msgs[i - 1]?.role === "user" && (
                <ContextualPreview userMessage={msgs[i - 1].text} />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
                P
              </div>
              <div
                className="bg-card px-4 py-3"
                style={{ borderRadius: "18px 18px 18px 4px", border: "1px solid rgba(123,47,255,0.2)" }}
              >
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/20 bg-background/95 px-4 py-3 backdrop-blur-sm md:px-6">
        <div className="mx-auto max-w-3xl" data-plus-menu>
          {menuOpen && (
            <PlusMenu onClose={() => setMenuOpen(false)} onAction={handlePlusAction} />
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface px-2.5 py-2 transition focus-within:border-brand/60">
            {/* Plus button */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface text-muted-foreground transition hover:border-brand/40 hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={
                usageExhausted
                  ? "Limite chiamate raggiunto — upgrada il piano"
                  : "Scrivi un messaggio..."
              }
              disabled={usageExhausted}
              rows={1}
              className="flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
              style={{ maxHeight: "200px" }}
            />

            {/* Send button */}
            <button
              onClick={() => send()}
              disabled={!canSend}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition active:scale-95 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canSend ? "#7B2FFF" : undefined,
              }}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                : <ArrowUp className={cn("h-4 w-4", canSend ? "text-white" : "text-muted-foreground/40")} />
              }
            </button>
          </div>
        </div>
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" className="hidden" />
      </div>
    </div>
  );
}
