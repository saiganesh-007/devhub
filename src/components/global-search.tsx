"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Command,
  LoaderCircle,
  Search,
  User,
} from "lucide-react";

import type {
  GitHubRepo,
  GitHubUser,
} from "@/types/github";

import { useFavourites } from "@/components/favourites-provider";

import {
  mergeSuggestions,
  readLocalHistory,
  type WorkspaceSuggestion,
} from "@/lib/workspace";

type Suggestion = WorkspaceSuggestion;

const commands = [
  {
    label: "Go to Search",
    href: "/search",
  },
  {
    label: "Go to Compare",
    href: "/compare",
  },
  {
    label: "Go to Saved",
    href: "/favourites",
  },
  {
    label: "Go to Dashboard",
    href: "/dashboard",
  },
  {
    label: "Go to Settings",
    href: "/settings",
  },
];

export function GlobalSearch() {
  const router = useRouter();
  const favourites = useFavourites();

  const input =
    useRef<HTMLInputElement>(null);

  const request = useRef(0);

  const [open, setOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<Suggestion[]>([]);

  const [local, setLocal] =
    useState<Suggestion[]>([]);

  const [active, setActive] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Keyboard shortcuts.
   */
  useEffect(() => {
    const onKey = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      const typing = target?.matches(
        "input, textarea, select, [contenteditable=true]"
      );

      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        setOpen(true);

        queueMicrotask(() =>
          input.current?.focus()
        );
      } else if (
        event.key === "/" &&
        !typing
      ) {
        event.preventDefault();

        setOpen(true);

        queueMicrotask(() =>
          input.current?.focus()
        );
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKey
      );
  }, []);

  /*
   * Load saved + recent suggestions when the
   * command search opens.
   *
   * No AbortController: stale/unmounted requests
   * simply have their results ignored.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const browserHistory =
      readLocalHistory().flatMap(
        (event): Suggestion[] => {
          if (
            !event.entityType ||
            event.kind === "search"
          ) {
            return [];
          }

          return [
            {
              type: event.entityType,
              id: event.identifier,
              label:
                event.label ||
                event.identifier,
              detail:
                event.kind ===
                "comparison"
                  ? "Recent comparison"
                  : "Recent view",
            },
          ];
        }
      );

    async function loadLocal() {
      try {
        const [
          developersResponse,
          repositoriesResponse,
          historyResponse,
        ] = await Promise.all([
          fetch(
            "/api/favourites/developers"
          ),
          fetch(
            "/api/favourites/repositories"
          ),
          fetch("/api/history"),
        ]);

        const developers =
          developersResponse.ok
            ? await developersResponse.json()
            : null;

        const repositories =
          repositoriesResponse.ok
            ? await repositoriesResponse.json()
            : null;

        const history =
          historyResponse.ok
            ? await historyResponse.json()
            : null;

        if (cancelled) {
          return;
        }

        const saved: Suggestion[] = [
          ...(developers?.data ?? []).map(
            (
              item: Record<
                string,
                unknown
              >
            ): Suggestion => ({
              type: "developer",
              id: String(
                item.github_username
              ),
              label: String(
                item.developer_name ||
                  item.github_username
              ),
              detail: "Saved developer",
              avatar: item.avatar_url
                ? String(item.avatar_url)
                : undefined,
              saved: true,
            })
          ),

          ...(repositories?.data ??
            []).map(
            (
              item: Record<
                string,
                unknown
              >
            ): Suggestion => ({
              type: "repository",
              id: String(
                item.full_name
              ),
              label: String(
                item.full_name
              ),
              detail: `${
                item.language ||
                "Repository"
              } · Saved`,
              saved: true,
            })
          ),
        ];

        const persisted: Suggestion[] = (
          history?.data ?? []
        ).flatMap(
          (
            event: Record<
              string,
              unknown
            >
          ): Suggestion[] => {
            if (!event.entity_type) {
              return [];
            }

            return [
              {
                type:
                  event.entity_type as
                    | "developer"
                    | "repository",
                id: String(
                  event.entity_identifier
                ),
                label: String(
                  event.label ||
                    event.entity_identifier
                ),
                detail:
                  event.event_type ===
                  "comparison"
                    ? "Recent comparison"
                    : "Recent",
              },
            ];
          }
        );

        setLocal(
          mergeSuggestions(
            saved,
            [
              ...persisted,
              ...browserHistory,
            ],
            "",
            10
          )
        );
      } catch {
        if (!cancelled) {
          setLocal(browserHistory);
        }
      }
    }

    void loadLocal();

    return () => {
      cancelled = true;
    };
  }, [open]);

  /*
   * Remote GitHub autocomplete.
   *
   * Request ID + cancellation flag protect against
   * stale query responses without aborting fetch().
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const value = query.trim();

    if (value.length < 2) {
      request.current += 1;

      const clear =
        window.setTimeout(() => {
          setResults([]);
          setLoading(false);
          setError("");
          setActive(0);
        }, 0);

      return () =>
        window.clearTimeout(clear);
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

        try {
          const [
            usersResponse,
            repositoriesResponse,
          ] = await Promise.all([
            fetch(
              `/api/github/users/search?q=${encodeURIComponent(
                value
              )}&page=1`
            ),

            fetch(
              `/api/github/repositories/search?q=${encodeURIComponent(
                value
              )}&page=1`
            ),
          ]);

          const [
            users,
            repos,
          ] = await Promise.all([
            usersResponse.json(),
            repositoriesResponse.json(),
          ]);

          if (
            cancelled ||
            id !== request.current
          ) {
            return;
          }

          if (
            !usersResponse.ok &&
            !repositoriesResponse.ok
          ) {
            throw new Error(
              "Search is temporarily unavailable"
            );
          }

          const developers = (
            users?.data?.items ?? []
          )
            .slice(0, 4)
            .map(
              (
                user: GitHubUser
              ): Suggestion => ({
                type: "developer",
                id: user.login,
                label:
                  user.name ||
                  user.login,
                detail: `@${user.login}`,
                avatar:
                  user.avatar_url,
              })
            );

          const repositories = (
            repos?.data?.items ?? []
          )
            .slice(0, 4)
            .map(
              (
                repo: GitHubRepo
              ): Suggestion => ({
                type: "repository",
                id:
                  repo.full_name ||
                  repo.name,
                label:
                  repo.full_name ||
                  repo.name,
                detail:
                  repo.language ||
                  "Repository",
              })
            );

          setResults([
            ...developers,
            ...repositories,
          ]);

          setActive(0);
        } catch {
          if (
            !cancelled &&
            id === request.current
          ) {
            setError(
              "Search is temporarily unavailable"
            );
          }
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
  }, [open, query]);

  const select = (
    suggestion: Suggestion
  ) => {
    const href =
      suggestion.type === "developer"
        ? `/developer/${suggestion.id}`
        : `/repository/${suggestion.id}`;

    setOpen(false);
    setQuery("");

    router.push(href);
  };

  const shownCommands = query
    ? commands.filter((item) =>
        item.label
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
      )
    : commands;

  const displayed =
    mergeSuggestions(
      local,
      results,
      query,
      10
    );

  const count =
    displayed.length +
    shownCommands.length;

  return (
    <div className="relative w-full max-w-2xl">
      <button
        type="button"
        className="search-shortcut w-full"
        onClick={() => {
          setOpen(true);

          queueMicrotask(() =>
            input.current?.focus()
          );
        }}
      >
        <Search size={16} />

        <span className="truncate">
          Search developers,
          repositories, or commands
        </span>

        <kbd className="search-shortcut__action">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 p-4 pt-[12vh]"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
        >
          <div
            className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-line bg-background shadow-elevated"
            role="dialog"
            aria-label="Global search"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search
                size={18}
                className="text-ink3"
              />

              <input
                ref={input}
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search GitHub or run a command…"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="global-results"
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setOpen(false);
                  }

                  if (
                    event.key ===
                    "ArrowDown"
                  ) {
                    event.preventDefault();

                    setActive((index) =>
                      Math.min(
                        index + 1,
                        Math.max(
                          0,
                          count - 1
                        )
                      )
                    );
                  }

                  if (
                    event.key ===
                    "ArrowUp"
                  ) {
                    event.preventDefault();

                    setActive((index) =>
                      Math.max(
                        index - 1,
                        0
                      )
                    );
                  }

                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();

                    if (
                      displayed[active]
                    ) {
                      select(
                        displayed[
                          active
                        ]
                      );

                      return;
                    }

                    const command =
                      shownCommands[
                        active -
                          displayed.length
                      ];

                    if (command) {
                      setOpen(false);
                      setQuery("");

                      router.push(
                        command.href
                      );
                    }
                  }
                }}
              />

              {loading ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Command
                  size={16}
                  className="text-ink3"
                />
              )}
            </div>

            <div
              id="global-results"
              role="listbox"
              className="max-h-[60vh] overflow-y-auto p-2"
            >
              {error && (
                <p
                  className="p-4 text-sm text-err"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {!query &&
                displayed.length >
                  0 && (
                  <p className="px-3 py-2 text-metadata">
                    Saved & recent
                  </p>
                )}

              {displayed.map(
                (item, index) => (
                  <button
                    type="button"
                    key={`${item.type}:${item.id}`}
                    role="option"
                    aria-selected={
                      active === index
                    }
                    onMouseEnter={() =>
                      setActive(index)
                    }
                    onClick={() =>
                      select(item)
                    }
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${
                      active === index
                        ? "bg-panel"
                        : "hover:bg-panel"
                    }`}
                  >
                    {item.type ===
                      "developer" &&
                    item.avatar ? (
                      <Image
                        src={item.avatar}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 rounded-full"
                      />
                    ) : item.type ===
                      "developer" ? (
                      <User size={18} />
                    ) : (
                      <BookOpen
                        size={18}
                      />
                    )}

                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-ink">
                        {item.label}
                      </strong>

                      <small className="block truncate text-ink3">
                        {item.type} ·{" "}
                        {item.detail}
                        {favourites?.isSaved(
                          item.type,
                          item.id
                        )
                          ? " · Saved"
                          : ""}
                      </small>
                    </span>
                  </button>
                )
              )}

              {!query && (
                <p className="px-3 py-2 text-metadata">
                  Commands
                </p>
              )}

              {shownCommands.map(
                (item, index) => {
                  const position =
                    displayed.length +
                    index;

                  return (
                    <button
                      type="button"
                      key={item.href}
                      role="option"
                      aria-selected={
                        active ===
                        position
                      }
                      onMouseEnter={() =>
                        setActive(
                          position
                        )
                      }
                      onClick={() => {
                        setOpen(false);
                        setQuery("");

                        router.push(
                          item.href
                        );
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm text-ink ${
                        active ===
                        position
                          ? "bg-panel"
                          : "hover:bg-panel"
                      }`}
                    >
                      <Command
                        size={16}
                        className="text-brand1"
                      />

                      {item.label}
                    </button>
                  );
                }
              )}

              {query.length === 1 && (
                <p className="p-4 text-sm text-ink3">
                  Type one more character
                  to search GitHub.
                </p>
              )}

              {query.length >= 2 &&
                !loading &&
                !error &&
                !displayed.length &&
                !shownCommands.length && (
                  <p className="p-4 text-sm text-ink3">
                    No matching developers,
                    repositories, or
                    commands.
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}