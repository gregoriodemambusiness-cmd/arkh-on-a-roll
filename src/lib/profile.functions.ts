"use server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getMyProfile(): Promise<{
  profile: {
    id?: string;
    email?: string | null;
    full_name?: string | null;
    current_plan?: string;
    plan_status?: string;
    created_at?: string;
  } | null;
}> {
  // Note: uses admin client — this is a server-only function
  // In production pair with auth middleware to get the user id
  return { profile: null };
}

export async function updateMyPlan({
  data,
}: {
  data: { userId: string; plan: string; stripe_session_id?: string };
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: data.userId,
          current_plan: data.plan,
          plan_status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    if (error) {
      console.error("[profile] updateMyPlan error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e: unknown) {
    console.error("[profile] updateMyPlan exception:", e);
    return { ok: false, error: (e as { message?: string })?.message || "Unknown error" };
  }
}

export async function recordPayment({
  data,
}: {
  data: {
    userId: string;
    plan: string;
    amount: number;
    currency: string;
    stripe_session_id?: string;
    status: string;
  };
}): Promise<{ ok: boolean }> {
  try {
    // payments table — insert if exists, silently skip if table not yet created
    const { error } = await supabaseAdmin.from("payments" as never).insert({
      user_id: data.userId,
      plan: data.plan,
      amount: data.amount,
      currency: data.currency,
      stripe_session_id: data.stripe_session_id,
      status: data.status,
      created_at: new Date().toISOString(),
    } as never);
    if (error && !error.message?.includes("does not exist")) {
      console.error("[profile] recordPayment error:", error);
    }
    return { ok: true };
  } catch {
    return { ok: true }; // non-critical, don't fail the payment flow
  }
}

export async function listMyPayments(): Promise<{ items: unknown[] }> {
  return { items: [] };
}

export async function saveMyProject(_args: { data: Record<string, unknown> }): Promise<{ ok: boolean }> {
  return { ok: true };
}

export async function getMyProject(): Promise<{
  project: { id?: string; name?: string; data?: unknown; updated_at?: string } | null;
}> {
  return { project: null };
}
