import { Link } from "@/lib/nextCompat";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Workflow, LayoutDashboard, Users, FileText, Briefcase,
  Smartphone, Bot, Mail, Cog, ShieldCheck, Sparkles, Wallet,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useTheme } from "@/lib/theme";
import { Moon, Sun, Loader2 } from "lucide-react";
import { submitStudioLead } from "@/lib/notion.functions";

export default StudioPage;

function StudioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <Hero />
      <Capabilities />
      <UseCase />
      <HowItWorks />
      <Offers />
      <RequestForm />
      <Footer />
    </div>
  );
}

function PublicNav() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-5">
        <Link to="/"><Logo size={22} /></Link>
        <nav className="ml-10 hidden items-center gap-7 text-[13.5px] text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <a href="/#paths" className="hover:text-foreground">Per Founder</a>
          <Link to="/enterprise" className="hover:text-foreground">Enterprise</Link>
          <Link to="/studio" className="text-foreground">Studio</Link>
          <a href="/#pricing" className="hover:text-foreground">Prezzi</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggle} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground sm:inline-flex">Accedi</Link>
          <a href="#audit" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-[13.5px] font-medium text-background hover:opacity-90">
            Richiedi un audit <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-20 md:pb-24 md:pt-28 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[12px] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> PILOT Studio · Soluzioni operative su misura
          </span>
          <h1 className="mt-6 font-display text-[42px] font-semibold leading-[1.05] tracking-tight md:text-[60px]">
            Hai un processo lento?<br />
            Noi lo trasformiamo in <span className="text-gradient">automazione.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            PILOT Studio analizza i processi della tua azienda e costruisce automazioni, app,
            dashboard e AI agent su misura per ridurre lavoro manuale, errori e tempo perso.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#audit" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-elegant hover:opacity-90">
              Richiedi un audit operativo <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#audit" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-5 py-3 text-[14px] font-medium text-foreground backdrop-blur hover:bg-surface">
              Parla con il team
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Capabilities() {
  const items = [
    { icon: FileText, t: "Automazione preventivi" },
    { icon: LayoutDashboard, t: "Dashboard interne" },
    { icon: Users, t: "CRM personalizzati" },
    { icon: FileText, t: "Automazione documenti" },
    { icon: Briefcase, t: "Portali clienti" },
    { icon: Smartphone, t: "App per team" },
    { icon: Bot, t: "AI assistant interni" },
    { icon: Mail, t: "Workflow email/PDF/fogli/CRM" },
    { icon: Cog, t: "Sistemi RPA per processi ripetitivi" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Cosa possiamo costruire</h2>
        <p className="mt-3 text-muted-foreground">Soluzioni operative concrete, progettate sul tuo flusso reale.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((f) => (
          <div key={f.t} className="rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/20 hover:shadow-elegant">
            <div className="mb-3 inline-flex rounded-xl bg-brand/10 p-2 text-brand">
              <f.icon className="h-5 w-5" />
            </div>
            <div className="text-[15px] font-semibold">{f.t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UseCase() {
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-brand" /> Use case
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Esempio: automazione preventivi assicurativi
          </h3>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
            Un'agenzia perde tempo a creare preventivi su più compagnie, copiare dati, generare documenti
            e seguire ogni pratica manualmente. PILOT Studio può progettare un sistema che raccoglie
            i dati, organizza le richieste, genera output, riduce errori e velocizza il lavoro del team.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Audit operativo", d: "Analizziamo il processo, capiamo dove perdi tempo e identifichiamo cosa automatizzare." },
    { n: "02", t: "Prototipo", d: "Creiamo una prima versione funzionante per testare il flusso." },
    { n: "03", t: "Automazione su misura", d: "Costruiamo app, dashboard, AI agent o workflow collegati ai tuoi strumenti." },
    { n: "04", t: "Manutenzione e crescita", d: "Miglioriamo il sistema nel tempo con supporto, aggiornamenti e nuove automazioni." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Come funziona</h2>
        <p className="mt-3 text-muted-foreground">Dal problema operativo alla soluzione consegnata, in 4 step.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-2xl font-semibold text-brand">{s.n}</div>
            <div className="mt-2 text-[15px] font-semibold">{s.t}</div>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Offers() {
  const offers = [
    { n: "Audit AI Process", p: "da 299€", d: "Analisi del processo, mappa operativa, problemi principali, automazioni consigliate, stima tempi e costi.", c: "Richiedi audit" },
    { n: "Prototype Automation", p: "da 1.500€", d: "Primo prototipo funzionante con form, dashboard base, automazione email, documenti o workflow semplice.", c: "Richiedi prototipo" },
    { n: "Custom Automation MVP", p: "da 5.000€", d: "Costruzione di una soluzione operativa su misura: app web, dashboard, workflow, AI assistant, CRM o automazione aziendale.", c: "Parla con il team", featured: true },
    { n: "Maintenance & AI Operations", p: "da 500€/mese", d: "Manutenzione, modifiche mensili, bug fix, monitoraggio, miglioramenti AI e supporto continuativo.", c: "Attiva supporto" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Offerte Studio</h2>
        <p className="mt-3 text-muted-foreground">Dall'audit iniziale all'automazione operativa, con supporto continuo.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {offers.map((o) => (
          <div key={o.n} className={`relative flex flex-col rounded-2xl border bg-card p-5 ${o.featured ? "border-foreground shadow-elegant" : "border-border"}`}>
            {o.featured && (
              <div className="absolute -top-3 left-5 rounded-full bg-foreground px-2.5 py-0.5 text-[10.5px] font-medium text-background">Più richiesto</div>
            )}
            <div className="inline-flex rounded-xl bg-brand/10 p-2 text-brand self-start">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="mt-3 text-[14px] font-semibold">{o.n}</div>
            <div className="mt-1 font-display text-2xl font-semibold">{o.p}</div>
            <p className="mt-2 flex-1 text-[13px] text-muted-foreground">{o.d}</p>
            <a href="#audit" className={`mt-4 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-[13px] font-medium ${o.featured ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-accent"}`}>
              {o.c}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

const FORM_KEY = "pilot-studio-requests";

function RequestForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", cognome: "", email: "", azienda: "", settore: "", ruolo: "",
    processo: "", tempo: "", persone: "", budget: "", urgenza: "Media", messaggio: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await submitStudioLead({
      contact: `${form.nome} ${form.cognome}`.trim(),
      email: form.email,
      company: form.azienda,
      sector: form.settore,
      role: form.ruolo,
      process: form.processo,
      timeLost: form.tempo,
      teamSize: form.persone,
      budget: form.budget,
      urgency: form.urgenza,
      message: form.messaggio,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    try {
      const prev = JSON.parse(localStorage.getItem(FORM_KEY) || "[]");
      prev.push({ ...form, at: Date.now() });
      localStorage.setItem(FORM_KEY, JSON.stringify(prev));
    } catch {}
    setSent(true);
  };

  return (
    <section id="audit" className="mx-auto max-w-4xl px-5 py-16 md:py-24">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-10">
        {!sent ? (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px]">
                <ShieldCheck className="h-3 w-3 text-brand" /> Audit operativo
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">Richiedi un audit operativo</h2>
              <p className="mt-2 text-[14px] text-muted-foreground">Raccontaci il processo che vuoi automatizzare. Ti ricontattiamo per capire come aiutarti.</p>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Nome" required value={form.nome} onChange={set("nome")} />
                <Input label="Cognome" required value={form.cognome} onChange={set("cognome")} />
              </div>
              <Input label="Email aziendale" type="email" required value={form.email} onChange={set("email")} />
              <div className="grid gap-3 md:grid-cols-3">
                <Input label="Azienda" required value={form.azienda} onChange={set("azienda")} />
                <Input label="Settore" value={form.settore} onChange={set("settore")} />
                <Input label="Ruolo" value={form.ruolo} onChange={set("ruolo")} />
              </div>
              <Textarea label="Che processo vuoi automatizzare?" rows={3} required value={form.processo} onChange={set("processo")} />
              <div className="grid gap-3 md:grid-cols-3">
                <Input label="Tempo perso oggi sul processo" placeholder="Es. 10h/settimana" value={form.tempo} onChange={set("tempo")} />
                <Input label="Quante persone lo usano" value={form.persone} onChange={set("persone")} />
                <Input label="Budget indicativo" placeholder="Es. 5.000–15.000€" value={form.budget} onChange={set("budget")} />
              </div>
              <Select label="Urgenza" value={form.urgenza} onChange={set("urgenza")} options={["Bassa", "Media", "Alta"]} />
              <Textarea label="Messaggio aggiuntivo" rows={3} value={form.messaggio} onChange={set("messaggio")} />
              {error && <p className="text-[13px] text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-[14px] font-medium text-background hover:opacity-90 disabled:opacity-60">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Invio in corso…</> : <>Invia richiesta <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          </>
        ) : (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">✓</div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Richiesta ricevuta</h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] text-muted-foreground">
              Grazie, abbiamo ricevuto la tua richiesta. Ti contatteremo per capire il processo
              e valutare l'audit operativo più adatto.
            </p>
            <Link to="/" className="mt-6 inline-flex text-[13.5px] text-brand">Torna alla home</Link>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
        <Logo size={20} />
        <p className="text-[12px] text-muted-foreground">© {new Date().getFullYear()} PILOT · Dal processo lento all'automazione operativa.</p>
      </div>
    </footer>
  );
}

function Input({ label, ...rest }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input {...rest} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" />
    </label>
  );
}
function Textarea({ label, ...rest }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <textarea {...rest} className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" />
    </label>
  );
}
function Select({ label, options, ...rest }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <select {...rest} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand">
        {options.map((o: string) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
