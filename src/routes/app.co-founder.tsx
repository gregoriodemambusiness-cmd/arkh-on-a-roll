import { useState } from "react";
import { Sparkles, Send, Wand2, HeadphonesIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Card, PageHeader, Pill } from "@/components/app/ui";
import { useProject, analyzeBudget, computeHealth, formatEuro, type Project } from "@/lib/projectStore";
import { useUser } from "@/lib/mockAuth";
import { createSupportTicket } from "@/lib/notion";

export default CoFounder;

type Msg = { role: "user" | "ai"; text: string };

// Hook to plug a real AI later. For now: contextual local logic.
function replyFor(question: string, p: Project): string {
  const q = question.toLowerCase();
  const todo = p.tasks.filter((t) => t.status !== "Completato");
  const next = todo[0];
  const b = analyzeBudget(p);
  const { score } = computeHealth(p);

  if (q.includes("oggi") || q.includes("cosa devo")) {
    return next
      ? `Oggi concentrati su: "${next.title}" (${next.duration}). Perché: ${next.why} Output atteso: ${next.output}.`
      : "Hai completato tutti i task pianificati. Passa alla fase 60 giorni: scegli 3 funzioni essenziali della beta privata.";
  }
  if (q.includes("mvp") && (q.includes("grande") || q.includes("troppo"))) {
    return p.mvpEssential.length > 3
      ? `Sì, l'MVP rischia di essere troppo grande. Riduci a 3 funzioni: ${p.mvpEssential.slice(0, 3).join(", ")}. Sposta il resto a "da rimandare".`
      : `Il tuo MVP è già focalizzato su 3 funzioni: ${p.mvpEssential.join(", ")}. Resta su queste e valida prima di aggiungere.`;
  }
  if (q.includes("validar") || q.includes("validazione")) {
    return `Per validare "${p.onelinePitch}": 1) identifica 20 persone del target (${p.onboarding.target}), 2) 5 domande aperte sul problema, 3) cerca pattern ricorrenti, 4) pubblica una landing waitlist e misura conversione.`;
  }
  if (q.includes("cost") || q.includes("budget") || q.includes("ridurre")) {
    return `Budget disponibile ${formatEuro(b.available)} vs MVP stimato ${formatEuro(b.estimated)} — rischio ${b.risk}. ${b.recommendation}`;
  }
  if (q.includes("pitch")) {
    return `Pitch breve: "${p.name} aiuta ${p.onboarding.target} a ${p.blueprint.valueProp.toLowerCase()}". Modello: ${p.blueprint.businessModel}`;
  }
  if (q.includes("roadmap") || q.includes("migliora")) {
    return `Roadmap: 30gg validazione (interviste + landing), 60gg MVP (${p.mvpEssential.join(", ")}), 90gg lancio. Concentrati sul 30gg prima di pensare al 60.`;
  }
  if (q.includes("competitor")) {
    return `Per ${p.onboarding.sector}: cerca 3 player diretti, 3 indiretti e 3 alternative non-software. Analizza prezzo, target e proposta in 1 tabella.`;
  }
  return `Capito. Considera lo stato attuale: health score ${score}/100, ${todo.length} task da completare, fase "${p.onboarding.stage}". La prossima azione concreta: ${next?.title || "pianifica la fase successiva"}.`;
}

function SupportModal({ onClose, userEmail }: { onClose: () => void; userEmail: string }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setStatus("loading");
    try {
      await createSupportTicket({
        title: title.trim(),
        email: userEmail,
        message: message.trim(),
        category: "domanda",
        priority: "media",
      });
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
  const [showSupport, setShowSupport] = useState(false);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || !proj) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: replyFor(t, proj) }]);
    }, 500);
  };

  const suggestions = [
    "Cosa devo fare oggi?",
    "Il mio MVP è troppo grande?",
    "Come posso validare questa idea?",
    "Come posso ridurre i costi?",
    "Genera un pitch breve",
    "Migliora la roadmap",
  ];

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
            <Pill tone="brand"><Sparkles className="h-3 w-3" /> Online</Pill>
          </div>
        }
      />

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
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground hover:border-brand hover:text-foreground">
              <Wand2 className="mr-1 inline h-3 w-3" /> {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Chiedi al tuo co-founder…"
            className="flex-1 bg-transparent px-2 text-[14px] outline-none"
          />
          <button onClick={() => send()} className="rounded-lg bg-foreground p-2 text-background hover:opacity-90">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
