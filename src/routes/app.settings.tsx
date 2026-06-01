import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Settings as SetIcon, User, Building2, Lock, Bell, Sliders, Download } from "lucide-react";
import { Card, CardHeader, PageHeader, Button, Pill } from "@/components/app/ui";
import { useUser, setUser } from "@/lib/mockAuth";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — ARKHEON AI" }] }),
  component: SettingsPage,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "data", label: "Data & Export", icon: Download },
];

function SettingsPage() {
  const user = useUser();
  const nav = useNavigate();
  const [tab, setTab] = useState("profile");
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Settings" subtitle="Gestisci profilo, workspace, sicurezza, notifiche, preferenze." />

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Card>
          <CardHeader title="Sezioni" icon={SetIcon} />
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] ${tab===t.id?"bg-accent text-foreground":"text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card>
          {tab === "profile" && (
            <div className="space-y-4">
              <CardHeader title="Profile" />
              <Field label="Nome" defaultValue={user?.name} />
              <Field label="Email" defaultValue={user?.email} />
              <Field label="Lingua" defaultValue="Italiano" />
              <Field label="Timezone" defaultValue="Europe/Rome" />
              <Field label="Ruolo" defaultValue="Founder" />
              <Button>Salva</Button>
              <button
                onClick={() => { setUser(null); nav({ to: "/" }); }}
                className="ml-3 text-[13px] text-destructive hover:underline"
              >Esci dall'account</button>
            </div>
          )}
          {tab === "workspace" && (
            <div className="space-y-4">
              <CardHeader title="Workspace" action={<Pill tone="brand">1 membro</Pill>} />
              <Field label="Nome workspace" defaultValue={`${user?.name?.split(" ")[0] || "Founder"}'s workspace`} />
              <div>
                <div className="mb-1 text-[12px] uppercase tracking-wider text-muted-foreground">Membri</div>
                <div className="rounded-lg border border-border bg-surface p-3 text-[13.5px]">{user?.name} — Owner</div>
              </div>
              <Button variant="secondary">Invita membro</Button>
            </div>
          )}
          {tab === "security" && (
            <div className="space-y-4">
              <CardHeader title="Security" />
              <Field label="Password" type="password" defaultValue="••••••••" />
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"><span className="text-[13.5px]">2FA</span><Pill>Disattivata</Pill></div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"><span className="text-[13.5px]">Social login</span><Pill tone="ok">Google</Pill></div>
              <button className="text-[13px] text-destructive hover:underline">Elimina account</button>
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-3">
              <CardHeader title="Notifications" />
              {["Task in scadenza","Budget alert","Founder Guard","Deadline bandi","Weekly report"].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]"><span>{n}</span><Pill tone="ok">On</Pill></div>
              ))}
            </div>
          )}
          {tab === "preferences" && (
            <div className="space-y-3">
              <CardHeader title="Preferences" />
              {["Tema (auto)","Animazioni","Dock sticky","Sidebar espansa","Tono AI: diretto"].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]"><span>{n}</span><Pill tone="brand">Attivo</Pill></div>
              ))}
            </div>
          )}
          {tab === "data" && (
            <div className="space-y-3">
              <CardHeader title="Data & Export" />
              {["Esporta progetto (.zip)","Esporta Blueprint (PDF)","Esporta Pitch (PDF)","Esporta Task (CSV)","Esporta dati account"].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]"><span>{n}</span><Button variant="secondary">Esporta</Button></div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, type = "text", defaultValue }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input type={type} defaultValue={defaultValue} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" />
    </label>
  );
}
