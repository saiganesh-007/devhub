"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import type { ResolvedTheme, ThemePreference } from "@/lib/theme";

/**
 * Submission lock: light theme is forced throughout DevHub.
 * The dark-theme architecture (tokens, stored preferences, system
 * detection) is preserved for later — the provider simply ignores it
 * for now and always resolves to "light".
 */
interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference] = useState<ThemePreference>("light");
  const [resolved] = useState<ResolvedTheme>("light");

  const apply = useCallback((theme: ResolvedTheme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, []);

  useEffect(() => {
    // Force light on mount and clear any previously stored dark preference.
    try {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // Best effort.
    }
    apply("light");
  }, [apply]);

  const setPreference = useCallback(
    () => {
      // Locked for submission: keep light regardless of requests.
      try {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {
        // Best effort.
      }
      apply("light");
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
