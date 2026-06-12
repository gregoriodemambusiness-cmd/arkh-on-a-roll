"use client";
import { useState } from "react";
import { ShieldCheck, MessageCircle, Users, TrendingUp, Plus, Trash2, X } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar, Button } from "@/components/app/ui";
import { useProject, updateProject, type Interview, type Sentiment } from "@/lib/projectStore";

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positivo: "rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500",
  neutro:   "rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500",
  negativo: "rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-500",
};

const TARGET = 20;

export default function Validation() {
  const project = useProject();
  const [showModal, setShowModal] = useState(false);
  const [waitlistInput, setWaitlistInput] = useState("");
  const [form, setForm] = useState<Omit<Interview, "id">>({
    name: "",
    date: new Date().toISOString().split("T")[0],
    insight: "",
    sentiment: "positivo",
  });

  const interviews: Interview[] = project?.validation?.interviews ?? [];
  const waitlist: string[] = project?.validation?.waitlist ?? [];

  const positiveCount = interviews.filter((i) => i.sentiment === "positivo").length;
  const conversionRate = interviews.length > 0
    ? Math.round((positiveCount / interviews.length) * 100)
    : 0;

  const save = (nextInterviews: Interview[], nextWaitlist: string[]) => {
    updateProject((p) => ({
      ...p,
      validation: { interviews: nextInterviews, waitlist: nextWaitlist },
    }));
  };

  const addInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.insight.trim()) return;
    const next = [...interviews, { ...form, id: crypto.randomUUID() }];
    save(next, waitlist);
    setForm({ name: "", date: new Date().toISOString().split("T")[0], insight: "", sentiment: "positivo" });
    setShowModal(false);
  };

  const removeInterview = (id: string) => save(interviews.filter((i) => i.id !== id), waitlist);

  const addWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    const email = waitlistInput.trim().toLowerCase();
    if (!email || waitlist.includes(email)) return;
    save(interviews, [...waitlist, email]);
    setWaitlistInput("");
  };

  const removeWaitlist = (email: string) => save(interviews, waitlist.filter((e) => e !== email));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Validation"
        subtitle="Misura interesse, problem-fit e willingness to pay prima di costruire."
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Aggiungi intervista
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Interviste" icon={MessageCircle} action={<Pill tone="brand">{interviews.length} / {TARGET}</Pill>} />
          <ProgressBar value={Math.round((interviews.length / TARGET) * 100)} />
        </Card>
        <Card>
          <CardHeader title="Waitlist" icon={Users} action={<Pill tone="brand">{waitlist.length}</Pill>} />
          <ProgressBar value={Math.min(100, (waitlist.length / 50) * 100)} />
        </Card>
        <Card>
          <CardHeader title="Sentiment positivo" icon={TrendingUp} action={<Pill tone={conversionRate > 50 ? "ok" : "warn"}>{conversionRate}%</Pill>} />
          <ProgressBar value={conversionRate} />
        </Card>
      </div>

      {/* Interview modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Aggiungi intervista</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={addInterview} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Nome intervistato</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Mario Rossi"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Data</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Insight chiave</span>
                <textarea
                  value={form.insight}
                  onChange={(e) => setForm({ ...form, insight: e.target.value })}
                  required
                  rows={3}
                  placeholder="Cosa ha detto di più importante…"
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Sentiment</span>
                <select
                  value={form.sentiment}
                  onChange={(e) => setForm({ ...form, sentiment: e.target.value as Sentiment })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                >
                  <option value="positivo">Positivo</option>
                  <option value="neutro">Neutro</option>
                  <option value="negativo">Negativo</option>
                </select>
              </label>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1">Salva intervista</Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interviews list */}
      <Card>
        <CardHeader
          title="Interviste svolte"
          icon={ShieldCheck}
          subtitle={`${interviews.length} interviste registrate`}
        />
        {interviews.length === 0 ? (
          <p className="text-[13.5px] text-muted-foreground">
            Nessuna intervista ancora. Aggiungi la prima per tracciare il feedback.
          </p>
        ) : (
          <div className="space-y-2">
            {interviews.map((i) => (
              <div key={i.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13.5px] font-medium">
                    {i.name}
                    <span className="text-[11px] text-muted-foreground">{i.date}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">{i.insight}</p>
                </div>
                <span className={SENTIMENT_COLORS[i.sentiment]}>{i.sentiment}</span>
                <button
                  onClick={() => removeInterview(i.id)}
                  className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Waitlist */}
      <Card>
        <CardHeader title="Waitlist" icon={Users} subtitle={`${waitlist.length} iscritti`} />
        <form onSubmit={addWaitlist} className="mb-3 flex gap-2">
          <input
            type="email"
            value={waitlistInput}
            onChange={(e) => setWaitlistInput(e.target.value)}
            placeholder="email@startup.com"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
          />
          <Button type="submit"><Plus className="h-3.5 w-3.5" /> Aggiungi</Button>
        </form>
        {waitlist.length > 0 && (
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {waitlist.map((email) => (
              <div key={email} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2 text-[13px]">
                <span>{email}</span>
                <button onClick={() => removeWaitlist(email)} className="text-muted-foreground/40 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
