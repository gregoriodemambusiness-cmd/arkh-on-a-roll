"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Copy, Check, Mail, Clock, Trash2, Link as LinkIcon,
} from "lucide-react";
import { PageHeader, Card, CardHeader, Button } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/mockAuth";

type Role = "Founder" | "Co-founder" | "Developer" | "Marketer" | "Investor";
type Status = "active" | "pending";

type Member = {
  id: string;
  email: string;
  name?: string;
  role: Role;
  status: Status;
  addedAt: number;
};

const ROLE_COLORS: Record<Role, string> = {
  Founder:     "bg-brand/10 text-brand",
  "Co-founder":"bg-violet-500/10 text-violet-500",
  Developer:   "bg-emerald-500/10 text-emerald-500",
  Marketer:    "bg-amber-500/10 text-amber-500",
  Investor:    "bg-sky-500/10 text-sky-500",
};

const ROLES: Role[] = ["Founder", "Co-founder", "Developer", "Marketer", "Investor"];

const STORAGE_KEY = "pilot-team-members";

function loadMembers(): Member[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveMembers(m: Member[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch {}
}

function initials(emailOrName: string) {
  const parts = emailOrName.split(/[\s@]/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2);
}

export default function TeamPage() {
  const user = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Developer");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMembers(loadMembers());
    setLoaded(true);
  }, []);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/invite?ref=${encodeURIComponent(user?.email ?? "pilot")}`
    : "https://app.pilotai.co/invite?ref=pilot";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const newMember: Member = {
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      role,
      status: "pending",
      addedAt: Date.now(),
    };
    const next = [newMember, ...members];
    setMembers(next);
    saveMembers(next);
    setEmail("");
    setShowInvite(false);
    setSaving(false);
  };

  const removeMember = (id: string) => {
    const next = members.filter((m) => m.id !== id);
    setMembers(next);
    saveMembers(next);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // "You" card — always first
  const youCard: Member = {
    id: "you",
    email: user?.email ?? "tu@startup.com",
    name: user?.name ?? "Tu",
    role: "Founder",
    status: "active",
    addedAt: Date.now(),
  };

  const active = [youCard, ...members.filter((m) => m.status === "active")];
  const pending = members.filter((m) => m.status === "pending");

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Team"
        subtitle="Invita co-founder, developer, marketer e investor al tuo workspace."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyLink}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiato!" : "Copia link invito"}
            </Button>
            <Button onClick={() => setShowInvite(true)}>
              <Plus className="h-3.5 w-3.5" /> Invita membro
            </Button>
          </div>
        }
      />

      {/* Invite form */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader title="Invita un membro" icon={Mail} />
              <form onSubmit={handleInvite} className="flex flex-wrap gap-3">
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@startup.com"
                  required
                  className="flex-1 min-w-[200px] rounded-xl border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Invio…" : "Invia invito"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => setShowInvite(false)}>
                    Annulla
                  </Button>
                </div>
              </form>
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                Il membro riceverà un'email con il link per accedere al workspace.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active members */}
      <Card>
        <CardHeader
          title="Membri attivi"
          icon={Users}
          subtitle={`${active.length} ${active.length === 1 ? "membro" : "membri"}`}
        />
        <div className="space-y-2">
          {active.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-[13px] font-bold text-brand">
                {initials(m.name ?? m.email)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium truncate">
                  {m.name ?? m.email}
                </div>
                {m.name && (
                  <div className="text-[11.5px] text-muted-foreground">{m.email}</div>
                )}
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ROLE_COLORS[m.role])}>
                {m.role}
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10.5px] font-medium text-success">
                Attivo
              </span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Pending invites */}
      {pending.length > 0 && (
        <Card>
          <CardHeader
            title="Inviti in attesa"
            icon={Clock}
            subtitle={`${pending.length} ${pending.length === 1 ? "invito" : "inviti"} in sospeso`}
          />
          <div className="space-y-2">
            <AnimatePresence>
              {pending.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-3 rounded-xl border border-border border-dashed bg-surface/40 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-[13px] font-bold text-muted-foreground">
                    {initials(m.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-muted-foreground truncate">{m.email}</div>
                    <div className="text-[11.5px] text-muted-foreground/60">
                      Invitato il {new Date(m.addedAt).toLocaleDateString("it-IT")}
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ROLE_COLORS[m.role])}>
                    {m.role}
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-500">
                    In attesa
                  </span>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="rounded-lg p-1.5 text-muted-foreground/50 hover:bg-accent hover:text-destructive"
                    aria-label="Rimuovi invito"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Invite link */}
      <Card>
        <CardHeader title="Link invito universale" icon={LinkIcon} subtitle="Chiunque clicchi questo link può accedere al workspace" />
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
          <span className="flex-1 truncate text-[13px] text-muted-foreground">{inviteLink}</span>
          <button
            onClick={copyLink}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-1.5 text-[12.5px] font-medium text-brand hover:bg-brand/20"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiato!" : "Copia"}
          </button>
        </div>
      </Card>
    </div>
  );
}
