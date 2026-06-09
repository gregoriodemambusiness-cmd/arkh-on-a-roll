import { Link, useNavigate } from "@/lib/nextCompat";
import { Folder, Plus, Rocket } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button, ProgressBar } from "@/components/app/ui";
import { useProject, computeHealth, saveProject } from "@/lib/projectStore";

function Projects() {
  const proj = useProject();
  const nav = useNavigate();

  const newProject = () => {
    if (confirm("Creare un nuovo progetto? Quello attuale verrà sostituito.")) {
      saveProject(null);
      nav({ to: "/onboarding" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Progetti" subtitle="I tuoi progetti startup."
        action={<Button onClick={newProject}><Plus className="h-3.5 w-3.5" /> Nuovo progetto</Button>} />

      {!proj ? (
        <Card className="flex flex-col items-center py-12 text-center">
          <div className="rounded-2xl bg-brand/10 p-3 text-brand"><Rocket className="h-7 w-7" /></div>
          <h2 className="mt-4 font-display text-xl font-semibold">Crea il tuo primo progetto startup</h2>
          <p className="mt-1 text-[13.5px] text-muted-foreground">Inizia l'onboarding per generare blueprint, MVP, roadmap e task.</p>
          <Link to="/onboarding" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-[13.5px] text-background hover:opacity-90">Inizia onboarding</Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/app" className="block">
            <Card className="transition hover:border-foreground/20 hover:shadow-elegant">
              <CardHeader title={proj.name} icon={Folder} action={<Pill tone="brand">{proj.onboarding.stage}</Pill>} />
              <div className="text-[12px] text-muted-foreground">Health</div>
              <div className="mt-1 mb-2 font-display text-2xl font-semibold">{computeHealth(proj).score}/100</div>
              <ProgressBar value={computeHealth(proj).score} />
              <div className="mt-3 text-[12px] text-muted-foreground line-clamp-2">{proj.onelinePitch}</div>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Projects;
