import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, Wand2 } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Card, PageHeader, Pill } from "@/components/app/ui";
import { useProject, analyzeBudget, computeHealth, formatEuro, type Project } from "@/lib/projectStore";

export const Route = createFileRoute("/app/co-founder")({
  head: () => ({ meta: [{ title: "Co-founder AI — ARKHEON AI" }] }),
  component: CoFounder,
});

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

function CoFounder() {
  const proj = useProject();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Ciao 👋 Sono il tuo Co-founder AI. Conosco il tuo progetto. Da dove vuoi iniziare oggi?" },
  ]);
  const [input, setInput] = useState("");

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
      <PageHeader
        title="Co-founder AI"
        subtitle={proj ? `Conosce: ${proj.name} · ${proj.onboarding.stage}` : "Crea prima un progetto."}
        action={<Pill tone="brand"><Sparkles className="h-3 w-3" /> Online</Pill>}
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
