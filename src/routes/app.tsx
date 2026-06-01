import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppDock } from "@/components/app/AppDock";
import { AppTopbar } from "@/components/app/AppTopbar";
import { getUser } from "@/lib/mockAuth";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const u = getUser();
      if (!u) throw redirect({ to: "/login" });
      if (!u.onboarded) throw redirect({ to: "/onboarding" });
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
