"use client";
import { useState } from "react";
import { Presentation, Mail, FileText, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { Card, CardHeader, PageHeader, Button } from "@/components/app/ui";
import { useProject } from "@/lib/projectStore";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiato!" : "Copia"}
    </button>
  );
}

const VARIANTS = [
  (p: ReturnType<typeof buildPitch>) => `${p.name} è ${p.desc}.\nRisolviamo ${p.problem} per ${p.target}.\nLa nostra soluzione è ${p.solution}.\nIl nostro MVP include ${p.mvp}.\nStiamo cercando ${p.goal}.`,
  (p: ReturnType<typeof buildPitch>) => `Immagina di essere ${p.target} e di affrontare ${p.problem} ogni giorno.\n${p.name} risolve questo con ${p.solution}.\n${p.mvp} — costruito per validare in modo rapido.\nObiettivo: ${p.goal}.`,
  (p: ReturnType<typeof buildPitch>) => `${p.name} — ${p.desc}.\nProblema: ${p.problem}.\nSoluzione: ${p.solution}.\nTarget: ${p.target}.\nMVP: ${p.mvp}.\nGoal: ${p.goal}.`,
];

function buildPitch(project: { name: string; onelinePitch?: string; blueprint: { problem: string; solution: string; target: string; mvp: string; }; onboarding: { goal: string } } | null) {
  return {
    name: project?.name ?? "Il tuo progetto",
    desc: project?.onelinePitch ?? "la tua soluzione innovativa",
    problem: project?.blueprint?.problem || "un problema concreto del mercato",
    solution: project?.blueprint?.solution || "una soluzione unica e scalabile",
    target: project?.blueprint?.target || "il tuo target di riferimento",
    mvp: project?.blueprint?.mvp || "le funzioni essenziali del prodotto",
    goal: project?.onboarding?.goal || "i tuoi primi clienti",
  };
}

export default function PitchRoom() {
  const project = useProject();
  const [variant, setVariant] = useState(0);
  const [generated, setGenerated] = useState(false);

  const p = buildPitch(project);
  const pitchText = VARIANTS[variant](p);

  const emailBody = encodeURIComponent(
    `Oggetto: ${p.name} — Opportunità di investimento\n\nSalve,\n\nSono il founder di ${p.name}.\n\n${pitchText}\n\nSarei felice di raccontarvi di più. Possiamo sentirci?\n\nGrazie`
  );
  const emailHref = `mailto:?subject=${encodeURIComponent(`${p.name} — Pitch`)}&body=${emailBody}`;

  const nextVariant = () => setVariant((v) => (v + 1) % VARIANTS.length);

  const slideProblem = project?.blueprint?.problem || "Descrizione del problema (compila il Blueprint).";
  const slideSolution = project?.blueprint?.solution || "Descrizione della soluzione (compila il Blueprint).";
  const slideTraction = project?.onelinePitch || "Trazione e one-liner del progetto.";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Pitch Room"
        subtitle={`Elevator pitch, deck, email investor — tutto compilato con i dati di ${project?.name ?? "il tuo progetto"}.`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={nextVariant}>
              <RefreshCw className="h-3.5 w-3.5" /> Variante
            </Button>
            <Button onClick={() => setGenerated(true)}>
              <Sparkles className="h-3.5 w-3.5" /> Genera pitch
            </Button>
          </div>
        }
      />

      {!project && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13.5px] text-amber-600">
          Crea un progetto e compila il Blueprint per generare il pitch con i tuoi dati reali.
        </div>
      )}

      {/* One-liner */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardHeader title="One-line pitch" icon={Presentation} />
            <p className="font-display text-xl leading-snug">
              {project?.onelinePitch || `${p.name} — ${p.desc}.`}
            </p>
          </div>
          <CopyButton text={project?.onelinePitch || `${p.name} — ${p.desc}.`} />
        </div>
      </Card>

      {/* Elevator pitch */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardHeader
              title={`Elevator pitch — variante ${variant + 1}/${VARIANTS.length}`}
              subtitle="Clicca 'Variante' per rigenerare un formato diverso"
            />
            <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-muted-foreground">
              {generated || project ? pitchText : "Clicca 'Genera pitch' per compilare il testo con i tuoi dati."}
            </p>
          </div>
          <CopyButton text={pitchText} />
        </div>
      </Card>

      {/* Slides */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Problema", content: slideProblem },
          { label: "Soluzione", content: slideSolution },
          { label: "Traction / One-liner", content: slideTraction },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between gap-2">
              <CardHeader title={s.label} icon={FileText} />
              <CopyButton text={s.content} />
            </div>
            <p className="mt-1 text-[13.5px] text-muted-foreground leading-relaxed">{s.content}</p>
          </Card>
        ))}
      </div>

      {/* Email */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardHeader title="Email investor" icon={Mail} />
            <p className="text-[13px] text-muted-foreground">
              Bozza compilata con i dati del tuo progetto, pronta per inviare.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <CopyButton text={`Oggetto: ${p.name} — Pitch\n\n${pitchText}`} />
            <a href={emailHref} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[12.5px] font-medium text-background hover:opacity-90">
              <Mail className="h-3.5 w-3.5" /> Apri bozza
            </a>
          </div>
        </div>
      </Card>

      {/* Deck structure */}
      <Card>
        <CardHeader title="Pitch deck — struttura 10 slide" icon={FileText} />
        <ol className="grid gap-1.5 text-[13.5px] md:grid-cols-2">
          {[
            `1. Problema — ${p.problem.slice(0, 60)}…`,
            `2. Soluzione — ${p.solution.slice(0, 60)}…`,
            "3. Mercato — TAM/SAM/SOM",
            `4. Prodotto — ${p.mvp.slice(0, 50)}…`,
            "5. Trazione — interviste, waitlist",
            "6. Business model — pricing, unit economics",
            "7. GTM — canali di acquisizione",
            "8. Competition — posizionamento",
            "9. Team — founder e advisor",
            "10. Ask — round, utilizzo fondi",
          ].map((slide) => (
            <li key={slide} className="rounded-lg border border-border bg-surface/60 px-3 py-2 text-muted-foreground">
              {slide}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
