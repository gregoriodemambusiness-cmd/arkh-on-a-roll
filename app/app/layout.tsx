"use client";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppDock } from "@/components/app/AppDock";
import { AppTopbar } from "@/components/app/AppTopbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
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
