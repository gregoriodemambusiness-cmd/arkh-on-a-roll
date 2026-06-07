import { createFileRoute } from "@tanstack/react-router";
import { Plug, Lock } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";

export const Route = createFileRoute("/app/integrations")({
  head: () => ({ meta: [{ title: "Integrations — PILOT AI" }] }),
  component: Integrations,
});

const integrations = [
  { n: "Notion", d: "Sincronizza il Blueprint", plan: "Founder", status: "ready" },
  { n: "Google Drive", d: "Esporta documenti", plan: "Pro", status: "ready" },
  { n: "Trello", d: "Esporta task", plan: "Pro", status: "ready" },
  { n: "Slack", d: "Notifiche team", plan: "Founder", status: "ready" },
  { n: "GitHub", d: "Link al repo MVP", plan: "Founder", status: "ready" },
  { n: "Figma", d: "Link al design system", plan: "Pro", status: "ready" },
  { n: "Jira", d: "Sincronizza i task", plan: "Founder", status: "ready" },
  { n: "ClickUp", d: "Sincronizza i task", plan: "Founder", status: "ready" },
  { n: "HubSpot", d: "Lead da landing", plan: "Founder", status: "ready" },
  { n: "Stripe", d: "Revenue tracking", plan: "Founder", status: "ready" },
];

function Integrations() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Integrations" subtitle="Connetti gli strumenti che già usi. Profondità in base al piano." />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {integrations.map((i) => (
          <Card key={i.n}>
            <CardHeader title={i.n} icon={Plug} action={<Pill>{i.plan}</Pill>} />
            <p className="text-[13px] text-muted-foreground">{i.d}</p>
            <Button variant="secondary" className="mt-3 w-full">Connetti</Button>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Custom Enterprise" icon={Lock} subtitle="Integrazioni custom su richiesta per il piano Enterprise." />
      </Card>
    </div>
  );
}
