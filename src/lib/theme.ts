import { useEffect, useState } from "react";

const KEY = "arkheon-theme";
type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(KEY)) as Theme | null;
    const sys = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const t = stored ?? sys;
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return { theme, toggle };
}
