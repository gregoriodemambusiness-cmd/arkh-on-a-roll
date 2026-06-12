"use client";
import { useState } from "react";
import { Megaphone, Calendar, FileText, Copy, Check, RefreshCw } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";
import { useProject } from "@/lib/projectStore";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiato!" : "Copia"}
    </button>
  );
}

const HEADLINE_VARIANTS = [
  (name: string, desc: string) => `${name} — ${desc}`,
  (name: string, _: string, target: string) => `${name}: costruito per ${target}`,
  (name: string, _: string, __: string, problem: string) => `Smetti di perdere tempo su ${problem}. Usa ${name}.`,
];

const EMAIL_VARIANTS = [
  (name: string, problem: string, target: string) =>
    `Come ${name} risolve ${problem} per ${target}`,
  (name: string, _: string, target: string) =>
    `${target}: hai sentito parlare di ${name}?`,
  (name: string, problem: string) =>
    `Il problema di ${problem} ha finalmente una soluzione`,
];

const SOCIAL_VARIANTS = [
  (name: string, desc: string, target: string, _problem: string, _solution: string) =>
    `🚀 ${name} è ${desc}.\n\nSe sei ${target} e vuoi muoverti con metodo, questo è per te.\n\nProvalo gratis →`,
  (name: string, _desc: string, _target: string, problem: string, solution: string) =>
    `💡 ${problem}?\n\n${name} ti aiuta con: ${solution}.\n\nLinkato in bio 👇`,
  (name: string, desc: string, _target: string, _problem: string, _solution: string) =>
    `Abbiamo costruito ${name} — ${desc}.\n\nPrima beta aperta. Unisciti ora →`,
];

export default function Marketing() {
  const project = useProject();
  const [variantIdx, setVariantIdx] = useState(0);

  const name = project?.name ?? "Il tuo progetto";
  const desc = project?.onelinePitch ?? project?.blueprint?.valueProp ?? "la tua soluzione innovativa";
  const target = project?.blueprint?.target ?? "startup founder";
  const problem = project?.blueprint?.problem ?? "il tuo problema di mercato";
  const solution = project?.blueprint?.solution ?? "la tua soluzione";
  const gtm = project?.blueprint?.goToMarket ?? "contenuti, community e outreach";

  const headline = HEADLINE_VARIANTS[variantIdx % HEADLINE_VARIANTS.length](name, desc, target, problem);
  const emailSubject = EMAIL_VARIANTS[variantIdx % EMAIL_VARIANTS.length](name, problem, target);
  const socialPost = SOCIAL_VARIANTS[variantIdx % SOCIAL_VARIANTS.length](name, desc, target, problem, solution);

  const positioning = `${name} è per ${target} che affrontano ${problem}. A differenza di strumenti generici, ${name} offre ${solution}.`;

  const ads = [
    { channel: "📱 IG / TikTok", copy: `Smetti di affrontare ${problem} senza metodo — usa ${name}.` },
    { channel: "🔍 Google", copy: `${name} — Soluzione per ${target}` },
    { channel: "💼 LinkedIn", copy: `Per ${target} seri che vogliono risolvere ${problem}.` },
  ];

  const emailSequence = [
    { label: "📨 Cold email v1", text: `Salve,\n\nHo notato che molti ${target} affrontano ${problem}.\n\n${name} risolve esattamente questo con ${solution}.\n\nHa 15 minuti per una call?\n\nGrazie` },
    { label: "📨 Follow-up (3 giorni)", text: `Solo per verificare se ha ricevuto la mia email su ${name}.\n\n${desc}.\n\nÈ disponibile questa settimana?` },
    { label: "📨 Case study breve", text: `Abbiamo aiutato ${target} a risolvere ${problem} con ${name}.\n\nRisultato: ${solution}.\n\nVuole vedere come?` },
  ];

  const weeks = [
    { topic: "Problema", desc: `Post su ${problem}` },
    { topic: "Soluzione", desc: `Come ${name} aiuta ${target}` },
    { topic: "Prodotto", desc: `Demo e feature di ${name}` },
    { topic: "Lancio", desc: `Invito early access per ${target}` },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Marketing & Launch"
        subtitle={`Posizionamento, contenuti e outreach per ${name}.`}
        action={
          <Button onClick={() => setVariantIdx((v) => v + 1)}>
            <RefreshCw className="h-3.5 w-3.5" /> Rigenera variante
          </Button>
        }
      />

      {!project && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13.5px] text-amber-600">
          Compila il Blueprint per generare copy personalizzato con i dati del tuo progetto.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Positioning */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <CardHeader title="Posizionamento" icon={Megaphone} />
            <CopyBtn text={positioning} />
          </div>
          <p className="text-[14px] leading-relaxed">{positioning}</p>
        </Card>

        {/* Landing copy */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <CardHeader title="Landing copy" icon={FileText} />
            <CopyBtn text={`Hero: "${headline}"\nEmail subject: "${emailSubject}"\nCTA: "Inizia gratis"`} />
          </div>
          <ul className="space-y-1.5 text-[13.5px] text-muted-foreground">
            <li>• Hero: <em className="text-foreground">"{headline}"</em></li>
            <li>• Email subject: <em className="text-foreground">"{emailSubject}"</em></li>
            <li>• CTA: "Inizia gratis"</li>
          </ul>
        </Card>

        {/* Social post */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <CardHeader title="Social post" subtitle={`Variante ${(variantIdx % SOCIAL_VARIANTS.length) + 1}/${SOCIAL_VARIANTS.length}`} />
            <CopyBtn text={socialPost} />
          </div>
          <p className="whitespace-pre-line rounded-xl bg-muted/50 px-3 py-2.5 text-[13.5px] leading-relaxed">
            {socialPost}
          </p>
        </Card>

        {/* Ads */}
        <Card>
          <CardHeader title="Ads — bozze" />
          <ul className="space-y-2.5 text-[13px]">
            {ads.map((a) => (
              <li key={a.channel} className="flex items-start justify-between gap-2">
                <span>
                  <span className="font-medium">{a.channel}</span>
                  <br />
                  <span className="text-muted-foreground">"{a.copy}"</span>
                </span>
                <CopyBtn text={a.copy} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Content plan */}
        <Card className="md:col-span-2">
          <CardHeader title="Piano contenuti — 4 settimane" icon={Calendar} />
          <div className="grid gap-3 md:grid-cols-4">
            {weeks.map((w, i) => (
              <div key={w.topic} className="rounded-xl border border-border bg-surface/60 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Settimana {i + 1}</div>
                <div className="mt-1 text-[13.5px] font-medium">{w.topic}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{w.desc}</div>
                <Pill tone="brand">3 post · 1 reel · 1 newsletter</Pill>
              </div>
            ))}
          </div>
        </Card>

        {/* Email outreach */}
        <Card className="md:col-span-2">
          <CardHeader title="Email outreach" />
          <div className="space-y-2.5">
            {emailSequence.map((e) => (
              <div key={e.label} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface/60 p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">{e.label}</div>
                  <pre className="mt-1 max-h-24 overflow-hidden text-ellipsis whitespace-pre-wrap text-[12px] text-muted-foreground">
                    {e.text.slice(0, 150)}{e.text.length > 150 ? "…" : ""}
                  </pre>
                </div>
                <CopyBtn text={e.text} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
