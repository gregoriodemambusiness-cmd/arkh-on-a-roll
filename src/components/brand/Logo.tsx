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
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="arkheon-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L28 27 H22.5 L20.2 21.5 H11.8 L9.5 27 H4 L16 3Z M13.6 17 H18.4 L16 11.2 L13.6 17Z"
        fill="url(#arkheon-g)"
      />
      <circle cx="16" cy="6.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, size = 28, withWordmark = true }: Props) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-[15px] font-semibold tracking-tight">
          ARKHEON <span className="text-brand">AI</span>
        </span>
      )}
    </div>
  );
}
