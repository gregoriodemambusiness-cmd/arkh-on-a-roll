import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Fetch the signed-in user's profile (creates a default row if missing).
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,current_plan,plan_status,created_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

// Update the current plan on the user's profile + insert a subscription row.
export const updateMyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        plan: z.enum(["free", "starter", "pro", "founder"]),
        stripe_session_id: z.string().optional(),
        stripe_subscription_id: z.string().optional(),
        stripe_customer_id: z.string().optional(),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ current_plan: data.plan, plan_status: "active" })
      .eq("id", userId);
    if (pErr) throw new Error(pErr.message);

    if (data.plan !== "free") {
      const { error: sErr } = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: data.plan,
        status: "active",
        stripe_session_id: data.stripe_session_id,
        stripe_subscription_id: data.stripe_subscription_id,
        stripe_customer_id: data.stripe_customer_id,
      });
      if (sErr) throw new Error(sErr.message);
    }
    return { ok: true };
  });

// Insert payment history row.
export const recordPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        plan: z.enum(["free", "starter", "pro", "founder"]),
        amount: z.number(),
        currency: z.string().default("eur"),
        stripe_session_id: z.string().optional(),
        status: z.string().default("completed"),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Avoid duplicates on refresh.
    if (data.stripe_session_id) {
      const { data: existing } = await supabase
        .from("payment_history")
        .select("id")
        .eq("user_id", userId)
        .eq("stripe_session_id", data.stripe_session_id)
        .maybeSingle();
      if (existing) return { ok: true, duplicate: true };
    }
    const { error } = await supabase.from("payment_history").insert({
      user_id: userId,
      plan: data.plan,
      amount: data.amount,
      currency: data.currency,
      stripe_session_id: data.stripe_session_id,
      status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// List payment history for the signed-in user.
export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("payment_history")
      .select("id,plan,amount,currency,stripe_session_id,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

// Save (upsert) the active project for the signed-in user.
export const saveMyProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(1),
        idea: z.string().optional().default(""),
        sector: z.string().optional().default(""),
        target: z.string().optional().default(""),
        budget: z.number().optional().default(0),
        phase: z.string().optional().default(""),
        project_type: z.string().optional().default(""),
        team_mode: z.string().optional().default(""),
        data: z.any(),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // One active project per user for now: upsert into the most-recent row, else insert.
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("projects")
        .update({
          name: data.name,
          idea: data.idea,
          sector: data.sector,
          target: data.target,
          budget: data.budget,
          phase: data.phase,
          project_type: data.project_type,
          team_mode: data.team_mode,
          data: data.data,
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: existing.id };
    }
    const { data: ins, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: data.name,
        idea: data.idea,
        sector: data.sector,
        target: data.target,
        budget: data.budget,
        phase: data.phase,
        project_type: data.project_type,
        team_mode: data.team_mode,
        data: data.data,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const getMyProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("projects")
      .select("id,name,data,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { project: data };
  });
