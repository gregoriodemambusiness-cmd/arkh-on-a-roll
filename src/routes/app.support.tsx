"use client";
import { useState } from "react";
import { LifeBuoy, Sparkles, Send, Search, Check, Loader2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { useUser } from "@/lib/mockAuth";
import { submitSupportTicket } from "@/lib/notion.functions";

const FAQS = [
  { q: "Come funziona la capacità mensile inclusa?", a: "Ogni piano include un utilizzo equo pensato per la tua fase. Se cresci, ti proponiamo il piano più adatto." },
  { q: "Posso usare PILOT AI con il mio team?", a: "Sì, dai piani Founder ed Enterprise hai workspace e ruoli condivisi." },
  { q: "Come esporto il mio progetto?", a: "Da Settings → Data & Export oppure dal singolo modulo (Blueprint, Pitch, Task)." },
  { q: "Come cambio piano?", a: "Da Plan & Usage → 'Cambia piano'. L'upgrade è immediato; il downgrade parte al ciclo successivo." },
  { q: "Come funziona il Budget Guard?", a: "Monitora in tempo reale il budget del tuo MVP rispetto alle spese stimate e ti avvisa se sei fuori range." },
  { q: "Posso cancellare il mio account?", a: "Sì, da Settings → Security → Elimina account. L'operazione è irreversibile." },
];

const AI_RESPONSES: { keywords: string[]; reply: string }[] = [
  { keywords: ["pian", "upgrade", "downgrade", "abbonament", "starter", "pro"], reply: "Per cambiare piano vai su Plan & Usage → 'Cambia piano'. L'upgrade è immediato; il downgrade parte al prossimo ciclo di fatturazione." },
  { keywords: ["password", "accesso", "login", "entrar", "autenticaz"], reply: "Se non riesci ad accedere, vai su /login e usa 'Password dimenticata'. Per cambiare password vai Settings → Security." },
  { keywords: ["export", "esport", "scarica", "download", "json", "csv"], reply: "Puoi esportare il tuo progetto da Settings → Data & Export. Trovi JSON (tutto il progetto) e CSV (task)." },
  { keywords: ["budget", "guard", "spese", "cassa", "runway"], reply: "Budget Guard legge le spese del tuo MVP e le confronta con il budget disponibile. Aggiornalo in Finance → Aggiungi movimento." },
  { keywords: ["team", "membro", "invit", "collabor"], reply: "Invita i tuoi collaboratori da Team → Invita membro. Puoi assegnare ruoli: co-founder, developer, marketer, investor." },
  { keywords: ["referral", "sconto", "amico", "condivid"], reply: "Dal menu Referral trovi il tuo link personale. Invitando amici ottieni sconti permanenti fino al 40%." },
  { keywords: ["onboarding", "inizia", "start", "progett"], reply: "Vai su /onboarding per creare il tuo primo progetto. Puoi anche creare nuovi progetti dalla sidebar laterale." },
  { keywords: ["pitch", "investor", "deck", "presentaz"], reply: "La Pitch Room genera automaticamente pitch, slide e email investor dai dati del tuo Blueprint. Compilalo prima per risultati migliori." },
];

const DEFAULT_REPLY = "Non ho trovato una risposta specifica. Contatta il nostro supporto su support@pilotai.co o apri un ticket qui a fianco.";

function getAIReply(q: string): string {
  const lower = q.toLowerCase();
  for (const entry of AI_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry.reply;
  }
  return DEFAULT_REPLY;
}

type Message = { role: "user" | "ai"; text: string };

export default function Support() {
  const user = useUser();
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Ciao! Come posso aiutarti oggi?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const [ticketCategory, setTicketCategory] = useState("Bug");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Normale");
  const [ticketStatus, setTicketStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = chatInput.trim();
    if (!q) return;
    const reply = getAIReply(q);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: reply }]);
    setChatInput("");
  };

  const sendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketStatus("loading");
    const result = await submitSupportTicket({
      title: ticketSubject,
      email: user?.email ?? "unknown@pilotai.co",
      message: ticketMessage,
      category: ticketCategory,
      priority: ticketPriority,
    });
    setTicketStatus(result.ok ? "ok" : "err");
    if (result.ok) {
      setTicketSubject("");
      setTicketMessage("");
    }
  };

  const filteredFaqs = FAQS.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Support" subtitle="Help Center, guide, ticket e Support AI." />

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca nel Help Center…"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Support AI */}
        <Card className="flex flex-col">
          <CardHeader title="Support AI" icon={Sparkles} subtitle="Risponde su uso della piattaforma." action={<Pill tone="brand">Online</Pill>} />
          <div className="flex-1 space-y-2 overflow-y-auto max-h-64 text-[13.5px] pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 ${
                  m.role === "user"
                    ? "ml-8 bg-muted text-right"
                    : "mr-8 border border-brand/30 bg-brand/5"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={sendMessage}
            className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface p-2"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-transparent px-2 text-[14px] outline-none"
              placeholder="Chiedi al Support AI…"
            />
            <Button type="submit"><Send className="h-3 w-3" /></Button>
          </form>
        </Card>

        {/* Ticket form */}
        <Card>
          <CardHeader title="Apri ticket" icon={LifeBuoy} />
          {ticketStatus === "ok" ? (
            <div className="flex flex-col items-center gap-2 py-6 text-brand">
              <Check className="h-8 w-8" />
              <p className="text-[14px] font-medium">Ticket inviato!</p>
              <p className="text-[12.5px] text-muted-foreground">Ti risponderemo entro 24-48 ore.</p>
              <Button variant="secondary" onClick={() => setTicketStatus("idle")}>Nuovo ticket</Button>
            </div>
          ) : (
            <form onSubmit={sendTicket} className="space-y-2">
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[14px] outline-none focus:border-brand"
              >
                {["Account", "Pagamenti", "Bug", "Feature request", "Altro"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[14px] outline-none focus:border-brand"
                placeholder="Oggetto"
              />
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                required
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-[14px] outline-none focus:border-brand"
                placeholder="Descrivi il problema…"
              />
              {ticketStatus === "err" && (
                <p className="text-[12.5px] text-destructive">Errore nell'invio. Riprova o scrivi a support@pilotai.co.</p>
              )}
              <div className="flex items-center justify-between">
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-brand"
                >
                  <option>Normale</option><option>Alta</option><option>Bassa</option>
                </select>
                <Button type="submit" disabled={ticketStatus === "loading"}>
                  {ticketStatus === "loading"
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Invio…</>
                    : "Invia richiesta"
                  }
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader title="FAQ" subtitle={search ? `${filteredFaqs.length} risultati per "${search}"` : undefined} />
        {filteredFaqs.length === 0 ? (
          <p className="text-[13.5px] text-muted-foreground">Nessuna FAQ trovata per "{search}".</p>
        ) : (
          <div className="divide-y divide-border">
            {filteredFaqs.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="flex cursor-pointer items-center justify-between text-[14px] font-medium">
                  {f.q}
                  <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[13.5px] text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        )}
      </Card>

      {/* Support levels */}
      <Card>
        <CardHeader title="Livello di supporto per piano" />
        <ul className="grid gap-2 text-[13px] md:grid-cols-2">
          {[
            ["Free", "Help Center + FAQ"],
            ["Starter", "Email standard"],
            ["Pro", "Supporto prioritario"],
            ["Founder", "Supporto avanzato"],
            ["Enterprise", "Dedicato + onboarding + SLA"],
          ].map(([k, v]) => (
            <li key={k} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2">
              <span className="font-medium">{k}</span>
              <span className="text-muted-foreground">{v}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="text-[14px] font-semibold">Hai bisogno di un'automazione su misura?</div>
            <div className="text-[13px] text-muted-foreground">Scopri PILOT Studio: analisi processi, app, dashboard e AI agent costruiti dal nostro team.</div>
          </div>
          <a href="/studio" target="_blank" rel="noreferrer" className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-accent">
            Scopri Studio
          </a>
        </div>
      </div>
    </div>
  );
}
