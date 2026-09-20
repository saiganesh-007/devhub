"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  savedEntityKey,
  type EntityType,
} from "@/lib/workspace";

type ContextValue = {
  ready: boolean;
  isSaved: (
    type: EntityType,
    identifier: string
  ) => boolean;
  setSaved: (
    type: EntityType,
    identifier: string,
    saved: boolean
  ) => void;
};

const FavouritesContext =
  createContext<ContextValue | null>(null);

export function FavouritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [keys, setKeys] = useState<Set<string>>(
    new Set()
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFavourites() {
      try {
        const [
          developersResponse,
          repositoriesResponse,
        ] = await Promise.all([
          fetch("/api/favourites/developers"),
          fetch("/api/favourites/repositories"),
        ]);

        const developers =
          developersResponse.ok
            ? await developersResponse.json()
            : null;

        const repositories =
          repositoriesResponse.ok
            ? await repositoriesResponse.json()
            : null;

        if (cancelled) {
          return;
        }

        const next = new Set<string>();

        for (const item of developers?.data ?? []) {
          if (!item?.github_username) {
            continue;
          }

          next.add(
            savedEntityKey(
              "developer",
              item.github_username
            )
          );
        }

        for (
          const item of repositories?.data ?? []
        ) {
          if (!item?.full_name) {
            continue;
          }

          next.add(
            savedEntityKey(
              "repository",
              item.full_name
            )
          );
        }

        if (!cancelled) {
          setKeys(next);
        }
     } catch (error) {
  const aborted =
    (error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error &&
      error.name === "AbortError");

  if (cancelled || aborted) {
    return;
  }

  console.error(
    "Failed to load favourites:",
    error
  );
} finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void loadFavourites();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSaved = useCallback(
    (
      type: EntityType,
      identifier: string,
      saved: boolean
    ) => {
      setKeys((current) => {
        const next = new Set(current);

        const key = savedEntityKey(
          type,
          identifier
        );

        if (saved) {
          next.add(key);
        } else {
          next.delete(key);
        }

        return next;
      });
    },
    []
  );

  const value = useMemo<ContextValue>(
    () => ({
      ready,

      isSaved: (
        type: EntityType,
        identifier: string
      ) =>
        keys.has(
          savedEntityKey(
            type,
            identifier
          )
        ),

      setSaved,
    }),
    [keys, ready, setSaved]
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}