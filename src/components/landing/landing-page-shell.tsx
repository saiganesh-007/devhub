"use client";

import { useCallback, useEffect, useState } from "react";
import Particles from "@/components/particles";
import { LandingExperience } from "@/components/landing/landing-experience";
import { LandingLoader } from "@/components/landing/landing-loader";

const SEEN_KEY = "devhub:loader-seen-v1";

function shouldSkipLoader(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Hard reloads should still show the designed loader; SPA navigation
    // back to "/" within the same tab should not replay it.
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") return false;
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function LandingPageShell() {
  const [loading, setLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayLeaving, setOverlayLeaving] = useState(false);

  useEffect(() => {
    // Defer past first paint so the server-rendered loader matches hydration,
    // then skip replay for in-session SPA navigation back to "/".
    const id = window.setTimeout(() => {
      if (shouldSkipLoader()) {
        setLoading(false);
        setOverlayVisible(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Lock scroll only while the loader covers the page. Landing scrolls
  // normally the moment the loader starts leaving.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("devhub-loader-locked", loading);
    return () => document.body.classList.remove("devhub-loader-locked");
  }, [loading]);

  const handleComplete = useCallback(() => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Session guard is best-effort; loader still exits cleanly.
    }
    // Start the crossfade: landing is already painted underneath, so there
    // is no flash. Unmount the overlay after the CSS exit finishes.
    setOverlayLeaving(true);
    setLoading(false);
    window.setTimeout(() => setOverlayVisible(false), 650);
  }, []);

  return (
    <div className="devhub-loader-shell">
      <div
        className={`landing-page ${loading ? "is-loading" : "is-ready"}`}
        aria-hidden={loading}
        // Prevent keyboard focus landing underneath the opaque loader.
        inert={loading ? true : undefined}
      >
        <LandingExperience ready={!loading} navSuppressed={loading} />
      </div>

      {overlayVisible ? (
        <div className={`landing-loader-overlay ${overlayLeaving ? "is-leaving" : ""}`} aria-hidden={!loading}>
          <div className="landing-loader-particles" aria-hidden="true">
            <Particles
              particleColors={["#5ac8ff", "#8c7bff", "#ffffff"]}
              particleCount={180}
              particleSpread={10}
              speed={0.15}
              particleBaseSize={90}
              moveParticlesOnHover
              alphaParticles={false}
              disableRotation={false}
            />
          </div>

          {loading ? <LandingLoader onComplete={handleComplete} /> : null}
        </div>
      ) : null}
    </div>
  );
}
