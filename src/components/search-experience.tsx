"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  ChevronRight,
  Clock3,
  GitFork,
  LoaderCircle,
  MapPin,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import type { GitHubRepo, GitHubUser } from "@/types/github";
import { compactNumber, formatDate } from "@/lib/analytics";
import { ErrorCard, SearchField, Tabs } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { addRecentSearch, readLocalHistory, recordLocalHistory, type RecentSearch } from "@/lib/workspace";

type Mode = "developers" | "repositories";
type Item = GitHubUser | GitHubRepo;

const suggestions = {
  developers: ["torvalds", "sindresorhus", "ytbryan", "gaearon", "schacon"],
  repositories: ["vercel/next.js", "facebook/react", "supabase/supabase", "rust-lang/rust"],
} as const;

export function SearchExperience() {
  const [mode, setMode] = useState<Mode>("developers");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"stars" | "forks" | "updated">("stars");
  const [language, setLanguage] = useState("");
  const [owner, setOwner] = useState("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const request = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setRecent(readLocalHistory().filter((item) => item.kind === "search").map((item): RecentSearch => ({ query: item.identifier, type: item.entityType === "repository" ? "repositories" : "developers", timestamp: item.timestamp })).slice(0, 10)), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const id = ++request.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchPage(mode, query, 1, { sort, language, owner });
        if (id !== request.current) return;
        setItems(result.items);
        setTotal(result.total_count);
        setPage(1);
        const entry: RecentSearch = { query: query.trim(), type: mode, timestamp: Date.now() };
        setRecent((current) => addRecentSearch(current, entry));
        recordLocalHistory({ kind: "search", entityType: mode === "developers" ? "developer" : "repository", identifier: query.trim(), metadata: { sort, language, owner } });
      } catch (e) {
        if (id === request.current)
          setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        if (id === request.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, mode, sort, language, owner]);

  function changeMode(value: Mode) {
    request.current++;
    setMode(value);
    setItems([]);
    setTotal(0);
    setError("");
  }

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const result = await fetchPage(mode, query, next, { sort, language, owner });
      setItems((current) => [...current, ...result.items]);
      setPage(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load more results");
    } finally {
      setLoadingMore(false);
    }
  }

  const idle = query.trim().length < 2;

  return (
    <div className="search-experience">
      <div className="search-console">
        <div className="border-b border-line px-4 pt-4 sm:px-6">
          <Tabs
            label="Search scope"
            value={mode}
            onChange={changeMode}
            options={[
              { value: "developers", label: "Developers" },
              { value: "repositories", label: "Repositories" },
            ]}
          />
        </div>

        {mode === "repositories" && <div className="grid gap-3 border-t border-line px-4 py-4 sm:grid-cols-3 sm:px-6"><label className="text-metadata">Sort<select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="mt-1 block h-9 w-full rounded-lg border border-line bg-panel px-2 text-sm text-ink"><option value="stars">Stars</option><option value="forks">Forks</option><option value="updated">Recently updated</option></select></label><label className="text-metadata">Language<input value={language} onChange={(e) => setLanguage(e.target.value)} maxLength={50} placeholder="TypeScript" className="mt-1 block h-9 w-full rounded-lg border border-line bg-panel px-2 text-sm text-ink" /></label><label className="text-metadata">Owner<input value={owner} onChange={(e) => setOwner(e.target.value)} maxLength={39} placeholder="vercel" className="mt-1 block h-9 w-full rounded-lg border border-line bg-panel px-2 text-sm text-ink" /></label></div>}

        <div className="px-4 py-5 sm:px-6">
          <SearchField
            label={`Search ${mode}`}
            value={query}
            onChange={setQuery}
            autoFocus
            loading={loading}
            placeholder={
              mode === "developers"
                ? "Search a GitHub developer"
                : "Search owner, repository, or technology"
            }
            action={
              query
                ? {
                    label: "Clear search",
                    onAction: () => setQuery(""),
                    icon: <X size={16} aria-hidden="true" />,
                  }
                : undefined
            }
          />
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink3 sm:px-7">
          <span>Public GitHub signals</span>
          <span>{total ? `${compactNumber(total)} results` : "Type at least 2 characters"}</span>
        </div>
      </div>

      <div className="mt-8" aria-live="polite">
        {loading && <SearchSkeleton />}

        {error && (
          <ErrorCard
            title={
              /rate limit/i.test(error)
                ? "GitHub rate limit reached"
                : "Search unavailable"
            }
            detail={error}
          />
        )}

        {idle && !loading && (
          <IdleState mode={mode} onSearch={setQuery} recent={recent.filter((item) => item.type === mode)} onClearRecent={() => setRecent((current) => current.filter((item) => item.type !== mode))} />
        )}

        {!idle && !loading && !error && items.length === 0 && (
          <div className="card-surface rounded-2xl p-10 text-center">
            <strong className="block text-sm font-semibold text-ink">
              No matching signals
            </strong>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink3">
              Try a broader name or remove special characters.
            </p>
          </div>
        )}

        {!idle && !error && !loading && items.length > 0 && (
          <div className="search-results">
            {items.map((item) =>
              "login" in item ? (
                <DeveloperCard key={item.id} item={item} />
              ) : (
                <RepositoryCard key={item.id} item={item} />
              ),
            )}
          </div>
        )}

        {!idle && !error && items.length < total && items.length > 0 && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn btn-lg mx-auto mt-6 flex w-full max-w-sm"
          >
            {loadingMore && <LoaderCircle size={16} className="animate-spin" />}
            {loadingMore ? "Loading signals…" : "Load more results"}
          </button>
        )}
      </div>
    </div>
  );
}

async function fetchPage(mode: Mode, query: string, page: number, filters: { sort: string; language: string; owner: string }) {
  const base =
    mode === "developers"
      ? "/api/github/users/search"
      : "/api/github/repositories/search";
  const params = new URLSearchParams({ q: query, page: String(page) });
  if (mode === "repositories") { params.set("sort", filters.sort); if (filters.language.trim()) params.set("language", filters.language.trim()); if (filters.owner.trim()) params.set("owner", filters.owner.trim()); }
  const res = await fetch(`${base}?${params}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Search failed");
  return body.data as { items: Item[]; total_count: number };
}

function DeveloperCard({ item }: { item: GitHubUser }) {
  return (
    <article className="result-row result-row--developer">
      <Link
        href={`/developer/${item.login}`}
        className="group flex gap-4"
      >
        <Image
          src={item.avatar_url}
          alt=""
          width={56}
          height={56}
          className="size-14 rounded-full border border-line object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-brand1">
                Developer
              </span>
              <h3 className="mt-1 truncate font-semibold text-ink group-hover:text-brand1 transition-colors">
                {item.name || item.login}
              </h3>
              <p className="truncate text-sm text-ink3">@{item.login}</p>
            </div>
            <ChevronRight
              size={16}
              className="text-ink3 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </div>

          {item.bio && (
            <p className="mt-3 line-clamp-2 text-sm text-ink2">{item.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink3">
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {item.location}
              </span>
            )}
            {item.company && (
              <span className="flex items-center gap-1">
                <Building2 size={12} />
                {item.company}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 font-mono text-[10px] text-ink3">
            {item.followers !== undefined && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {compactNumber(item.followers)}
              </span>
            )}
            {item.public_repos !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {compactNumber(item.public_repos)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
        <SaveButton
          kind="developers"
          payload={{
            github_username: item.login,
            developer_name: item.name || null,
            avatar_url: item.avatar_url,
          }}
        />
        <Link
          href={`/compare?type=developer&a=${item.login}`}
          className="btn btn-sm btn-secondary"
        >
          Compare
        </Link>
      </div>
    </article>
  );
}

function RepositoryCard({ item }: { item: GitHubRepo }) {
  const owner = item.full_name?.split("/")[0] || "";
  const repoName = item.name;
  
  return (
    <article className="result-row result-row--repository">
      <Link
        href={`/repository/${owner}/${repoName}`}
        className="group flex gap-4"
      >
        <div className="grid size-14 place-items-center rounded-xl border border-line bg-panel text-brand2 shrink-0">
          <BookOpen size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-brand2">
                Repository
              </span>
              <h3 className="mt-1 truncate font-semibold text-ink group-hover:text-brand1 transition-colors">
                {item.full_name}
              </h3>
              {item.description && (
                <p className="mt-2 line-clamp-2 text-sm text-ink2">{item.description}</p>
              )}
            </div>
            <ChevronRight
              size={16}
              className="text-ink3 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[10px] text-ink3">
            {item.language && (
              <span className="flex items-center gap-1">
                <span
                  className="size-2 rounded"
                  style={{ backgroundColor: getLanguageColor(item.language) }}
                />
                {item.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={12} className="text-brand3" />
              {compactNumber(item.stargazers_count)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={12} />
              {compactNumber(item.forks_count)}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 size={12} />
              {formatDate(item.updated_at)}
            </span>
          </div>

          {item.topics && item.topics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="border border-line px-2 py-0.5 font-mono text-[9px] text-ink3"
                >
                  {topic}
                </span>
              ))}
              {item.topics.length > 4 && (
                <span className="font-mono text-[9px] text-ink3">
                  +{item.topics.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
        <SaveButton
          kind="repositories"
          payload={{
            github_repo_id: item.id || 0,
            owner,
            repo_name: repoName,
            full_name: item.full_name,
            description: item.description,
            stars: item.stargazers_count,
            language: item.language,
          }}
        />
        <Link
          href={`/compare?type=repository&a=${item.full_name}`}
          className="btn btn-sm btn-secondary"
        >
          Compare
        </Link>
      </div>
    </article>
  );
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Vue: "#42b883",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Lua: "#000080",
    R: "#198CE7",
    Scala: "#c22d40",
    Haskell: "#5e5086",
    Elixir: "#6e4a7e",
    Clojure: "#db5855",
    ObjectiveC: "#438eff",
    Perl: "#0298c3",
    Dockerfile: "#384d54",
  };
  return colors[language] || "#64748b";
}

function IdleState({ mode, onSearch, recent, onClearRecent }: { mode: Mode; onSearch: (q: string) => void; recent: RecentSearch[]; onClearRecent: () => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="card-surface rounded-2xl p-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full border border-line bg-panel text-brand1">
          <Search size={20} />
        </span>
        <strong className="mt-4 block text-ink">
          One query. Connected context.
        </strong>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink3">
          Search developers or repositories to open a full intelligence
          view.
        </p>
      </div>
      <div className="card-surface rounded-2xl p-6">
        {recent.length > 0 && <><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">Recent searches</p><button type="button" onClick={onClearRecent} className="text-xs text-ink3 hover:text-ink">Clear</button></div><ul className="mt-3 space-y-1">{recent.slice(0, 5).map((item) => <li key={`${item.type}:${item.query}`}><button type="button" onClick={() => onSearch(item.query)} className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink2 hover:bg-panel">{item.query}</button></li>)}</ul><p className="my-4 border-t border-line" /></>}
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">
          Try
        </p>
        <ul className="mt-4 space-y-1.5">
          {suggestions[mode].map((x) => (
            <li key={x}>
              <button
                onClick={() => onSearch(x)}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-ink2 transition-colors hover:bg-panel hover:text-ink"
              >
                {x}
                <ChevronRight
                  size={15}
                  className="text-ink3 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div role="status" aria-label="Loading search results" className="search-results">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="result-row result-row--loading"
        >
          <div className="flex gap-4">
            <div className="skeleton size-14 rounded-full shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-2 w-full max-w-xs" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line skeleton h-8" />
        </div>
      ))}
    </div>
  );
}
