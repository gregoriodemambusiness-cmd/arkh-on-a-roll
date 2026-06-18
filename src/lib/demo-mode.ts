"use client";
import { useEffect, useState } from "react";
import { DEMO_PROJECT, DEMO_WORKSPACE, DEMO_WORKSPACE_ID } from "./demo-data";

const DEMO_SESSION_KEY = "pilot-demo-session";
const PROJECT_KEY = "pilot-project";
const ACTIVE_WORKSPACE_KEY = "pilot-active-workspace";
const DEMO_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function enterDemoMode(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_SESSION_KEY, String(Date.now()));
  localStorage.setItem(PROJECT_KEY, JSON.stringify(DEMO_PROJECT));
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, DEMO_WORKSPACE_ID);
  window.dispatchEvent(new Event("pilot-project-change"));
  window.dispatchEvent(new Event("pilot-workspace-change"));
}

export function exitDemoMode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem(PROJECT_KEY);
  localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  window.dispatchEvent(new Event("pilot-project-change"));
  window.dispatchEvent(new Event("pilot-workspace-change"));
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const ts = localStorage.getItem(DEMO_SESSION_KEY);
  if (!ts) return false;
  const elapsed = Date.now() - Number(ts);
  if (elapsed > DEMO_DURATION_MS) {
    exitDemoMode();
    return false;
  }
  return true;
}

export function getDemoWorkspace() {
  return { ...DEMO_WORKSPACE };
}

export function useDemoMode(): { isDemoMode: boolean; exitDemo: () => void; minutesLeft: number } {
  const [active, setActive] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(30);

  useEffect(() => {
    const check = () => {
      const ts = localStorage.getItem(DEMO_SESSION_KEY);
      if (!ts) { setActive(false); return; }
      const elapsed = Date.now() - Number(ts);
      if (elapsed > DEMO_DURATION_MS) {
        exitDemoMode();
        setActive(false);
        return;
      }
      setActive(true);
      setMinutesLeft(Math.ceil((DEMO_DURATION_MS - elapsed) / 60000));
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const exitDemo = () => {
    exitDemoMode();
    setActive(false);
    if (typeof window !== "undefined") window.location.href = "/";
  };

  return { isDemoMode: active, exitDemo, minutesLeft };
}
