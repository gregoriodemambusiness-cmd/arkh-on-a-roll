"use client";
import { useNavigate } from "@/lib/nextCompat";
import { useState } from "react";
import { Settings as SetIcon, User, Building2, Lock, Bell, Sliders, Download, Check, X, Loader2 } from "lucide-react";
import { Card, CardHeader, PageHeader, Button } from "@/components/app/ui";
import { useUser, setUser, updateUser } from "@/lib/mockAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/lib/projectStore";
import { exportProjectPDF } from "@/lib/exportPDF";

export default SettingsPage;

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "data", label: "Data & Export", icon: Download },
];

const NOTIF_KEYS = ["task_deadline", "budget_alert", "founder_guard", "bandi_deadline", "weekly_report"];
const NOTIF_LABELS = ["Task in scadenza", "Budget alert", "Founder Guard", "Deadline bandi", "Weekly report"];

const PREF_KEYS = ["animations", "dock_sticky", "sidebar_expanded", "ai_direct_tone"];
const PREF_LABELS = ["Animazioni", "Dock sticky", "Sidebar espansa", "Tono AI: diretto"];

function loadPrefs() {
  try {
    const raw = localStorage.getItem("pilot-notifications");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-brand" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"ok" | "err" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd !== confirm) { setResult("err"); return; }
    if (pwd.length < 6) { setResult("err"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    setResult(error ? "err" : "ok");
    if (!error) setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Cambia password</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        {result === "ok" ? (
          <div className="flex flex-col items-center gap-2 py-4 text-brand">
            <Check className="h-8 w-8" />
            <p className="text-[14px] font-medium">Password aggiornata!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {result === "err" && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                Le password non coincidono o sono troppo corte (min. 6 caratteri).
              </p>
            )}
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Nuova password</span>
              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required minLength={6}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Conferma password</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand" />
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aggiorna password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const user = useUser();
  const project = useProject();
  const nav = useNavigate();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => loadPrefs());

  const saveProfile = () => {
    updateUser((u) => ({ ...u, name: name.trim() || u.name }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const togglePref = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem("pilot-notifications", JSON.stringify(next));
  };

  const exportJSON = () => {
    const data = {
      user: { name: user?.name, email: user?.email, plan: user?.plan },
      project,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pilot-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const tasks = project?.tasks ?? [];
    const header = "id,title,status,priority,area,completedAt";
    const rows = tasks.map((t) =>
      `"${t.id}","${t.title}","${t.status}","${t.priority}","${t.area}","${t.completedAt ?? ""}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pilot-tasks-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    const yes = window.confirm(
      "Sei sicuro di voler eliminare l'account? Questa azione è irreversibile."
    );
    if (yes) {
      alert("Per eliminare il tuo account, contatta il supporto a support@pilotai.co con oggetto 'Elimina account'.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Settings" subtitle="Gestisci profilo, workspace, sicurezza, notifiche, preferenze." />

      {showPwdModal && <PasswordModal onClose={() => setShowPwdModal(false)} />}

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Card>
          <CardHeader title="Sezioni" icon={SetIcon} />
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] ${
                  tab === t.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card>
          {/* PROFILE */}
          {tab === "profile" && (
            <div className="space-y-4">
              <CardHeader title="Profilo" />
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Nome</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={user?.name}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Email</span>
                <input
                  value={user?.email ?? ""}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-muted-foreground outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Lingua</span>
                <input defaultValue="Italiano" readOnly className="w-full cursor-not-allowed rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-muted-foreground outline-none" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Timezone</span>
                <input defaultValue="Europe/Rome" readOnly className="w-full cursor-not-allowed rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-muted-foreground outline-none" />
              </label>
              <div className="flex items-center gap-3">
                <Button onClick={saveProfile}>
                  {profileSaved ? <><Check className="h-3.5 w-3.5" /> Salvato!</> : "Salva modifiche"}
                </Button>
                <button
                  onClick={() => { setUser(null); nav({ to: "/" }); }}
                  className="text-[13px] text-destructive hover:underline"
                >
                  Esci dall'account
                </button>
              </div>
            </div>
          )}

          {/* WORKSPACE */}
          {tab === "workspace" && (
            <div className="space-y-4">
              <CardHeader title="Workspace" />
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Nome workspace</span>
                <input
                  defaultValue={`${user?.name?.split(" ")[0] || "Founder"}'s workspace`}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                />
              </label>
              <div>
                <div className="mb-1 text-[12px] uppercase tracking-wider text-muted-foreground">Membri</div>
                <div className="rounded-lg border border-border bg-surface p-3 text-[13.5px]">
                  {user?.name} — Owner
                </div>
              </div>
              <Button onClick={() => nav({ to: "/app/team" })}>
                Gestisci team →
              </Button>
            </div>
          )}

          {/* SECURITY */}
          {tab === "security" && (
            <div className="space-y-4">
              <CardHeader title="Security" />
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
                <span className="text-[13.5px]">Password</span>
                <Button variant="secondary" onClick={() => setShowPwdModal(true)}>Cambia password</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
                <span className="text-[13.5px]">2FA</span>
                <span className="text-[12.5px] text-muted-foreground">Non disponibile</span>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3">
                <div className="text-[13.5px] font-medium text-destructive">Zona pericolosa</div>
                <p className="mt-1 text-[12.5px] text-muted-foreground">L'eliminazione è permanente e non reversibile.</p>
                <button
                  onClick={deleteAccount}
                  className="mt-2 text-[13px] text-destructive hover:underline"
                >
                  Elimina account
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div className="space-y-3">
              <CardHeader title="Notifiche" />
              {NOTIF_KEYS.map((k, i) => (
                <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]">
                  <span>{NOTIF_LABELS[i]}</span>
                  <Toggle on={prefs[k] !== false} onToggle={() => togglePref(k)} />
                </div>
              ))}
            </div>
          )}

          {/* PREFERENCES */}
          {tab === "preferences" && (
            <div className="space-y-3">
              <CardHeader title="Preferenze" />
              {PREF_KEYS.map((k, i) => (
                <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]">
                  <span>{PREF_LABELS[i]}</span>
                  <Toggle on={prefs[k] !== false} onToggle={() => togglePref(k)} />
                </div>
              ))}
            </div>
          )}

          {/* DATA & EXPORT */}
          {tab === "data" && (
            <div className="space-y-3">
              <CardHeader title="Data & Export" />
              {[
                { label: "Esporta progetto (JSON)", action: exportJSON },
                { label: "Esporta Task (CSV)", action: exportCSV },
              ].map(({ label, action }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]">
                  <span>{label}</span>
                  <Button variant="secondary" onClick={action}>Esporta</Button>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px]">
                <span>Esporta Blueprint (PDF)</span>
                <Button variant="secondary" onClick={() => project && exportProjectPDF(project, user)}>Esporta</Button>
              </div>
              {[
                "Esporta Pitch (PDF)",
                "Esporta dati account",
              ].map((label) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-[13.5px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-[12px] text-muted-foreground">Prossimamente</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
