"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppDock } from "@/components/app/AppDock";
import { AppTopbar } from "@/components/app/AppTopbar";
import { WelcomeModal } from "@/components/app/WelcomeModal";
import { listWorkspaces } from "@/lib/workspaces";
import { supabase } from "@/integrations/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [hasWorkspaces, setHasWorkspaces] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem("pilot-welcome");
    if (!flag) return;
    sessionStorage.removeItem("pilot-welcome");

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const ws = await listWorkspaces();
      setHasWorkspaces(ws.length > 0);
      setWelcomeOpen(true);
    });
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
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
  );
}
