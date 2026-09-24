"use client";

export type SearchEntityFilter = "all" | "developers" | "repositories";

export interface SearchPrefs {
  suggestionsEnabled: boolean;
  recentHistoryEnabled: boolean;
  includeDevelopers: boolean;
  includeRepositories: boolean;
  openInNewTab: boolean;
  defaultSearchType: SearchEntityFilter;
  resultsPerPage: 10 | 20 | 30;
  defaultLanding: "/dashboard" | "/search" | "/favourites";
}

const KEY = "devhub:search-prefs";

const DEFAULTS: SearchPrefs = {
  suggestionsEnabled: true,
  recentHistoryEnabled: true,
  includeDevelopers: true,
  includeRepositories: true,
  openInNewTab: false,
  defaultSearchType: "all",
  resultsPerPage: 10,
  defaultLanding: "/dashboard",
};

function sanitize(raw: Partial<SearchPrefs>): SearchPrefs {
  return {
    suggestionsEnabled:
      typeof raw.suggestionsEnabled === "boolean"
        ? raw.suggestionsEnabled
        : DEFAULTS.suggestionsEnabled,
    recentHistoryEnabled:
      typeof raw.recentHistoryEnabled === "boolean"
        ? raw.recentHistoryEnabled
        : DEFAULTS.recentHistoryEnabled,
    includeDevelopers:
      typeof raw.includeDevelopers === "boolean"
        ? raw.includeDevelopers
        : DEFAULTS.includeDevelopers,
    includeRepositories:
      typeof raw.includeRepositories === "boolean"
        ? raw.includeRepositories
        : DEFAULTS.includeRepositories,
    openInNewTab:
      typeof raw.openInNewTab === "boolean"
        ? raw.openInNewTab
        : DEFAULTS.openInNewTab,
    defaultSearchType:
      raw.defaultSearchType === "developers" ||
      raw.defaultSearchType === "repositories" ||
      raw.defaultSearchType === "all"
        ? raw.defaultSearchType
        : DEFAULTS.defaultSearchType,
    resultsPerPage:
      raw.resultsPerPage === 10 ||
      raw.resultsPerPage === 20 ||
      raw.resultsPerPage === 30
        ? raw.resultsPerPage
        : DEFAULTS.resultsPerPage,
    defaultLanding:
      raw.defaultLanding === "/dashboard" ||
      raw.defaultLanding === "/search" ||
      raw.defaultLanding === "/favourites"
        ? raw.defaultLanding
        : DEFAULTS.defaultLanding,
  };
}

export function getSearchPrefs(): SearchPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return sanitize(JSON.parse(raw) as Partial<SearchPrefs>);
  } catch {
    return DEFAULTS;
  }
}

export function setSearchPrefs(patch: Partial<SearchPrefs>): SearchPrefs {
  const next = sanitize({ ...getSearchPrefs(), ...patch });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Best effort.
  }
  return next;
}

export function subscribeSearchPrefs(listener: (prefs: SearchPrefs) => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === KEY) listener(getSearchPrefs());
  }
  function onCustom() {
    listener(getSearchPrefs());
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener("devhub:search-prefs", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("devhub:search-prefs", onCustom);
  };
}

export function notifySearchPrefs() {
  try {
    window.dispatchEvent(new Event("devhub:search-prefs"));
  } catch {
    // noop
  }
}

export const SEARCH_PREFS_DEFAULTS = DEFAULTS;
export const SEARCH_PREFS_KEY = KEY;
