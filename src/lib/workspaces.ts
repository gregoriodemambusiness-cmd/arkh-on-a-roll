"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Workspace = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  project_data: Record<string, unknown> | null;
};

// ── CRUD ────────────────────────────────────────────────────────────────────

// Use `any` cast until the `workspaces` table migration is applied and types regenerated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await db
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[workspaces] list:", error.message); return []; }
  return (data ?? []) as Workspace[];
}

export async function createWorkspace(name: string): Promise<Workspace | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await db
    .from("workspaces")
    .insert({ name: name.trim() || "Il mio workspace", user_id: user.id })
    .select()
    .single();
  if (error) { console.error("[workspaces] create:", error.message); return null; }
  return data as Workspace;
}

export async function updateWorkspaceData(
  id: string,
  projectData: unknown,
): Promise<boolean> {
  const { error } = await db
    .from("workspaces")
    .update({ project_data: projectData })
    .eq("id", id);
  if (error) { console.error("[workspaces] update:", error.message); }
  return !error;
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  const { error } = await db.from("workspaces").delete().eq("id", id);
  if (error) { console.error("[workspaces] delete:", error.message); }
  return !error;
}

// ── Local active workspace key ───────────────────────────────────────────────
const ACTIVE_KEY = "pilot-active-workspace";

export function getActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveWorkspaceId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event("pilot-workspace-change"));
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await listWorkspaces();
    setWorkspaces(list);

    const stored = getActiveWorkspaceId();
    const active = list.find((w) => w.id === stored) ?? list[0] ?? null;
    setActiveId(active?.id ?? null);
    if (active?.id && active.id !== stored) setActiveWorkspaceId(active.id);

    setLoading(false);
  }, []);

  useEffect(() => {
    // Only run after Supabase session is available
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) refresh();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) refresh();
      else { setWorkspaces([]); setActiveId(null); setLoading(false); }
    });

    const handleChange = () => setActiveId(getActiveWorkspaceId());
    window.addEventListener("pilot-workspace-change", handleChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("pilot-workspace-change", handleChange);
    };
  }, [refresh]);

  const activate = useCallback((id: string) => {
    setActiveId(id);
    setActiveWorkspaceId(id);
  }, []);

  const add = useCallback(async (name: string) => {
    const w = await createWorkspace(name);
    if (w) {
      setWorkspaces((prev) => [w, ...prev]);
      activate(w.id);
    }
    return w;
  }, [activate]);

  const active = workspaces.find((w) => w.id === activeId) ?? null;

  return { workspaces, active, activeId, loading, refresh, activate, add };
}
