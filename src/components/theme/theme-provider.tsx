"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { THEME_STORAGE_KEY, themeStorage } from "@/lib/theme";
import type { ResolvedTheme, ThemePreference } from "@/lib/theme";

function media(): MediaQueryList | null {
  return typeof window === "undefined"
    ? null
    : window.matchMedia("(prefers-color-scheme: light)");
}

function resolve(preference: ThemePreference | null): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return media()?.matches ? "light" : "dark";
}

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  const apply = useCallback((theme: ResolvedTheme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, []);

  useEffect(() => {
    const stored = themeStorage.get();
    const initial =
      stored === "light" || stored === "dark"
        ? stored
        : document.documentElement.dataset.theme === "light"
          ? "light"
          : "dark";
    // align React state with the pre-hydration ThemeScript after mount,
    // keeping the first client render identical to the server render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferenceState(stored ?? "system");
    setResolved(initial);
    apply(initial);
  }, [apply]);

  useEffect(() => {
    const onChange = () => {
      const next = resolve(preference);
      setResolved(next);
      apply(next);
    };
    media()?.addEventListener("change", onChange);
    return () => media()?.removeEventListener("change", onChange);
  }, [preference, apply]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      themeStorage.set(next);
      setPreferenceState(next);
      const nextResolved = next === "system" ? resolve(null) : next;
      setResolved(nextResolved);
      apply(nextResolved);
    },
    [apply],
  );

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}

export { THEME_STORAGE_KEY };