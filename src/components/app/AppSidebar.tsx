import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Lightbulb, Palette, FileText, Coins, Wrench, Map, ListChecks,
  ShieldCheck, Megaphone, Presentation, Banknote, Users, Receipt, Wallet, Files,
  Plug, Sparkles, ShieldAlert, BadgeCheck, LifeBuoy, Settings, ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";

const sections: { label?: string; items: { to: string; label: string; icon: any }[] }[] = [
  { items: [{ to: "/app", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Build",
    items: [
      { to: "/app/idea-lab", label: "Idea Lab", icon: Lightbulb },
      { to: "/app/brand-studio", label: "Brand Studio", icon: Palette },
      { to: "/app/blueprint", label: "Blueprint", icon: FileText },
      { to: "/app/business-model", label: "Business Model", icon: Coins },
      { to: "/app/mvp-builder", label: "MVP Builder", icon: Wrench },
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
      { to: "/app/support", label: "Support", icon: LifeBuoy },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
                  <Link
                    key={it.to}
                    to={it.to}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-brand")} />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
