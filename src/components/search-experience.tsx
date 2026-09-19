"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Clock3,
  GitFork,
  LoaderCircle,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import type { GitHubRepo, GitHubUser } from "@/types/github";
import { compactNumber, formatDate } from "@/lib/analytics";
import { ErrorCard, SearchField, Tabs } from "@/components/ui";

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
  const request = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const id = ++request.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchPage(mode, query, 1);
        if (id !== request.current) return;
        setItems(result.items);
        setTotal(result.total_count);
        setPage(1);
      } catch (e) {
        if (id === request.current)
          setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        if (id === request.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, mode]);

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
      const result = await fetchPage(mode, query, next);
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
    <div>
      <div className="card-surface overflow-hidden rounded-2xl">
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
          <span>GitHub REST / live</span>
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
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">
                Try
              </p>
              <ul className="mt-4 space-y-1.5">
                {suggestions[mode].map((x) => (
                  <li key={x}>
                    <button
                      onClick={() => setQuery(x)}
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

        {!loading && items.length > 0 && (
          <ul className="card-surface divide-y divide-line overflow-hidden rounded-2xl">
            {items.map((item) =>
              "login" in item ? (
                <DeveloperRow key={item.id} item={item} />
              ) : (
                <RepositoryRow key={item.id} item={item} />
              ),
            )}
          </ul>
        )}

        {items.length < total && items.length > 0 && (
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

async function fetchPage(mode: Mode, query: string, page: number) {
  const base =
    mode === "developers"
      ? "/api/github/users/search"
      : "/api/github/repositories/search";
  const res = await fetch(
    `${base}?q=${encodeURIComponent(query)}&page=${page}`,
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Search failed");
  return body.data as { items: Item[]; total_count: number };
}

function DeveloperRow({ item }: { item: GitHubUser }) {
  return (
    <li>
      <Link
        href={`/developer/${item.login}`}
        className="group grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-panel sm:px-6"
      >
        <Image
          src={item.avatar_url}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full border border-line object-cover"
        />
        <span className="min-w-0">
          <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-brand1">
            Developer
          </span>
          <span className="mt-0.5 block truncate font-medium text-ink">
            {item.name || item.login}
          </span>
          <span className="block truncate text-sm text-ink3">@{item.login}</span>
        </span>
        <Users size={16} className="hidden text-ink3 sm:block" />
        <ChevronRight
          size={16}
          className="text-ink3 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

function RepositoryRow({ item }: { item: GitHubRepo }) {
  return (
    <li>
      <Link
        href={`/repository/${item.full_name}`}
        className="group grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-panel sm:px-6"
      >
        <span className="grid size-12 place-items-center rounded-xl border border-line bg-panel text-brand2">
          <BookOpen size={20} />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-brand2">
            Repository
          </span>
          <span className="mt-0.5 block truncate font-medium text-ink">
            {item.full_name}
          </span>
          {item.description && (
            <span className="block truncate text-sm text-ink3">
              {item.description}
            </span>
          )}
        </span>
        <span className="hidden gap-4 font-mono text-[10px] text-ink3 sm:flex">
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="text-brand3" />
            {compactNumber(item.stargazers_count)}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork size={12} />
            {compactNumber(item.forks_count)}
          </span>
          {item.language && <span>{item.language}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} />
            {formatDate(item.updated_at)}
          </span>
        </span>
        <ChevronRight
          size={16}
          className="text-ink3 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

function SearchSkeleton() {
  return (
    <div aria-label="Loading search results" className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="card-surface flex items-center gap-4 rounded-2xl px-6 py-5"
        >
          <div className="skeleton size-12 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-3 max-w-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}