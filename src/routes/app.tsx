import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppDock } from "@/components/app/AppDock";
import { AppTopbar } from "@/components/app/AppTopbar";
import { supabase } from "@/integrations/supabase/client";
import { getProject } from "@/lib/projectStore";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
    // Onboarding required if neither local nor (eventually) DB project exists.
    if (!getProject()) {
      // Give auth sync a moment to pull the project from DB after a hard refresh.
      // If still missing after 600ms, send to onboarding.
      await new Promise((r) => setTimeout(r, 600));
      if (!getProject()) throw redirect({ to: "/onboarding" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12">
          <Outlet />
        </main>
        <AppDock />
      </div>
    </div>
  );
}
