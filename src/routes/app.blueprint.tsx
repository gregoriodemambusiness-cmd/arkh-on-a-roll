import { FileText, Download, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, PageHeader, Button, Pill } from "@/components/app/ui";
import { useProject, updateBlueprint, type Blueprint } from "@/lib/projectStore";



const FIELDS: { key: keyof Blueprint; label: string }[] = [
  { key: "mission", label: "Mission" },
  { key: "vision", label: "Vision" },
  { key: "problem", label: "Problema" },
  { key: "solution", label: "Soluzione" },
  { key: "target", label: "Target" },
  { key: "valueProp", label: "Value Proposition" },
  { key: "businessModel", label: "Business Model" },
  { key: "mvp", label: "MVP" },
  { key: "goToMarket", label: "Go-to-market" },
  { key: "risks", label: "Rischi principali" },
  { key: "nextActions", label: "Prossime azioni" },
];

function BlueprintPage() {
  const proj = useProject();
  const [local, setLocal] = useState<Blueprint | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (proj && !local) setLocal(proj.blueprint);
  }, [proj]);

  if (!proj || !local) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const save = () => {
    updateBlueprint(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Blueprint"
        subtitle={`${proj.name} — modifica e salva ogni sezione.`}
        action={
          <div className="flex gap-2">
            {saved && <Pill tone="ok"><Check className="h-3 w-3" /> Salvato</Pill>}
            <Button variant="secondary" onClick={save}>Salva modifiche</Button>
            <Button onClick={() => window.print()}><Download className="h-3.5 w-3.5" /> Esporta</Button>
          </div>
        }
      />
      <Card>
        <CardHeader title="Documento" icon={FileText} subtitle={`${FIELDS.length} sezioni`} />
        <div className="divide-y divide-border">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
              <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
              <textarea
                value={local[key]}
                onChange={(e) => setLocal({ ...local, [key]: e.target.value })}
                rows={2}
                className="w-full resize-none rounded-lg border border-transparent bg-transparent p-2 text-[14.5px] leading-relaxed transition hover:border-border focus:border-brand focus:bg-surface"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default BlueprintPage;
