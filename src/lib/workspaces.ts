"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Workspace = {
  id: string;
  user_id: string;
  owner_id?: string;
  name: string;
  invite_code?: string;
  created_at: string;
  project_data: Record<string, unknown> | null;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Invite code ─────────────────────────────────────────────────────────────

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = randomCode();
    const { data } = await db.from("workspaces").select("id").eq("invite_code", code).maybeSingle();
    if (!data) return code;
  }
  return randomCode();
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberRows } = await db
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  const memberIds: string[] = (memberRows ?? []).map((r: { workspace_id: string }) => r.workspace_id);

  let query = db.from("workspaces").select("*").eq("user_id", user.id);
  if (memberIds.length > 0) {
    query = db.from("workspaces").select("*")
      .or(`user_id.eq.${user.id},id.in.(${memberIds.join(",")})`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) { console.error("[workspaces] list:", error.message); return []; }
  return (data ?? []) as Workspace[];
}

export async function hasAnyWorkspace(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: owned } = await db.from("workspaces").select("id").eq("user_id", user.id).limit(1).maybeSingle();
  if (owned) return true;

  const { data: member } = await db.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).maybeSingle();
  return !!member;
}

export async function createWorkspace(name: string): Promise<Workspace | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const code = await uniqueCode();

  const { data, error } = await db
    .from("workspaces")
    .insert({ name: name.trim() || "Il mio workspace", user_id: user.id, owner_id: user.id, invite_code: code })
    .select()
    .single();

  if (error) { console.error("[workspaces] create:", error.message); return null; }

  await db.from("workspace_members").insert({ workspace_id: data.id, user_id: user.id, role: "admin" });

  return data as Workspace;
}

export type JoinResult =
  | { ok: true; workspace: Workspace }
  | { ok: false; error: string };

export async function joinWorkspace(code: string): Promise<JoinResult> {
  const norm = code.replace(/\s/g, "").trim();
  if (!/^\d{6}$/.test(norm)) return { ok: false, error: "Il codice deve essere di 6 cifre numeriche." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non sei autenticato." };

  const { data: ws } = await db.from("workspaces").select("*").eq("invite_code", norm).maybeSingle();
  if (!ws) return { ok: false, error: "Codice non valido. Controlla e riprova." };

  const { data: existing } = await db.from("workspace_members")
    .select("id").eq("workspace_id", ws.id).eq("user_id", user.id).maybeSingle();
  if (existing) return { ok: true, workspace: ws as Workspace };

  const { error } = await db.from("workspace_members").insert({ workspace_id: ws.id, user_id: user.id, role: "member" });
  if (error) return { ok: false, error: "Errore durante l'accesso al workspace. Riprova." };

  return { ok: true, workspace: ws as Workspace };
}

export async function getInviteCode(workspaceId: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await db.from("workspace_members")
    .select("role").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
  if (!member || member.role !== "admin") return null;

  const { data } = await db.from("workspaces").select("invite_code").eq("id", workspaceId).maybeSingle();
  return data?.invite_code ?? null;
}

export async function updateWorkspaceData(id: string, projectData: unknown): Promise<boolean> {
  const { error } = await db.from("workspaces").update({ project_data: projectData }).eq("id", id);
  if (error) { console.error("[workspaces] update:", error.message); }
  return !error;
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  const { error } = await db.from("workspaces").delete().eq("id", id);
  if (error) { console.error("[workspaces] delete:", error.message); }
  return !error;
}

// ── Active workspace ─────────────────────────────────────────────────────────

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) refresh();
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) refresh();
      else { setWorkspaces([]); setActiveId(null); setLoading(false); }
    });
    const onWsChange = () => setActiveId(getActiveWorkspaceId());
    window.addEventListener("pilot-workspace-change", onWsChange);
    return () => { subscription.unsubscribe(); window.removeEventListener("pilot-workspace-change", onWsChange); };
  }, [refresh]);

  const activate = useCallback((id: string) => {
    setActiveId(id);
    setActiveWorkspaceId(id);
  }, []);

  const add = useCallback(async (name: string) => {
    const w = await createWorkspace(name);
    if (w) { setWorkspaces((prev) => [w, ...prev]); activate(w.id); }
    return w;
  }, [activate]);

  const active = workspaces.find((w) => w.id === activeId) ?? null;
  return { workspaces, active, activeId, loading, refresh, activate, add };
}
