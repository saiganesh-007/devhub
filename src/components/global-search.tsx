"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Search, X } from "lucide-react";
import type { GitHubRepo, GitHubUser } from "@/types/github";
import { getSearchPrefs } from "@/lib/search-prefs";
import { recordRecentSearch } from "@/lib/recent-searches";
import "./global-search.css";

export type SearchMode = "all" | "developers" | "repositories";

export interface DevSuggestion {
  kind: "developer";
  key: string;
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface RepoSuggestion {
  kind: "repository";
  key: string;
  full_name: string;
  owner: string;
  name: string;
  language: string | null;
}

export type Suggestion = DevSuggestion | RepoSuggestion;

function toDev(item: GitHubUser): DevSuggestion {
  return {
    kind: "developer",
    key: `dev:${item.login.toLowerCase()}`,
    login: item.login,
    name: item.name ?? null,
    avatar_url: item.avatar_url,
  };
}

function toRepo(item: GitHubRepo): RepoSuggestion | null {
  const full = item.full_name ?? (item.owner ? `${item.owner.login}/${item.name}` : item.name);
  if (!full || !full.includes("/")) return null;
  const [owner, ...rest] = full.split("/");
  return {
    kind: "repository",
    key: `repo:${full.toLowerCase()}`,
    full_name: full,
    owner,
    name: rest.join("/") || item.name,
    language: item.language ?? null,
  };
}

async function fetchSuggestions(
  query: string,
  mode: SearchMode,
  maxDevs: number,
  maxRepos: number,
  signal: AbortSignal,
): Promise<Suggestion[]> {
  const prefs = getSearchPrefs();
  const wantDevs =
    (mode === "all" && prefs.includeDevelopers) || mode === "developers";
  const wantRepos =
    (mode === "all" && prefs.includeRepositories) || mode === "repositories";

  const out: Suggestion[] = [];
  const jobs: Promise<void>[] = [];

  if (wantDevs) {
    jobs.push(
      (async () => {
        const res = await fetch(
          `/api/github/users/search?q=${encodeURIComponent(query)}&page=1`,
          { signal },
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message || "Search failed");
        const items = (body?.data?.items ?? []) as GitHubUser[];
        for (const item of items.slice(0, maxDevs)) out.push(toDev(item));
      })(),
    );
  }
  if (wantRepos) {
    jobs.push(
      (async () => {
        const res = await fetch(
          `/api/github/repositories/search?q=${encodeURIComponent(query)}&page=1`,
          { signal },
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message || "Search failed");
        const items = (body?.data?.items ?? []) as GitHubRepo[];
        for (const item of items.slice(0, maxRepos)) {
          const s = toRepo(item);
          if (s) out.push(s);
        }
      })(),
    );
  }

  await Promise.all(jobs);
  // Keep developers first, then repositories — compact grouped dropdown.
  out.sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === "developer" ? -1 : 1,
  );
  return out;
}

export function suggestionHref(s: Suggestion): string {
  return s.kind === "developer"
    ? `/developer/${s.login}`
    : `/repository/${s.full_name}`;
}

export function GlobalSearch({
  mode = "all",
  maxDevelopers = 4,
  maxRepositories = 4,
  placeholder = "Search repositories, developers, topics...",
  autoFocus = false,
  showShortcut = true,
  defaultValue = "",
  onSubmitRaw,
}: {
  mode?: SearchMode;
  maxDevelopers?: number;
  maxRepositories?: number;
  placeholder?: string;
  autoFocus?: boolean;
  showShortcut?: boolean;
  defaultValue?: string;
  onSubmitRaw?: (query: string) => void;
}) {
  const router = useRouter();
  const baseId = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  const listId = `global-search-list-${baseId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  // Ctrl/Cmd+K focuses the input — never navigates on its own.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Click outside closes.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close]);

  // Debounced fetch with cancellation + race guard.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = query.trim();
    const prefs = getSearchPrefs();
    if (!prefs.suggestionsEnabled || trimmed.length < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setLoading(false);
      setActive(-1);
      return;
    }

    setLoading(true);
    const id = ++requestRef.current;
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const result = await fetchSuggestions(
          trimmed,
          mode,
          maxDevelopers,
          maxRepositories,
          controller.signal,
        );
        if (requestRef.current !== id) return;
        setSuggestions(result);
        setActive(result.length > 0 ? 0 : -1);
        setOpen(true);
      } catch {
        if (requestRef.current !== id) return;
        // Keep the dropdown quiet on transient failures.
        setSuggestions([]);
        setActive(-1);
      } finally {
        if (requestRef.current === id) setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, maxDevelopers, maxRepositories]);

  function navigateTo(href: string) {
    const prefs = getSearchPrefs();
    close();
    if (prefs.openInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  }

  function submitRaw() {
    const trimmed = query.trim();
    if (!trimmed) return;
    close();
    const prefs = getSearchPrefs();
    if (prefs.recentHistoryEnabled) recordRecentSearch(trimmed);
    if (onSubmitRaw) {
      onSubmitRaw(trimmed);
      return;
    }
    const target =
      mode === "all"
        ? `/search?q=${encodeURIComponent(trimmed)}`
        : `/search?type=${mode}&q=${encodeURIComponent(trimmed)}`;
    if (prefs.openInNewTab) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else {
      router.push(target);
    }
  }

  function pick(s: Suggestion) {
    navigateTo(suggestionHref(s));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (!open || suggestions.length === 0) return;
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      if (!open || suggestions.length === 0) return;
      event.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      if (open && active >= 0 && suggestions[active]) {
        event.preventDefault();
        pick(suggestions[active]);
      } else {
        event.preventDefault();
        submitRaw();
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
    }
  }

  const devs = suggestions.filter((s) => s.kind === "developer");
  const repos = suggestions.filter((s) => s.kind === "repository");
  const showDropdown = open && query.trim().length >= 1;
  const activeId =
    active >= 0 && suggestions[active]
      ? `global-search-option-${baseId}-${active}`
      : undefined;

  return (
    <div ref={rootRef} className="global-search">
      <div className={`global-search__box${focused ? " is-focused" : ""}`}>
        <span className="global-search__icon" aria-hidden="true">
          <Search size={15} />
        </span>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label="Global search developers and repositories"
          className="global-search__input global-search-input"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (query.trim().length >= 1 && suggestions.length > 0) setOpen(true);
            else if (query.trim().length >= 1) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
        />
        {loading ? (
          <span
            className="global-search__loading-dot"
            aria-hidden="true"
            aria-label="Loading suggestions"
          >
            <i />
            <i />
            <i />
          </span>
        ) : query ? (
          <button
            type="button"
            className="global-search__clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              close();
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : showShortcut ? (
          <kbd className="global-search__kbd" aria-hidden="true">
            ⌘K
          </kbd>
        ) : null}
      </div>

      {showDropdown && (
        <div className="global-search__panel" role="presentation">
          {loading && suggestions.length === 0 ? (
            <div className="global-search__status" role="status">
              <span className="global-search__loading-dot" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Searching…
            </div>
          ) : suggestions.length === 0 && !loading ? (
            <div className="global-search__status" role="status">
              No matching developers or repositories.
            </div>
          ) : (
            <>
              {devs.length > 0 && (
                <>
                  <p className="global-search__group-label" aria-hidden="true">
                    Developers
                  </p>
                  <ul
                    id={listId}
                    role="listbox"
                    aria-label="Developer suggestions"
                    className="global-search__list"
                  >
                    {devs.map((s) => {
                      const idx = suggestions.indexOf(s);
                      return (
                        <li key={s.key} role="presentation">
                          <button
                            type="button"
                            role="option"
                            id={`global-search-option-${baseId}-${idx}`}
                            aria-selected={idx === active}
                            className={`global-search__item${idx === active ? " is-active" : ""}`}
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => pick(s)}
                          >
                            <Image
                              src={s.avatar_url}
                              alt=""
                              width={32}
                              height={32}
                              className="global-search__avatar"
                              style={{ width: 32, height: 32 }}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <span className="global-search__item-text">
                              <span className="global-search__item-title">
                                {s.name || s.login}
                              </span>
                              <span className="global-search__item-sub">
                                @{s.login}
                              </span>
                            </span>
                            <span className="global-search__type">Developer</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              {repos.length > 0 && (
                <>
                  <p className="global-search__group-label" aria-hidden="true">
                    Repositories
                  </p>
                  <ul
                    role="listbox"
                    aria-label="Repository suggestions"
                    className="global-search__list"
                  >
                    {repos.map((s) => {
                      const idx = suggestions.indexOf(s);
                      return (
                        <li key={s.key} role="presentation">
                          <button
                            type="button"
                            role="option"
                            id={`global-search-option-${baseId}-${idx}`}
                            aria-selected={idx === active}
                            className={`global-search__item${idx === active ? " is-active" : ""}`}
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => pick(s)}
                          >
                            <span
                              className="global-search__repo-icon"
                              aria-hidden="true"
                            >
                              <BookOpen size={15} />
                            </span>
                            <span className="global-search__item-text">
                              <span className="global-search__item-title">
                                {s.full_name}
                              </span>
                              <span className="global-search__item-sub">
                                {s.owner}
                                {s.language ? ` · ${s.language}` : ""}
                              </span>
                            </span>
                            <span className="global-search__type">Repository</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              <div className="global-search__hint">
                <span>
                  {loading ? "Updating…" : `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}`}
                </span>
                <span>
                  <kbd>↵</kbd> open
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Single-entity autocomplete combobox for the Compare page.
 * Only real picked results become comparison entities — free text never does.
 */
export function CompareCombobox({
  kind,
  value,
  onPick,
  onTextChange,
  label,
  placeholder,
  excludeKey,
}: {
  kind: "developer" | "repository";
  value: string;
  onPick: (s: Suggestion) => void;
  onTextChange: (text: string) => void;
  label: string;
  placeholder: string;
  excludeKey?: string;
}) {
  const baseId = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  const listId = `compare-combo-list-${baseId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    const trimmed = value.trim();
    const prefs = getSearchPrefs();
    if (!prefs.suggestionsEnabled || trimmed.length < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setLoading(false);
      setActive(-1);
      return;
    }
    setLoading(true);
    const id = ++requestRef.current;
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const result = await fetchSuggestions(
          trimmed,
          kind === "developer" ? "developers" : "repositories",
          5,
          5,
          controller.signal,
        );
        if (requestRef.current !== id) return;
        const filtered = excludeKey
          ? result.filter((s) => s.key !== excludeKey)
          : result;
        setSuggestions(filtered);
        setActive(filtered.length > 0 ? 0 : -1);
        setOpen(true);
      } catch {
        if (requestRef.current !== id) return;
        setSuggestions([]);
        setActive(-1);
      } finally {
        if (requestRef.current === id) setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, kind, excludeKey]);

  function choose(s: Suggestion) {
    onPick(s);
    close();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (!open || suggestions.length === 0) return;
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      if (!open || suggestions.length === 0) return;
      event.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      if (open && active >= 0 && suggestions[active]) {
        event.preventDefault();
        choose(suggestions[active]);
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
    }
  }

  const showDropdown = open && value.trim().length >= 1;
  const activeId =
    active >= 0 && suggestions[active]
      ? `compare-combo-option-${baseId}-${active}`
      : undefined;

  return (
    <div ref={rootRef} className="global-search">
      <label
        htmlFor={`compare-combo-${baseId}`}
        className="field-label"
        style={{ marginBottom: 6 }}
      >
        {label}
      </label>
      <div className={`global-search__box${focused ? " is-focused" : ""}`}>
        <span className="global-search__icon" aria-hidden="true">
          <Search size={15} />
        </span>
        <input
          ref={inputRef}
          id={`compare-combo-${baseId}`}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          className="global-search__input"
          value={value}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          onChange={(e) => {
            onTextChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (value.trim().length >= 1) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
        />
        {loading ? (
          <span className="global-search__loading-dot" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : value ? (
          <button
            type="button"
            className="global-search__clear"
            aria-label={`Clear ${label}`}
            onClick={() => {
              onTextChange("");
              setSuggestions([]);
              close();
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="global-search__panel">
          {loading && suggestions.length === 0 ? (
            <div className="global-search__status" role="status">
              <span className="global-search__loading-dot" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Searching…
            </div>
          ) : suggestions.length === 0 && !loading ? (
            <div className="global-search__status" role="status">
              No matching {kind === "developer" ? "developers" : "repositories"}.
              Select a real result to compare.
            </div>
          ) : (
            <>
              <p className="global-search__group-label" aria-hidden="true">
                {kind === "developer" ? "Developers" : "Repositories"}
              </p>
              <ul
                id={listId}
                role="listbox"
                aria-label={`${label} suggestions`}
                className="global-search__list"
              >
                {suggestions.map((s, idx) => (
                  <li key={s.key} role="presentation">
                    <button
                      type="button"
                      role="option"
                      id={`compare-combo-option-${baseId}-${idx}`}
                      aria-selected={idx === active}
                      className={`global-search__item${idx === active ? " is-active" : ""}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => choose(s)}
                    >
                      {s.kind === "developer" ? (
                        <Image
                          src={s.avatar_url}
                          alt=""
                          width={32}
                          height={32}
                          className="global-search__avatar"
                          style={{ width: 32, height: 32 }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <span className="global-search__repo-icon" aria-hidden="true">
                          <BookOpen size={15} />
                        </span>
                      )}
                      <span className="global-search__item-text">
                        <span className="global-search__item-title">
                          {s.kind === "developer" ? s.name || s.login : s.full_name}
                        </span>
                        <span className="global-search__item-sub">
                          {s.kind === "developer"
                            ? `@${s.login}`
                            : `${s.owner}${s.language ? ` · ${s.language}` : ""}`}
                        </span>
                      </span>
                      <span className="global-search__type">
                        {s.kind === "developer" ? "Developer" : "Repository"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
