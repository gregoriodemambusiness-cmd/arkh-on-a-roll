import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title, subtitle, icon: Icon, action,
}: { title: string; subtitle?: string; icon?: any; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-[13.5px] font-semibold">
          {Icon && <Icon className="h-4 w-4 text-brand" />} {title}
        </div>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ tone = "muted", children }: { tone?: "brand" | "muted" | "warn" | "ok"; children: ReactNode }) {
  const map = {
    brand: "bg-brand/10 text-brand",
    muted: "bg-muted text-muted-foreground",
    warn: "bg-warning/15 text-warning",
    ok: "bg-success/15 text-success",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", map[tone])}>{children}</span>;
}

export function Button({
  variant = "primary", className, children, ...rest
}: any) {
  const v: Record<string, string> = {
    primary: "bg-foreground text-background hover:opacity-90",
    secondary: "border border-border bg-surface text-foreground hover:bg-accent",
    ghost: "text-muted-foreground hover:text-foreground",
    brand: "bg-brand text-brand-foreground hover:opacity-90",
  };
  return (
    <button
      {...rest}
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition", v[variant], className)}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "warn" | "ok" }) {
  const c = tone === "warn" ? "bg-warning" : tone === "ok" ? "bg-success" : "bg-brand";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", c)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
