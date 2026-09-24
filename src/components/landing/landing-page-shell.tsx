"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LandingExperience } from "@/components/landing/landing-experience";
import { LandingLoader } from "@/components/landing/landing-loader";

declare global {
  interface Window {
    __DEVHUB_LOADER_PLAYED__?: boolean;
  }
}

/**
 * Landing lifecycle: VISIBLE → RUNNING → COMPLETE → EXITING → UNMOUNTED.
 *
 * The loader is part of the INITIAL render for `/` (state initializer, no
 * waiting for effects), so every new browser document paints it immediately.
 * Replay is gated by a per-document runtime flag — never persisted storage —
 * so a fresh document (new tab, reload, hard refresh, same-tab address-bar
 * entry) always plays the full show, while SPA navigation inside the same
 * document never replays it.
 */
export function LandingPageShell() {
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.__DEVHUB_LOADER_PLAYED__;
  });
  const [exiting, setExiting] = useState(false);
  const unmountRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (unmountRef.current !== undefined) window.clearTimeout(unmountRef.current);
    };
  }, []);

  // Lock scroll only while the loader covers the page. Landing scrolls
  // normally the moment the loader starts leaving.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("devhub-loader-locked", showLoader && !exiting);
    return () => document.body.classList.remove("devhub-loader-locked");
  }, [showLoader, exiting]);

  const handleComplete = useCallback(() => {
    // Mark this document as played BEFORE exiting so no remount or
    // navigation in the same document can replay the full loader.
    try {
      window.__DEVHUB_LOADER_PLAYED__ = true;
    } catch {
      // Flag is best-effort; loader still exits cleanly.
    }
    // Start the crossfade: landing is already painted underneath, so there
    // is no flash. Unmount the overlay after the CSS exit finishes.
    setExiting(true);
    if (unmountRef.current !== undefined) window.clearTimeout(unmountRef.current);
    unmountRef.current = window.setTimeout(() => {
      setShowLoader(false);
    }, 380);
  }, []);

  return (
    <div className="devhub-loader-shell">
      <div
        className={`landing-page ${showLoader && !exiting ? "is-loading" : "is-ready"}`}
        aria-hidden={showLoader && !exiting}
        // Prevent keyboard focus landing underneath the opaque loader.
        inert={showLoader && !exiting ? true : undefined}
      >
        <LandingExperience ready={!showLoader || exiting} navSuppressed={showLoader && !exiting} />
      </div>

      {showLoader ? (
        <div className={`landing-loader-overlay ${exiting ? "is-leaving" : ""}`} aria-hidden={exiting}>
          {!exiting ? <LandingLoader onComplete={handleComplete} /> : null}
        </div>
      ) : null}
    </div>
  );
}
