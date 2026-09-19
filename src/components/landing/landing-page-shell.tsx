"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Particles from "@/components/particles";
import { LandingExperience } from "@/components/landing/landing-experience";
import { LandingLoader } from "@/components/landing/landing-loader";

const SESSION_KEY = "devhub-landing-seen";

const emptySubscribe = () => () => {};

function useHasSeenLanding() {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return Boolean(sessionStorage.getItem(SESSION_KEY));
      } catch {
        return false;
      }
    },
    () => false,
  );
}

export function LandingPageShell() {
  const hasSeen = useHasSeenLanding();
  const [dismissed, setDismissed] = useState(false);
  const [stagedGone, setStagedGone] = useState(false);

  const landingReady = hasSeen || dismissed;
  const overlayGone = hasSeen || stagedGone;

  const handleLoaderComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore storage failures
    }
    setDismissed(true);
    window.setTimeout(() => setStagedGone(true), 700);
  }, []);

  return (
    <main className="devhub-loader-shell" aria-label="DevHub landing">
      <div className={`landing-page-behind ${landingReady ? "is-visible" : ""}`}>
        <LandingExperience />
      </div>

      {!overlayGone && (
        <div
          className={`landing-loader-overlay ${landingReady ? "is-hiding" : ""}`}
        >
          <div className="landing-loader-particles">
            <Particles
              particleColors={["#5ac8ff", "#8c7bff", "#ffffff"]}
              particleCount={140}
              particleSpread={10}
              speed={0.12}
              particleBaseSize={90}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={false}
            />
          </div>

          <LandingLoader onComplete={handleLoaderComplete} />
        </div>
      )}
    </main>
  );
}