"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DepthText from "@/components/landing/depth-text";

export function LandingHero() {
  return (
    <section className="hero-devhub">
      <div className="hero-devhub__title" role="img" aria-label="DevHub — open-source signal map">
        <DepthText
          text="DEVHUB"
          layers={30}
          depth={1.9}
          faceColor="#171416"
          depthColor="#861f3d"
          tilt={7.5}
          perspective={900}
          autoOrbit={true}
          smoothing={0.14}
        />
      </div>
      <div className="hero-devhub__copy">
        <span>Search · Compare · Understand</span>
        <Link href="/search">
          Enter the signal map <ArrowRight size={13} />
        </Link>
      </div>
      <span className="hero-devhub__scroll">Scroll to explore</span>
    </section>
  );
}