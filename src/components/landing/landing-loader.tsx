"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CatMark } from "@/components/brand";

type LandingLoaderProps = {
  onComplete?: () => void;
};

const milestones = [
  { at: 0, label: "Connecting to the signal map" },
  { at: 0.28, label: "Stretching the canvas" },
  { at: 0.62, label: "Mixing the signals" },
  { at: 0.86, label: "Opening the map" },
] as const;

const BRUSH_SIZE = 40;

export function LandingLoader({ onComplete }: LandingLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    const glow = glowRef.current;
    const brush = brushRef.current;
    const label = labelRef.current;
    const track = trackRef.current;

    if (!root || !fill || !glow || !brush || !label || !track) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      onComplete: () => onComplete?.(),
    });

    milestones.forEach((milestone) => {
      tl.call(
        () => {
          label.textContent = milestone.label;
        },
        undefined,
        reduceMotion ? milestone.at * 0.3 : milestone.at,
      );
    });

    if (reduceMotion) {
      gsap.set([fill, glow], { scaleX: 1 });
      gsap.set(brush, { x: Math.max(0, track.clientWidth - BRUSH_SIZE) });
      tl.to(
        root,
        { autoAlpha: 0, scale: 0.985, duration: 0.45, ease: "power1.in" },
        0.4,
      );
      return;
    }

    gsap.set(brush, { x: 0 });

    const drive = gsap.timeline();

    const position = { t: 0 };
    drive.to(position, {
      t: 1,
      duration: 0.98,
      ease: "power2.inOut",
      onUpdate: () => {
        const maxX = Math.max(0, track.clientWidth - BRUSH_SIZE);
        const tip = position.t * track.clientWidth;
        gsap.set(glow, { x: tip });
        gsap.set(brush, { x: Math.min(tip - BRUSH_SIZE * 0.28, maxX) });
      },
    });

    tl.add(drive, 0.22)
      .fromTo(
        fill,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.98, ease: "power2.inOut" },
        0.22,
      )
      .fromTo(
        glow,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.98, ease: "power2.inOut" },
        0.22,
      )
      .to(brush, { width: 46, duration: 0.1 }, 1.18)
      .to(brush, { width: BRUSH_SIZE, duration: 0.14, ease: "power2.inOut" }, 1.28)
      .to(
        root,
        { autoAlpha: 0, scale: 0.985, duration: 0.5, ease: "power1.in" },
        1.72,
      );

    return () => {
      drive.kill();
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className="devhub-loader-scene"
      aria-live="polite"
      aria-label="Loading DevHub"
    >
      <div className="loading-paint-stage">
        <div className="loading-paint-head">
          <span className="loading-paint-kicker">DevHub</span>
          <p className="loading-paint-label" ref={labelRef}>
            Connecting to the signal map
          </p>
        </div>

        <div className="loading-paint-track" ref={trackRef}>
          <div className="loading-paint-glow" ref={glowRef} />
          <div className="loading-paint-fill" ref={fillRef} />
          <div
            className="loading-paint-brush"
            ref={brushRef}
            style={{ width: BRUSH_SIZE, height: BRUSH_SIZE }}
          >
            <CatMark size={BRUSH_SIZE} />
          </div>
        </div>

        <p className="loading-paint-hint">GitHub signals · context attached</p>
      </div>
    </div>
  );
}