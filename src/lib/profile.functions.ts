"use server";
// Profile/project server functions — converted from TanStack server functions to Next.js server actions.
// These are stubs; full implementation can be added as Next.js server actions when needed.
import { supabase } from "@/integrations/supabase/client";

export async function getMyProfile(): Promise<{ profile: { id?: string; email?: string | null; full_name?: string | null; current_plan?: string; plan_status?: string; created_at?: string } | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { profile: null };
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,current_plan,plan_status,created_at")
    .eq("id", session.user.id)
    .maybeSingle();
  return { profile: data };
}

export async function updateMyPlan(_args: { data: { plan: string; stripe_session_id?: string } }): Promise<{ ok: boolean }> {
  // Stub — plan updates happen client-side via setPlan() for now.
  return { ok: true };
}

export async function recordPayment(_args: {
  data: { plan: string; amount: number; currency: string; stripe_session_id?: string; status: string };
}): Promise<{ ok: boolean }> {
  // Stub — payment history is tracked client-side for now.
  return { ok: true };
}

export async function listMyPayments(): Promise<{ items: unknown[] }> {
  return { items: [] };
}

export async function saveMyProject(_args: { data: Record<string, unknown> }): Promise<{ ok: boolean }> {
  // Stub — project saving is deferred; local cache is source of truth for now.
  return { ok: true };
}

export async function getMyProject(): Promise<{ project: { id?: string; name?: string; data?: unknown; updated_at?: string } | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { project: null };
  const { data } = await supabase
    .from("projects")
    .select("id,name,data,updated_at")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { project: data };
}
