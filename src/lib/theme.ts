export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "devhub-theme";

export const themeStorage = {
  get(): ThemePreference | null {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
    return null;
  },
  set(preference: ThemePreference) {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  },
};