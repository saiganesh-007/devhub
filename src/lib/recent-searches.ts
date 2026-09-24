const KEY = "devhub:recent-searches";
const MAX = 20;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX);
  } catch {
    return [];
  }
}

export function recordRecentSearch(query: string) {
  try {
    const clean = query.trim().slice(0, 100);
    if (!clean) return;
    const prev = getRecentSearches().filter(
      (x) => x.toLowerCase() !== clean.toLowerCase(),
    );
    window.localStorage.setItem(KEY, JSON.stringify([clean, ...prev].slice(0, MAX)));
    window.dispatchEvent(new Event("devhub:recent-searches"));
  } catch {
    // Best effort.
  }
}

export function clearRecentSearches() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("devhub:recent-searches"));
  } catch {
    // Best effort.
  }
}

export const RECENT_SEARCHES_KEY = KEY;
