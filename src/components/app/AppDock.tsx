"use client";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { LayoutDashboard, Folder, Sparkles, ListChecks, Gauge, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", label: "Home", icon: LayoutDashboard },
  { to: "/app/projects", label: "Progetti", icon: Folder },
  { to: "/app/co-founder", label: "AI", icon: Sparkles },
  { to: "/app/task-center", label: "Task", icon: ListChecks },
  { to: "/app/plan", label: "Usage", icon: Gauge },
  { to: "/app/settings", label: "Profilo", icon: UserCircle2 },
];

export function AppDock() {
  const pathname = usePathname();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-4">
      <div className="pointer-events-auto glass-strong flex items-center gap-1 rounded-2xl px-2 py-1.5 shadow-elegant">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.to || (it.to !== "/app" && pathname.startsWith(it.to));
          return (
            <NextLink
              key={it.to}
              href={it.to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10.5px] font-medium transition-colors",
                active ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active && "text-brand")} />
              <span>{it.label}</span>
            </NextLink>
          );
        })}
      </div>
    </div>
  );
}
