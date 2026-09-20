"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  LoaderCircle,
  Search,
  User,
} from "lucide-react";

import type {
  GitHubRepo,
  GitHubUser,
} from "@/types/github";

import {
  mergeSuggestions,
  type EntityType,
  type WorkspaceSuggestion,
} from "@/lib/workspace";

type Props = {
  label: string;
  type: EntityType;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder: string;
};

export function EntityAutocomplete({
  label,
  type,
  value,
  onChange,
  onSelect,
  placeholder,
}: Props) {
  const [local, setLocal] = useState<
    WorkspaceSuggestion[]
  >([]);

  const [remote, setRemote] = useState<
    WorkspaceSuggestion[]
  >([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(0);

  const request = useRef(0);

  /*
   * Load saved + recent items.
   *
   * Do not AbortController this request during React
   * cleanup. We simply ignore its result if the
   * component/effect has been superseded.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadLocalSuggestions() {
      const favouritePath =
        type === "developer"
          ? "/api/favourites/developers"
          : "/api/favourites/repositories";

      try {
        const [
          favouritesResponse,
          historyResponse,
        ] = await Promise.all([
          fetch(favouritePath),
          fetch("/api/history"),
        ]);

        const favourites =
          favouritesResponse.ok
            ? await favouritesResponse.json()
            : null;

        const history =
          historyResponse.ok
            ? await historyResponse.json()
            : null;

        if (cancelled) {
          return;
        }

        const saved: WorkspaceSuggestion[] = (
          favourites?.data ?? []
        ).map(
          (
            item: Record<string, unknown>
          ): WorkspaceSuggestion => {
            if (type === "developer") {
              const username = String(
                item.github_username ?? ""
              );

              return {
                type: "developer",
                id: username,
                label: String(
                  item.developer_name ??
                    username
                ),
                detail: "Saved developer",
                avatar: item.avatar_url
                  ? String(item.avatar_url)
                  : undefined,
                saved: true,
              };
            }

            const fullName = String(
              item.full_name ?? ""
            );

            return {
              type: "repository",
              id: fullName,
              label: fullName,
              detail: `${
                item.language || "Repository"
              } · Saved`,
              saved: true,
            };
          }
        );

        const recent: WorkspaceSuggestion[] = (
          history?.data ?? []
        )
          .filter(
            (
              item: Record<string, unknown>
            ) => item.entity_type === type
          )
          .flatMap(
            (
              item: Record<string, unknown>
            ): WorkspaceSuggestion[] => {
              const identifiers = [
                String(
                  item.entity_identifier ?? ""
                ),
                item.secondary_identifier
                  ? String(
                      item.secondary_identifier
                    )
                  : "",
              ].filter(Boolean);

              return identifiers.map(
                (
                  id
                ): WorkspaceSuggestion => ({
                  type,
                  id,
                  label: id,
                  detail:
                    item.event_type ===
                    "comparison"
                      ? "Recent comparison"
                      : "Recent",
                })
              );
            }
          );

        setLocal(
          mergeSuggestions(
            saved,
            recent,
            "",
            12
          )
        );
      } catch {
        // Saved/recent suggestions are optional.
        // Remote search can still work.
        if (!cancelled) {
          setLocal([]);
        }
      }
    }

    void loadLocalSuggestions();

    return () => {
      cancelled = true;
    };
  }, [type]);

  /*
   * Remote autocomplete.
   *
   * Request IDs handle stale results instead of
   * aborting fetches during effect cleanup.
   */
  useEffect(() => {
    const query = value.trim();

    if (query.length < 2) {
      request.current += 1;

      const timer = window.setTimeout(() => {
        setRemote([]);
        setLoading(false);
        setError("");
        setActive(0);
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const id = ++request.current;
    let cancelled = false;

    const timer = window.setTimeout(
      async () => {
        if (cancelled) {
          return;
        }

        setLoading(true);
        setError("");

        const path =
          type === "developer"
            ? "/api/github/users/search"
            : "/api/github/repositories/search";

        try {
          const response = await fetch(
            `${path}?q=${encodeURIComponent(
              query
            )}&page=1`
          );

          const body =
            await response.json();

          if (!response.ok) {
            throw new Error(
              body?.error?.message ||
                "Search failed"
            );
          }

          if (
            cancelled ||
            id !== request.current
          ) {
            return;
          }

          const items:
            | GitHubUser[]
            | GitHubRepo[] =
            body?.data?.items ?? [];

          const suggestions = items
            .slice(0, 8)
            .map(
              (
                item:
                  | GitHubUser
                  | GitHubRepo
              ): WorkspaceSuggestion => {
                if ("login" in item) {
                  return {
                    type: "developer",
                    id: item.login,
                    label:
                      item.name ||
                      item.login,
                    detail: `@${item.login}`,
                    avatar:
                      item.avatar_url,
                  };
                }

                const idValue =
                  item.full_name ||
                  item.name;

                return {
                  type: "repository",
                  id: idValue,
                  label: idValue,
                  detail: `${
                    item.language ||
                    "Repository"
                  } · ${item.stargazers_count.toLocaleString()} stars`,
                };
              }
            );

          setRemote(suggestions);
          setActive(0);
        } catch (cause) {
          if (
            cancelled ||
            id !== request.current
          ) {
            return;
          }

          setError(
            cause instanceof Error
              ? cause.message
              : "Search failed"
          );
        } finally {
          if (
            !cancelled &&
            id === request.current
          ) {
            setLoading(false);
          }
        }
      },
      300
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [type, value]);

  const suggestions = useMemo(
    () =>
      mergeSuggestions(
        local,
        remote,
        value,
        10
      ),
    [local, remote, value]
  );

  const select = (
    item: WorkspaceSuggestion
  ) => {
    onChange(item.id);
    onSelect?.(item.id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <label
        className="text-metadata"
        htmlFor={`${label}-${type}`}
      >
        {label}
      </label>

      <div className="relative mt-2">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3"
        />

        <input
          id={`${label}-${type}`}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();

              setActive((index) =>
                Math.min(
                  index + 1,
                  Math.max(
                    0,
                    suggestions.length - 1
                  )
                )
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();

              setActive((index) =>
                Math.max(index - 1, 0)
              );
            }

            if (
              event.key === "Enter" &&
              suggestions[active]
            ) {
              event.preventDefault();
              select(suggestions[active]);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${label}-${type}-list`}
          className="h-11 w-full rounded-xl border border-line bg-panel pl-9 pr-9 text-sm text-ink outline-none focus:border-brand1"
        />

        {loading && (
          <LoaderCircle
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink3"
          />
        )}
      </div>

      {open &&
        (suggestions.length > 0 ||
          error ||
          loading) && (
          <div
            id={`${label}-${type}-list`}
            role="listbox"
            className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-background p-1 shadow-elevated"
          >
            {error && (
              <p
                className="p-3 text-xs text-err"
                role="alert"
              >
                {error}
              </p>
            )}

            {suggestions.map(
              (item, index) => (
                <button
                  type="button"
                  key={`${item.type}:${item.id}`}
                  role="option"
                  aria-selected={
                    index === active
                  }
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onMouseEnter={() =>
                    setActive(index)
                  }
                  onClick={() =>
                    select(item)
                  }
                  className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left ${
                    index === active
                      ? "bg-panel"
                      : "hover:bg-panel"
                  }`}
                >
                  {item.avatar ? (
                    <Image
                      src={item.avatar}
                      alt=""
                      width={34}
                      height={34}
                      className="size-[34px] rounded-full"
                    />
                  ) : item.type ===
                    "developer" ? (
                    <User size={17} />
                  ) : (
                    <BookOpen size={17} />
                  )}

                  <span className="min-w-0">
                    <strong className="block truncate text-sm text-ink">
                      {item.label}
                    </strong>

                    <small className="block truncate text-ink3">
                      {item.detail}
                    </small>
                  </span>
                </button>
              )
            )}
          </div>
        )}
    </div>
  );
}