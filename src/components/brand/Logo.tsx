import { cn } from "@/lib/utils";

type MarkProps = { className?: string; size?: number };
type LogoProps = { className?: string; size?: number; withWordmark?: boolean };

export function LogoMark({ className, size = 28 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-black dark:text-white", className)}
      aria-hidden
    >
      {/* Solid upward triangle — no inner paths, no cutouts */}
      <polygon points="16,3 30,27 2,27" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, size = 28, withWordmark = true }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-black dark:text-white", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-[14px] font-bold uppercase tracking-[0.1em]">
          Pilot
        </span>
      )}
    </div>
  );
}
