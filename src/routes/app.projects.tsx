import { createFileRoute, Link } from "@tanstack/react-router";
import { Folder, Plus } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";
import { useUser } from "@/lib/mockAuth";

export const Route = createFileRoute("/app/projects")({
  head: () => ({ meta: [{ title: "Progetti — ARKHEON AI" }] }),
  component: Projects,
});

function Projects() {
  const user = useUser();
  const projects = [
    user?.project ? { n: user.project.name, s: user.project.stage, h: 72 } : { n: "La mia startup", s: "Validazione", h: 72 },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Progetti" subtitle="Tutti i tuoi progetti startup."
        action={<Button><Plus className="h-3.5 w-3.5" /> Nuovo progetto</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((p) => (
          <Link to="/app" key={p.n} className="block">
            <Card className="transition hover:border-foreground/20 hover:shadow-elegant">
              <CardHeader title={p.n} icon={Folder} action={<Pill tone="brand">{p.s}</Pill>} />
              <div className="text-[12px] text-muted-foreground">Health</div>
              <div className="mt-1 mb-2 font-display text-2xl font-semibold">{p.h}/100</div>
              <ProgressBar value={p.h} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
