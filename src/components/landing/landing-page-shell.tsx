"use client";

import { useState } from "react";
import Particles from "@/components/particles";
import { LandingExperience } from "@/components/landing/landing-experience";
import { LandingLoader } from "@/components/landing/landing-loader";

export function LandingPageShell() {
  const [showLanding, setShowLanding] = useState(false);

  return (
    <main className="devhub-loader-shell" aria-label="Loading screen">
      <div className={`landing-page-behind ${showLanding ? "is-visible" : ""}`}>
        <LandingExperience />
      </div>

      <div className="landing-loader-overlay">
        <div className="landing-loader-particles">
          <Particles
            particleColors={["#ffffff"]}
            particleCount={180}
            particleSpread={10}
            speed={0.15}
            particleBaseSize={90}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        <LandingLoader onComplete={() => setShowLanding(true)} />
      </div>
    </main>
  );
}
