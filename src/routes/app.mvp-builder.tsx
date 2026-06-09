import { Wrench, X, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Pill, Button } from "@/components/app/ui";



function MVP() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="MVP Builder" subtitle="MVP realistico, funzioni essenziali, stack e checklist."
        action={<Button>Genera prompt no-code</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Funzioni essenziali" icon={Wrench} action={<Pill tone="ok">3 / 3</Pill>} />
          <ul className="space-y-2 text-[13.5px]">
            {["Login + onboarding","Flusso core (input → output AI)","Waitlist + pagamento"].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> {t}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Da rimandare" action={<Pill tone="warn">15 idee</Pill>} />
          <ul className="space-y-1.5 text-[13.5px] text-muted-foreground">
            {["App mobile","Integrazioni Slack/Notion","Multi-workspace","Dashboard admin avanzata","Analytics avanzata","Multi-lingua","API pubbliche","White-label"].map((t) => (
              <li key={t} className="flex items-center gap-2"><X className="h-3.5 w-3.5" /> {t}</li>
            ))}
          </ul>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="User flow" />
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            {["Landing","Signup","Onboarding","Input idea","Output AI","CTA paid"].map((s, i, a) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{s}</span>
                {i < a.length - 1 && <span className="text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Stack consigliato" />
          <div className="flex flex-wrap gap-2 text-[12.5px]">
            {["Next.js","Tailwind","Supabase","Stripe","Vercel","OpenAI"].map((t) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-1">{t}</span>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Checklist tecnica" />
          <ul className="space-y-1.5 text-[13.5px]">
            {[
              ["Auth + session", true],
              ["DB schema + RLS", true],
              ["Stripe checkout test", false],
              ["Email transazionali", false],
              ["Monitoring base", false],
            ].map(([t, ok]) => (
              <li key={t as string} className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${ok ? "text-brand" : "text-muted-foreground/40"}`} /> {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default MVP;
