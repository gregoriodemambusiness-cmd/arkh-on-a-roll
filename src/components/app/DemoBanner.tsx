"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, X, ArrowRight } from "lucide-react";
import { useDemoMode, exitDemoMode } from "@/lib/demo-mode";

export function DemoBanner() {
  const { isDemoMode, minutesLeft } = useDemoMode();
  const router = useRouter();

  if (!isDemoMode) return null;

  const handleExit = () => {
    exitDemoMode();
    router.push("/");
  };

  const handleSignup = () => {
    exitDemoMode();
    router.push("/signup");
  };

  return (
    <div
      className="relative z-50 flex items-center justify-between gap-3 px-4 py-2"
      style={{
        background: "linear-gradient(90deg, oklch(0.20 0.08 287), oklch(0.24 0.12 287))",
        borderBottom: "1px solid oklch(0.35 0.15 287 / 0.5)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <FlaskConical className="h-3.5 w-3.5 shrink-0 text-brand" />
        <p className="truncate text-[12.5px] text-white/80">
          <span className="font-medium text-white">Modalita Demo</span>
          {" — "}i dati non vengono salvati.
          <span className="ml-1 text-white/50">Scade tra {minutesLeft} min.</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleSignup}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1 text-[11.5px] font-semibold text-white hover:opacity-90"
        >
          Crea account gratuito <ArrowRight className="h-3 w-3" />
        </button>
        <button
          onClick={handleExit}
          className="rounded-md p-1 text-white/40 hover:text-white/80"
          title="Esci dalla demo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
