// Bridges Supabase auth state into the existing local MockUser cache so the
// rest of the app (which reads from localStorage via useUser/useProject) keeps
// working without a wide refactor.

import { supabase } from "@/integrations/supabase/client";
import { getUser, setUser, type MockUser } from "@/lib/mockAuth";
import { saveProject, getProject, type Project } from "@/lib/projectStore";
import type { PlanId } from "@/lib/billing";

let started = false;

async function hydrateFromServer() {
  try {
    const { getMyProfile, getMyProject, saveMyProject } = await import("@/lib/profile.functions");
    const [{ profile }, { project }] = await Promise.all([
      getMyProfile(),
      getMyProject(),
    ]);
    const localProject = getProject();

    // If DB has a project, mirror it into local cache. If only local exists,
    // push it up so the account "adopts" the locally-built workspace.
    if (project?.data) {
      saveProject(project.data as Project);
    } else if (localProject) {
      try {
        await saveMyProject({
          data: {
            name: localProject.name,
            idea: localProject.onboarding.idea,
            sector: localProject.onboarding.sector,
            target: localProject.onboarding.target,
            budget: localProject.budgetAvailable,
            phase: localProject.onboarding.stage,
            project_type: localProject.onboarding.type,
            team_mode: localProject.onboarding.team,
            data: localProject,
          },
        });
      } catch (e) {
        console.warn("Could not push local project to server:", e);
      }
    }

    const session = await supabase.auth.getSession();
    const u = session.data.session?.user;
    if (!u) return;

    const next: MockUser = {
      email: u.email ?? profile?.email ?? "",
      name: (profile?.full_name as string) || u.email?.split("@")[0] || "Founder",
      plan: (profile?.current_plan as PlanId) ?? "free",
      onboarded: !!(project?.data || localProject),
      project: localProject
        ? {
            name: localProject.name,
            idea: localProject.onboarding.idea,
            sector: localProject.onboarding.sector,
            location: localProject.onboarding.location,
            target: localProject.onboarding.target,
            budget: localProject.onboarding.budget,
            stage: localProject.onboarding.stage,
            team: localProject.onboarding.team,
            goal: localProject.onboarding.goal,
            type: localProject.onboarding.type,
          }
        : getUser()?.project,
    };
    setUser(next);
  } catch (e) {
    console.warn("authSync: hydrate failed", e);
  }
}

export function startAuthSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) hydrateFromServer();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      setUser(null);
      return;
    }
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      if (session) hydrateFromServer();
    }
  });
}

export async function signOutAndClear() {
  await supabase.auth.signOut();
  setUser(null);
  // Note: we intentionally KEEP the local project cache so users don't lose
  // work if they log out by mistake.
}
