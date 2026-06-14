"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "@/lib/theme";
import { Bell, LogOut, Moon, Search, Sun, X, LayoutDashboard, Compass, Map, Wrench, CheckSquare, DollarSign, ShieldAlert, Lightbulb, Presentation, Megaphone, Wallet, BarChart3, Palette, FileText, Puzzle, Users, Share2, Settings, LifeBuoy, CreditCard, ArrowRight } from "lucide-react";
import { useUser } from "@/lib/mockAuth";
import { PLAN_BY_ID, type PlanId } from "@/lib/billing";
import { Link, useNavigate } from "@/lib/nextCompat";
import { signOutAndClear } from "@/lib/authSync";
import { useProject, computeHealth, analyzeBudget } from "@/lib/projectStore";

const PAGES = [
  { label: "Dashboard", to: "/app", icon: LayoutDashboard },
  { label: "Journey", to: "/app/journey", icon: Compass },
  { label: "Blueprint", to: "/app/blueprint", icon: FileText },
  { label: "Roadmap", to: "/app/roadmap", icon: Map },
  { label: "Task Center", to: "/app/task-center", icon: CheckSquare },
  { label: "Validation", to: "/app/validation", icon: ShieldAlert },
  { label: "Finance", to: "/app/finance", icon: Wallet },
  { label: "Business Model", to: "/app/business-model", icon: BarChart3 },
  { label: "MVP Builder", to: "/app/mvp-builder", icon: Wrench },
  { label: "Brand Studio", to: "/app/brand-studio", icon: Palette },
  { label: "Pitch Room", to: "/app/pitch", icon: Presentation },
  { label: "Marketing", to: "/app/marketing", icon: Megaphone },
  { label: "Budget Guard", to: "/app/budget-guard", icon: DollarSign },
  { label: "Founder Guard", to: "/app/founder-guard", icon: ShieldAlert },
  { label: "Co-founder AI", to: "/app/co-founder", icon: Lightbulb },
  { label: "Bandi & Funding", to: "/app/funding", icon: CreditCard },
  { label: "Documenti", to: "/app/documents", icon: FileText },
  { label: "Integrazioni", to: "/app/integrations", icon: Puzzle },
  { label: "Team", to: "/app/team", icon: Users },
  { label: "Referral", to: "/app/referral", icon: Share2 },
  { label: "Plan & Usage", to: "/app/plan", icon: CreditCard },
  { label: "Settings", to: "/app/settings", icon: Settings },
  { label: "Support", to: "/app/support", icon: LifeBuoy },
];

type AppNotif = { id: string; text: string; to: string };

const NOTIF_READ_KEY = "pilot-notif-read";

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = q
    ? PAGES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()))
    : PAGES;

  const go = (to: string) => {
    nav({ to });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered[0]) go(filtered[0].to);
            }}
            placeholder="Cerca pagina…"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-[13.5px] text-muted-foreground">Nessuna pagina trovata.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.to}
                onClick={() => go(p.to)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] hover:bg-accent"
              >
                <p.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {p.label}
                <span className="ml-auto text-[11px] text-muted-foreground/50">{p.to}</span>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd> apri ·{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Esc</kbd> chiudi
        </div>
      </div>
    </div>
  );
}

function NotificationPanel({
  notifications,
  readIds,
  onMarkRead,
  onClose,
}: {
  notifications: AppNotif[];
  readIds: Set<string>;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const markAll = () => {
    notifications.forEach((n) => onMarkRead(n.id));
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-xl z-50"
    >
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-[13.5px] font-semibold">Notifiche</h3>
      </div>
      <div className="divide-y divide-border">
        {notifications.length === 0 && (
          <p className="px-4 py-4 text-[13px] text-muted-foreground">Nessuna notifica.</p>
        )}
        {notifications.map((n) => {
          const unread = !readIds.has(n.id);
          return (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${unread ? "bg-brand/3" : ""}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-brand" : ""}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px]">{n.text}</p>
              </div>
              <button
                onClick={() => { onMarkRead(n.id); nav({ to: n.to }); onClose(); }}
                className="shrink-0 inline-flex items-center gap-0.5 rounded-lg bg-brand/10 px-2 py-1 text-[11.5px] font-medium text-brand hover:bg-brand/20"
              >
                Vai <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-2.5">
          <button onClick={markAll} className="text-[12.5px] text-brand hover:underline">
            Segna tutte come lette
          </button>
        </div>
      )}
    </div>
  );
}

export function AppTopbar({ title }: { title?: string }) {
  const { theme, toggle } = useTheme();
  const user = useUser();
  const proj = useProject();
  const nav = useNavigate();
  const [showPalette, setShowPalette] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(NOTIF_READ_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  const initials = (user?.name || "AR").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const plan = (user?.plan ?? "free") as PlanId;
  const planName = PLAN_BY_ID[plan]?.name ?? "Free";
  const trialDaysLeft = plan === "free" && user?.trialEndsAt
    ? Math.max(0, Math.ceil((user.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const planBadge = trialDaysLeft !== null ? `Trial — ${trialDaysLeft}g` : planName;
  const logout = async () => { await signOutAndClear(); nav({ to: "/login" }); };

  const notifications = useMemo<AppNotif[]>(() => {
    const list: AppNotif[] = [];
    if (trialDaysLeft !== null && trialDaysLeft <= 7) {
      list.push({ id: "trial", text: `Il tuo trial scade tra ${trialDaysLeft} giorni. Passa a Starter per continuare.`, to: "/app/plan" });
    }
    if (proj) {
      const openTasks = proj.tasks.filter((t) => t.status !== "Completato");
      if (openTasks.length > 3) {
        list.push({ id: "tasks", text: `Hai ${openTasks.length} task aperti. Inizia dal piu urgente oggi.`, to: "/app/task-center" });
      }
      const health = computeHealth(proj).score;
      if (health < 40) {
        list.push({ id: "health", text: `Health Score critico: ${health}/100. Completa il Blueprint per migliorarlo.`, to: "/app/founder-guard" });
      }
      const interviews = (proj as { interviews?: unknown[] }).interviews;
      if (!interviews || interviews.length === 0) {
        list.push({ id: "interviews", text: "Nessuna intervista utente registrata. La validazione e il passo piu critico.", to: "/app/validation" });
      }
      const budget = analyzeBudget(proj);
      if (budget.delta < 0) {
        list.push({ id: "budget", text: "Il budget non copre l'MVP pianificato. Riduci le feature o aumenta il budget.", to: "/app/budget-guard" });
      }
    }
    return list;
  }, [proj, trialDaysLeft]);

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // CMD+K / CTRL+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
      if (e.key === "Escape") {
        setShowPalette(false);
        setShowNotif(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
        {title && <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>}
        <div className="ml-auto flex items-center gap-2">
          {/* Search / command palette trigger */}
          <button
            onClick={() => setShowPalette(true)}
            className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-accent md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Cerca…</span>
            <kbd className="ml-3 rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          <Link
            to="/app/plan"
            className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {planBadge}
          </Link>

          <button
            onClick={toggle}
            className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotif((v) => !v)}
              className="relative rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-foreground"
              aria-label="Notifiche"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotif && (
              <NotificationPanel
                notifications={notifications}
                readIds={readIds}
                onMarkRead={markRead}
                onClose={() => setShowNotif(false)}
              />
            )}
          </div>

          <button
            onClick={logout}
            title="Esci"
            className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
            {initials}
          </div>
        </div>
      </header>
    </>
  );
}
