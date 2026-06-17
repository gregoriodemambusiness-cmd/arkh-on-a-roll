"use client";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Loader2, AlertTriangle, Zap,
  Plus, ArrowUp, Paperclip, Globe, BarChart2, Layout, Plug, Presentation,
  MoreHorizontal, CheckCircle2, ListTodo,
} from "lucide-react";
import { useProject, computeHealth, analyzeBudget, formatEuro } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { askCoFounder } from "@/lib/claude.functions";
import { checkUsageLimit, incrementUsage } from "@/lib/claudeAI";
import { cn } from "@/lib/utils";
import { ContextualPreview } from "@/components/app/ContextualPreview";

type Msg = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "Valida la mia idea",
  "Stima il budget MVP",
  "Trova il mio target",
];

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

function PlusMenu({ onClose, onAction }: { onClose: () => void; onAction: (a: string) => void }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-plus-menu]")) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div data-plus-menu className="mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
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

function hasPlanStructure(text: string): boolean {
  return /\d+[\.\)]\s+.+[€$£]?\s*\d/.test(text) || /€\s*\d/.test(text);
}

function PlanCard({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => /^\s*\d+[\.\)]\s/.test(l));
  if (lines.length < 2) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border bg-surface/80">
      {lines.map((line, i) => {
        const clean = line.replace(/^\s*\d+[\.\)]\s*/, "");
        const euroMatch = clean.match(/€\s*[\d.,]+/);
        const euro = euroMatch ? euroMatch[0] : null;
        const title = euro ? clean.replace(euro, "").replace(/[-–—]\s*$/, "").trim() : clean;
        return (
          <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">
              {i + 1}
            </span>
            <span className="flex-1 text-[13px]">{title}</span>
            {euro && <span className="text-[13px] font-semibold text-muted-foreground">{euro}</span>}
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({ msg, isLast, onAddToTasks }: { msg: Msg; isLast: boolean; onAddToTasks: () => void; initials: string }) {
  const isPlan = msg.role === "ai" && hasPlanStructure(msg.text);
  const preamble = isPlan
    ? msg.text.split("\n").find((l) => !/^\s*\d+[\.\)]\s/.test(l) && l.trim()) || msg.text
    : msg.text;

  return (
    <div>
      <div className={cn("flex items-end gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
        {msg.role === "ai" ? (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        ) : null}
        <div
          className={cn("max-w-[78%] px-4 py-3 text-[14px] leading-relaxed", msg.role === "ai" && "bg-card")}
          style={{
            borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            backgroundColor: msg.role === "user" ? "#7B2FFF" : undefined,
            color: msg.role === "user" ? "#fff" : undefined,
            border: msg.role === "ai" ? "1px solid rgba(123,47,255,0.15)" : "none",
            whiteSpace: "pre-wrap",
          }}
        >
          {isPlan ? preamble : msg.text}
          {isPlan && <PlanCard text={msg.text} />}
        </div>
      </div>

      {msg.role === "ai" && isPlan && isLast && (
        <div className="ml-10 mt-2 flex gap-2">
          <button
            onClick={onAddToTasks}
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[12.5px] font-medium text-background hover:opacity-90"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Aggiungi a Task Center
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground">
            <ListTodo className="h-3.5 w-3.5" /> Modifica piano
          </button>
        </div>
      )}
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
      text: `Ciao! Sono il tuo co-fondatore AI. Ho letto il tuo progetto "${proj.name}". La cosa piu urgente ora e validare il problema con utenti reali prima di scrivere codice. Vuoi che prepari uno script di intervista?`,
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
    initialized.current = false;
    setMsgs([{
      role: "ai",
      text: `Ciao! Sono il tuo co-fondatore AI. Ho letto il tuo progetto "${proj.name}". Sei in fase ${proj.onboarding.stage} con health score ${score}/100. Da dove vuoi iniziare?`,
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
      case "file": fileInputRef.current?.click(); break;
      case "web": setInput("[WEBSEARCH] "); textareaRef.current?.focus(); break;
      case "analyze": send("Fai una analisi completa del mio progetto con punti di forza, criticita e piano d'azione dettagliato"); break;
      case "canvas": send("Aiutami a costruire il mio MVP Canvas passo per passo"); break;
      case "integrations": window.location.href = "/app/integrations"; break;
      case "pitch": send("Genera un pitch completo del mio progetto per investitori"); break;
    }
  };

  const handleAddToTasks = () => {
    send("Aggiungi questi task al mio Task Center e conferma quali hai salvato.");
  };

  const usageExhausted = !usage.allowed;
  const usageWarning = usage.limit < 999999 && usage.remaining <= Math.ceil(usage.limit * 0.2);
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";
  const canSend = !loading && !usageExhausted && !!input.trim();
  const showSuggestions = !loading && msgs.length > 0 && msgs[msgs.length - 1].role === "ai";

  return (
    <div
      className="-mx-4 -mt-6 -mb-28 flex flex-col overflow-hidden md:-mx-8 md:-mb-12"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand shadow-sm">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Co-founder AI</div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-success">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Online · pensa come un co-fondatore
            </div>
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
              <Zap className="h-3 w-3" /> {usage.remaining} crediti rimasti
            </span>
          ) : null}
          <button
            onClick={clearChat}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground"
            title="Nuova chat"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {msgs.map((m, i) => {
            const isLast = i === msgs.length - 1;
            return m.role === "ai" ? (
              <MessageBubble
                key={i}
                msg={m}
                isLast={isLast}
                onAddToTasks={handleAddToTasks}
                initials={initials}
              />
            ) : (
              <div key={i} className="flex flex-row-reverse items-end gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {initials}
                </div>
                <div
                  className="max-w-[78%] px-4 py-3 text-[14px] leading-relaxed"
                  style={{
                    borderRadius: "18px 18px 4px 18px",
                    backgroundColor: "#7B2FFF",
                    color: "#fff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div
                className="bg-card px-4 py-3"
                style={{ borderRadius: "18px 18px 18px 4px", border: "1px solid rgba(123,47,255,0.15)" }}
              >
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/20 bg-background/95 px-4 pb-4 pt-3 backdrop-blur-sm md:px-6">
        <div className="mx-auto max-w-3xl" data-plus-menu>
          {menuOpen && <PlusMenu onClose={() => setMenuOpen(false)} onAction={handlePlusAction} />}

          {/* Suggestion pills */}
          {showSuggestions && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground hover:border-brand/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface px-2.5 py-2 transition focus-within:border-brand/60">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface text-muted-foreground transition hover:border-brand/40 hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={usageExhausted ? "Limite chiamate raggiunto — upgrada il piano" : "Chiedi qualcosa al tuo co-fondatore..."}
              disabled={usageExhausted}
              rows={1}
              className="flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
              style={{ maxHeight: "200px" }}
            />

            <button
              onClick={() => send()}
              disabled={!canSend}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-95 disabled:cursor-not-allowed"
              style={{ backgroundColor: canSend ? "#7B2FFF" : undefined }}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                : <ArrowUp className={cn("h-4 w-4", canSend ? "text-white" : "text-muted-foreground/40")} />
              }
            </button>
          </div>

          <p className="mt-2 text-center text-[11.5px] text-muted-foreground/60">
            Ogni messaggio consuma 1 credito Co-founder AI ·{" "}
            <a href="/app/plan" className="hover:text-brand">Aumenta i crediti</a>
          </p>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" />
      </div>
    </div>
  );
}
