import { useEffect, useState } from "react";

const KEY = "arkheon-user";

export type MockUser = {
  email: string;
  name: string;
  plan: "free" | "starter" | "pro" | "founder" | "enterprise";
  onboarded: boolean;
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
    return raw ? (JSON.parse(raw) as MockUser) : null;
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
