"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppDock } from "@/components/app/AppDock";
import { AppTopbar } from "@/components/app/AppTopbar";
import { WelcomeModal } from "@/components/app/WelcomeModal";
import { DemoBanner } from "@/components/app/DemoBanner";
import { listWorkspaces } from "@/lib/workspaces";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/lib/demo-mode";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [hasWorkspaces, setHasWorkspaces] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isDemoMode()) {
      setAuthChecked(true);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setAuthChecked(true);

      const flag = sessionStorage.getItem("pilot-welcome");
      if (!flag) return;
      sessionStorage.removeItem("pilot-welcome");
      const ws = await listWorkspaces();
      setHasWorkspaces(ws.length > 0);
      setWelcomeOpen(true);
    });
  }, [router]);

  if (!authChecked) return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <DemoBanner />
      <div className="flex min-w-0 flex-1">
        <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} hasWorkspaces={hasWorkspaces} />
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12">
            {children}
          </main>
          <AppDock />
        </div>
      </div>
    </div>
  );
}
