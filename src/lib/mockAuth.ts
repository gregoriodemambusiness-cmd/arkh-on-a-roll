import { useEffect, useState } from "react";
import type { PlanId } from "./billing";

const KEY = "arkheon-user";

export type PaymentRecord = {
  at: number;
  plan: PlanId;
  amount: number; // EUR
  mode: "test" | "demo";
  sessionId?: string;
};

export type MockUser = {
  email: string;
  name: string;
  plan: PlanId;
  planSince?: number;
  trialEndsAt?: number;
  onboarded: boolean;
  paymentHistory?: PaymentRecord[];
  project?: {
    name: string;
    idea: string;
    sector: string;
    location: string;
    target: string;
    budget: string;
    stage: string;
    team: string;
    goal: string;
    type: string;
  };
};

export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as MockUser;
    // Backfill trial end for legacy records on free plan.
    if (u.plan === "free" && !u.trialEndsAt) {
      u.trialEndsAt = (u.planSince ?? Date.now()) + 30 * 24 * 60 * 60 * 1000;
    }
    return u;
  } catch {
    return null;
  }
}

export function setUser(u: MockUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("arkheon-auth"));
}

export function updateUser(updater: (u: MockUser) => MockUser) {
  const cur = getUser();
  if (!cur) return;
  setUser(updater(cur));
}

export function setPlan(plan: PlanId, payment?: Omit<PaymentRecord, "at" | "plan">) {
  updateUser((u) => ({
    ...u,
    plan,
    planSince: Date.now(),
    trialEndsAt:
      plan === "free" ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    paymentHistory: payment
      ? [...(u.paymentHistory || []), { ...payment, plan, at: Date.now() }]
      : u.paymentHistory,
  }));
}

export function useUser() {
  const [user, setLocal] = useState<MockUser | null>(null);
  useEffect(() => {
    setLocal(getUser());
    const h = () => setLocal(getUser());
    window.addEventListener("arkheon-auth", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("arkheon-auth", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return user;
}
