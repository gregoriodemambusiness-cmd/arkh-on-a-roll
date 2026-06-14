"use client";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  LayoutDashboard, Lightbulb, Palette, FileText, Coins, Wrench, Map, ListChecks,
  ShieldCheck, Megaphone, Presentation, Banknote, Users, Receipt, Wallet, Files,
  Plug, Sparkles, ShieldAlert, BadgeCheck, LifeBuoy, Settings, ChevronLeft,
  Compass, Share2, Zap, Grid, Network,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { WorkspaceSidebarPanel } from "@/components/app/WorkspaceSidebar";
import { useUser } from "@/lib/mockAuth";
import { checkUsageLimit } from "@/lib/claudeAI";

const sections: { label?: string; items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  { items: [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/journey", label: "Journey", icon: Compass },
  ]},
  {
    label: "Build",
    items: [
      { to: "/app/idea-lab", label: "Idea Lab", icon: Lightbulb },
      { to: "/app/brand-studio", label: "Brand Studio", icon: Palette },
      { to: "/app/blueprint", label: "Blueprint", icon: FileText },
      { to: "/app/business-model", label: "Business Model", icon: Coins },
      { to: "/app/mvp-builder", label: "MVP Builder", icon: Wrench },
      { to: "/app/mvp-canvas", label: "MVP Canvas", icon: Grid },
      { to: "/app/roadmap", label: "Roadmap", icon: Map },
      { to: "/app/task-center", label: "Task Center", icon: ListChecks },
    ],
  },
  {
    label: "Grow",
    items: [
      { to: "/app/validation", label: "Validation", icon: ShieldCheck },
      { to: "/app/marketing", label: "Marketing & Launch", icon: Megaphone },
      { to: "/app/pitch", label: "Pitch Room", icon: Presentation },
      { to: "/app/funding", label: "Bandi & Funding", icon: Banknote },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/app/team", label: "Team & Roles", icon: Users },
      { to: "/app/finance", label: "Finance", icon: Receipt },
      { to: "/app/budget-guard", label: "Budget Guard", icon: Wallet },
      { to: "/app/documents", label: "Documents", icon: Files },
      { to: "/app/integrations", label: "Integrations", icon: Plug },
    ],
  },
  {
    label: "AI",
    items: [
      { to: "/app/co-founder", label: "Co-founder AI", icon: Sparkles },
      { to: "/app/founder-guard", label: "Founder Guard", icon: ShieldAlert },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/app/plan", label: "Plan & Usage", icon: BadgeCheck },
      { to: "/app/referral", label: "Referral", icon: Share2 },
      { to: "/app/connect", label: "Connect", icon: Network },
      { to: "/app/support", label: "Support", icon: LifeBuoy },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

function AIUsageBar({ collapsed }: { collapsed: boolean }) {
  const user = useUser();
  const plan = user?.plan ?? "free";
  const usage = checkUsageLimit(plan);
  if (usage.limit >= 999999) return null;

  const pct = Math.round((usage.used / usage.limit) * 100);
  const exhausted = !usage.allowed;
  const warning = usage.remaining <= Math.ceil(usage.limit * 0.2);
  const barColor = exhausted ? "bg-destructive" : warning ? "bg-amber-500" : "bg-brand";

  if (collapsed) {
    return (
      <NextLink href="/app/co-founder" title={`AI: ${usage.remaining} rimaste`}
        className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface hover:bg-accent"
      >
        <Zap className={cn("h-3.5 w-3.5", exhausted ? "text-destructive" : warning ? "text-amber-500" : "text-brand")} />
      </NextLink>
    );
  }

  return (
    <div className="mx-2.5 mb-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Zap className="h-3 w-3" /> Co-founder AI
        </span>
        <NextLink href="/app/plan" className={cn("text-[10.5px] font-medium hover:underline",
          exhausted ? "text-destructive" : warning ? "text-amber-500" : "text-muted-foreground"
        )}>
          {exhausted ? "Upgrade" : `${usage.remaining} rimaste`}
        </NextLink>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      {exhausted && (
        <p className="mt-1 text-[10.5px] text-destructive">Limite mensile raggiunto</p>
      )}
    </div>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-border bg-surface/60 backdrop-blur-xl transition-[width] duration-300 md:flex md:flex-col",
        collapsed ? "w-[68px]" : "w-[252px]",
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {collapsed ? <LogoMark size={22} /> : <Logo size={22} />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Workspace switcher */}
      <WorkspaceSidebarPanel collapsed={collapsed} />

      <AIUsageBar collapsed={collapsed} />

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-2.5 pb-6">
        {sections.map((sec, i) => (
          <div key={i}>
            {sec.label && !collapsed && (
              <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                {sec.label}
              </div>
            )}
            <div className="space-y-0.5">
              {sec.items.map((it) => {
                const active = pathname === it.to || (it.to !== "/app" && pathname.startsWith(it.to));
                const Icon = it.icon;
                return (
                  <NextLink
                    key={it.to}
                    href={it.to}
                    data-tutorial={
                      it.to === "/app/co-founder" ? "cofounder-ai" :
                      it.to === "/app/journey" ? "journey" :
                      undefined
                    }
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-brand")} />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </NextLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
