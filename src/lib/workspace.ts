export type EntityType = "developer" | "repository";
export type SearchMode = "developers" | "repositories";
export type RecentSearch = { query: string; type: SearchMode; timestamp: number };
export type HistoryEvent = {
  kind: "search" | "view" | "comparison";
  entityType?: EntityType;
  identifier: string;
  secondaryIdentifier?: string;
  label?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
};
export type WorkspaceSuggestion = {
  type: EntityType;
  id: string;
  label: string;
  detail: string;
  avatar?: string;
  saved?: boolean;
};

export function savedEntityKey(type: EntityType, identifier: string) {
  return `${type}:${identifier.trim().toLowerCase()}`;
}

export function addRecentSearch(history: RecentSearch[], entry: RecentSearch, limit = 10) {
  const query = entry.query.trim();
  if (!query) return history.slice(0, limit);
  return [
    { ...entry, query },
    ...history.filter(
      (item) => !(item.type === entry.type && item.query.toLowerCase() === query.toLowerCase()),
    ),
  ].slice(0, limit);
}

export function pushHistoryEvent(history: HistoryEvent[], entry: HistoryEvent, limit = 20) {
  const key = `${entry.kind}:${entry.entityType ?? ""}:${entry.identifier.toLowerCase()}:${(entry.secondaryIdentifier ?? "").toLowerCase()}`;
  return [entry, ...history.filter((item) => `${item.kind}:${item.entityType ?? ""}:${item.identifier.toLowerCase()}:${(item.secondaryIdentifier ?? "").toLowerCase()}` !== key)].slice(0, limit);
}

export function mergeSuggestions(local: WorkspaceSuggestion[], remote: WorkspaceSuggestion[], query: string, limit = 10) {
  const needle = query.trim().toLowerCase();
  const seen = new Set<string>();
  return [...local.filter((item) => !needle || `${item.label} ${item.id}`.toLowerCase().includes(needle)), ...remote]
    .filter((item) => { const key = savedEntityKey(item.type, item.id); if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, limit);
}

export const HISTORY_STORAGE_KEY = "devhub:history:v1";
export function readLocalHistory(): HistoryEvent[] {
  if (typeof window === "undefined") return [];
  try { const value = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]"); return Array.isArray(value) ? value.slice(0, 20) : []; } catch { return []; }
}
export function recordLocalHistory(entry: Omit<HistoryEvent, "timestamp"> & { timestamp?: number }) {
  if (typeof window === "undefined") return;
  const next = pushHistoryEvent(readLocalHistory(), { ...entry, timestamp: entry.timestamp ?? Date.now() });
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("devhub:history", { detail: next }));
  void fetch("/api/history", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(next[0]) });
}

export function parseCompareParams(params: URLSearchParams) {
  const type: EntityType = params.get("type") === "repository" ? "repository" : "developer";
  const valid = (value: string) =>
    type === "developer"
      ? /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value)
      : /^[\w.-]+\/[\w.-]+$/.test(value);
  const a = (params.get("a") ?? "").trim();
  const b = (params.get("b") ?? "").trim();
  return { type, a: valid(a) ? a : "", b: valid(b) ? b : "" };
}
