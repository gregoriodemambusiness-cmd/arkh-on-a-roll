import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, Wand2 } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Card, PageHeader, Pill } from "@/components/app/ui";

export const Route = createFileRoute("/app/co-founder")({
  head: () => ({ meta: [{ title: "Co-founder AI — ARKHEON AI" }] }),
  component: CoFounder,
});

type Msg = { role: "user" | "ai"; text: string };

function CoFounder() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Ciao 👋 Sono il tuo Co-founder AI. Conosco il tuo progetto. Da dove vuoi iniziare oggi?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      const reply =
        t.length < 20
          ? "Fammi un esempio concreto. Più dettagli mi dai, meglio ti aiuto."
          : "Ottimo. Ti suggerisco di partire da 3 azioni: 1) identifica 20 persone del tuo target, 2) preparale 5 domande sul problema, 3) raccogli i pattern.";
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    }, 600);
  };

  const suggestions = ["Crea 5 domande per le interviste","Stima il costo del mio MVP","Trova 3 competitor diretti","Scrivi un one-line pitch"];

  return (
    <div className="mx-auto flex h-[calc(100vh-160px)] max-w-4xl flex-col space-y-4">
      <PageHeader title="Co-founder AI" subtitle="Chat contestuale che conosce il tuo progetto."
        action={<Pill tone="brand"><Sparkles className="h-3 w-3" /> Online</Pill>} />

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
