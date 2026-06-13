import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  monochrome?: boolean;
};

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={cn("shrink-0 text-foreground", className)}
      aria-hidden
    >
      <path d="M16 3 L28 27 H22.5 L20.2 21.5 H11.8 L9.5 27 H4 L16 3Z M13.6 17 H18.4 L16 11.2 L13.6 17Z" />
      <circle cx="16" cy="6.5" r="1.6" />
    </svg>
  );
}

export function Logo({ className, size = 28, withWordmark = true }: Props) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-foreground dark:text-foreground", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-[15px] font-semibold tracking-tight">
          Pilot
        </span>
      )}
    </div>
  );
}
