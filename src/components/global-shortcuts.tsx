"use client";

import { useEffect } from "react";

/**
 * Global search shortcut: Ctrl/⌘+K focuses the global search input
 * wherever it exists. Never navigates on its own.
 */
export function GlobalShortcuts() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier || event.key.toLowerCase() !== "k") return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement &&
        target.classList.contains("global-search-input")
      ) {
        return;
      }
      const input = document.querySelector<HTMLInputElement>(
        ".global-search-input",
      );
      if (!input) return;
      event.preventDefault();
      input.focus();
      input.select?.();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
