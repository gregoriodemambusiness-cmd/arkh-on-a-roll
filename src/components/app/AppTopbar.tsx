import { useTheme } from "@/lib/theme";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useUser } from "@/lib/mockAuth";

export function AppTopbar({ title }: { title?: string }) {
  const { theme, toggle } = useTheme();
  const user = useUser();
  const initials = (user?.name || "AR").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      {title && <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>}
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] text-muted-foreground md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Cerca…</span>
          <kbd className="ml-3 rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </div>
        <button
          onClick={toggle}
          className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {initials}
        </div>
      </div>
    </header>
  );
}
