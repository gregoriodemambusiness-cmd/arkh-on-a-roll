import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";

export const Route = createFileRoute("/app/team")({
  head: () => ({ meta: [{ title: "Team & Roles — PILOT AI" }] }),
  component: Team,
});

function Team() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Team & Roles" subtitle="Definisci ruoli, responsabilità e inviti."
        action={<Button>Invita membro</Button>} />
      <Card>
        <CardHeader title="Membri" icon={Users} />
        <div className="divide-y divide-border">
          {[
            { n: "Tu", r: "Founder / CEO", e: "—" },
            { n: "Posto vacante", r: "CTO", e: "Da assegnare" },
            { n: "Posto vacante", r: "CMO", e: "Da assegnare" },
          ].map((m) => (
            <div key={m.r} className="flex items-center justify-between py-3">
              <div>
                <div className="text-[14px] font-medium">{m.n}</div>
                <div className="text-[12.5px] text-muted-foreground">{m.r}</div>
              </div>
              <Pill tone={m.e === "—" ? "ok" : "warn"}>{m.e === "—" ? "Attivo" : m.e}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
