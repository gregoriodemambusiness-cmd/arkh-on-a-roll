"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { enterDemoMode } from "@/lib/demo-mode";

export default function DemoEnter() {
  const router = useRouter();

  useEffect(() => {
    enterDemoMode();
    router.replace("/app");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
    </div>
  );
}
