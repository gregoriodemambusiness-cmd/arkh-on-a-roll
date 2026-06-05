import type { PaidPlanId } from "@/lib/billing";

const KEY = "arkheon-pending-plan";

export function setPendingPlan(plan: PaidPlanId) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, plan);
}

export function getPendingPlan(): PaidPlanId | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return (v as PaidPlanId | null) || null;
}

export function clearPendingPlan() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
