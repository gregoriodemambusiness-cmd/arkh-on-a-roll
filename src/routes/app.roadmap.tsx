import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, ProgressBar } from "@/components/app/ui";
import { useProject, updateProject } from "@/lib/projectStore";

export const Route = createFileRoute("/app/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — ARKHEON AI" }] }),
  component: Roadmap,
});

function Roadmap() {
  const proj = useProject();
  if (!proj) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Nessun progetto attivo.</div>;
  }

  const toggle = (phaseKey: string, idx: number) => {
    updateProject((p) => ({
      ...p,
      roadmap: p.roadmap.map((ph) =>
        ph.key !== phaseKey
          ? ph
          : { ...ph, items: ph.items.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)) }
      ),
    }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Roadmap 30 / 60 / 90" subtitle="Validazione, MVP, lancio. Clicca per spuntare." />
      <div className="grid gap-4 lg:grid-cols-3">
        {proj.roadmap.map((p) => {
          const done = p.items.filter((i) => i.done).length;
          const pct = Math.round((done / p.items.length) * 100);
          return (
            <Card key={p.key}>
              <CardHeader title={p.label} icon={Map} action={<Pill>{done}/{p.items.length}</Pill>} />
              <ProgressBar value={pct} />
              <div className="mt-4 space-y-2">
                {p.items.map((i, idx) => (
                  <button
                    key={i.t}
                    onClick={() => toggle(p.key, idx)}
                    className={`flex w-full items-center justify-between rounded-lg border bg-surface/60 p-2.5 text-left text-[13px] transition hover:border-foreground/20 ${i.done ? "border-success/30 line-through opacity-70" : "border-border"}`}
                  >
                    <span>{i.t}</span>
                    <Pill tone={i.done ? "ok" : "muted"}>{i.done ? "Fatto" : "Da fare"}</Pill>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
