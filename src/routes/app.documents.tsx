import { Files, Download } from "lucide-react";
import { Card, CardHeader, PageHeader, Button, Pill } from "@/components/app/ui";



function Docs() {
  const docs = [
    { n: "Blueprint", t: "PDF", d: "2 ore fa" },
    { n: "Pitch Deck v1", t: "PDF", d: "ieri" },
    { n: "One-pager", t: "PDF", d: "ieri" },
    { n: "Roadmap 30/60/90", t: "PDF", d: "3 giorni fa" },
    { n: "Task export", t: "CSV", d: "1 settimana fa" },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Documents" subtitle="Tutti i documenti generati dal tuo progetto." />
      <Card>
        <CardHeader title="File" icon={Files} />
        <div className="divide-y divide-border">
          {docs.map((d) => (
            <div key={d.n} className="flex items-center justify-between py-3">
              <div>
                <div className="text-[14px] font-medium">{d.n}</div>
                <div className="text-[12px] text-muted-foreground">Aggiornato {d.d}</div>
              </div>
              <div className="flex items-center gap-2">
                <Pill>{d.t}</Pill>
                <Button variant="secondary"><Download className="h-3.5 w-3.5" /> Scarica</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Docs;
