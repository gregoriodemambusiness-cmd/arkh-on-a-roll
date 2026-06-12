"use client";
import { useState } from "react";
import { Receipt, TrendingUp, TrendingDown, Wallet, Clock, Plus, Trash2, X, RefreshCw } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { useProject, updateProject, type Transaction } from "@/lib/projectStore";

const CATEGORIES_ENTRATA = ["MRR", "Vendita", "Consulenza", "Grant", "Investimento", "Altro"];
const CATEGORIES_USCITA = ["Infrastruttura", "Marketing", "Software", "Personale", "Legale", "Altro"];

function fmtEur(n: number) {
  return `€ ${n.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function Finance() {
  const project = useProject();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Transaction, "id">>({
    type: "uscita",
    amount: 0,
    category: "Infrastruttura",
    description: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
  });

  const transactions: Transaction[] = project?.finance?.transactions ?? [];

  const totalEntrate = transactions.filter((t) => t.type === "entrata").reduce((s, t) => s + t.amount, 0);
  const totalUscite = transactions.filter((t) => t.type === "uscita").reduce((s, t) => s + t.amount, 0);
  const cassa = totalEntrate - totalUscite;

  const mrr = transactions
    .filter((t) => t.type === "entrata" && t.recurring)
    .reduce((s, t) => s + t.amount, 0);

  const speseMensili = transactions
    .filter((t) => t.type === "uscita" && t.recurring)
    .reduce((s, t) => s + t.amount, 0);

  const runway = speseMensili > 0 ? Math.floor(cassa / speseMensili) : null;

  const save = (next: Transaction[]) => {
    updateProject((p) => ({ ...p, finance: { transactions: next } }));
  };

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0) return;
    save([{ ...form, id: crypto.randomUUID() }, ...transactions]);
    setForm({
      type: "uscita",
      amount: 0,
      category: "Infrastruttura",
      description: "",
      date: new Date().toISOString().split("T")[0],
      recurring: false,
    });
    setShowModal(false);
  };

  const remove = (id: string) => save(transactions.filter((t) => t.id !== id));

  const categories = form.type === "entrata" ? CATEGORIES_ENTRATA : CATEGORIES_USCITA;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Finance"
        subtitle="Entrate, uscite, runway e proiezioni."
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Aggiungi movimento
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> MRR
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">{fmtEur(mrr)}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-red-500" /> Spese ricorrenti
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">{fmtEur(speseMensili)}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-3.5 w-3.5 text-brand" /> Cassa
          </div>
          <div className={`mt-1 font-display text-2xl font-semibold ${cassa < 0 ? "text-destructive" : ""}`}>
            {fmtEur(cassa)}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-violet-500" /> Runway
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">
            {runway !== null ? `${runway} mesi` : "—"}
          </div>
        </Card>
      </div>

      {/* Add transaction modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Aggiungi movimento</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={addTransaction} className="space-y-3">
              {/* Type */}
              <div className="flex gap-2">
                {(["entrata", "uscita"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t, category: t === "entrata" ? "MRR" : "Infrastruttura" })}
                    className={`flex-1 rounded-xl border px-3 py-2 text-[13.5px] font-medium capitalize transition ${
                      form.type === t
                        ? t === "entrata"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                          : "border-red-500 bg-red-500/10 text-red-500"
                        : "border-border bg-surface text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Importo (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Categoria</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Descrizione</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Es. Supabase Pro, Cliente A..."
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[13.5px]">Ricorrente mensile</span>
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              </label>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1">Salva movimento</Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <Card>
        <CardHeader
          title="Movimenti"
          icon={Receipt}
          subtitle={`${transactions.length} movimenti registrati`}
        />
        {transactions.length === 0 ? (
          <p className="text-[13.5px] text-muted-foreground">
            Nessun movimento ancora. Aggiungi entrate e uscite per calcolare MRR, cassa e runway.
          </p>
        ) : (
          <div className="divide-y divide-border text-[13.5px]">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{t.description}</div>
                  <div className="text-[11.5px] text-muted-foreground">{t.category} · {t.date}{t.recurring ? " · ricorrente" : ""}</div>
                </div>
                <Pill tone={t.type === "entrata" ? "ok" : "muted"}>
                  {t.type === "entrata" ? "+" : "-"}{fmtEur(t.amount)}
                </Pill>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-accent hover:text-destructive"
                >
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
