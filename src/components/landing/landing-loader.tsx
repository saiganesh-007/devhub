"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type LandingLoaderProps = {
  onComplete?: () => void;
};

const STATUS_MESSAGES = [
  "reading repositories...",
  "mapping developers...",
  "connecting signals...",
  "preparing intelligence...",
] as const;

const STAGES = ["DISCOVER", "UNDERSTAND", "COMPARE"] as const;

/**
 * White + wine DevHub loading screen (reference: clean centered brand,
 * thin 3-checkpoint track, tiny running mascot pinned above the fill).
 *
 * Motion is intentionally dependency-free: one rAF loop drives the fill
 * scale, the runner's left offset, the active checkpoint, and the cycling
 * status line from a single `t` (0 → 1). Entrance choreography
 * (logo → wordmark → sub → track → cat) is pure CSS with fixed delays so
 * first paint matches the designed sequence without JS timing drift.
 *
 * The runner reuses OUR mascot asset (`/brand/cat-mark.png`, same artwork
 * as the centered badge) at 30–44px with a CSS bob + speed streaks, so it
 * reads as running while staying pinned to the progress position.
 * A `hue-rotate` filter shifts the artwork's cool edge-light toward the
 * wine accent; the silhouette itself is untouched.
 */
export function LandingLoader({ onComplete }: LandingLoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const runnerRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const completeRef = useRef(onComplete);
  const [stage, setStage] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const runner = runnerRef.current;
    const fill = fillRef.current;
    if (!runner || !fill) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduceMotion ? 1100 : 2400;
    const HOLD = reduceMotion ? 150 : 180;

    let raf = 0;
    let paintRaf = 0;
    let holdId: number | undefined;
    let cancelled = false;
    let finished = false;
    let lastStage = -1;
    let lastStatus = -1;
    // Rendered milliseconds, accumulated from clamped per-frame deltas.
    // Wall-clock stalls (cold hydration, font/image fetch, blocked main
    // thread) pause the show instead of fast-forwarding through it, so a
    // fresh URL entry always plays the full sequence after mounting.
    let lastTick = -1;
    let played = 0;

    const finish = () => {
      // Local per-mount guard only: StrictMode remounts get a fresh effect
      // scope, so completion can never be poisoned by a prior cleanup.
      if (cancelled || finished) return;
      finished = true;
      completeRef.current?.();
    };

    const frame = (now: number) => {
      if (lastTick < 0) lastTick = now;
      const dt = Math.min(Math.max(0, now - lastTick), 64);
      lastTick = now;
      played += dt;

      const raw = Math.min(1, played / DURATION);
      // Gentle ease so the cat launches and settles without a hard stop.
      const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

      runner.style.left = `${t * 100}%`;
      fill.style.transform = `scaleX(${t})`;

      const nextStage = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
      if (nextStage !== lastStage) {
        lastStage = nextStage;
        setStage(nextStage);
      }
      const nextStatus = Math.min(
        STATUS_MESSAGES.length - 1,
        Math.floor(played / 650) % STATUS_MESSAGES.length
      );
      if (nextStatus !== lastStatus) {
        lastStatus = nextStatus;
        setStatusIndex(nextStatus);
      }

      if (raw < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        holdId = window.setTimeout(finish, HOLD);
      }
    };

    // Start ticking only after first paint so t=0 is actually visible
    // instead of elapsing while the browser is still painting.
    paintRaf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(frame);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(paintRaf);
      if (holdId !== undefined) window.clearTimeout(holdId);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="devhub-loader-scene"
      role="status"
      aria-live="polite"
      aria-label="Loading DevHub"
    >
      <div className="dh-loader">
        {/* Brand: circular mascot badge, DEVHUB wordmark, subline */}
        <div className="dh-loader-brand dh-enter dh-enter-1">
          <span className="dh-loader-badge" aria-hidden="true">
            <Image
              src="/brand/cat-mark.png"
              alt=""
              width={224}
              height={224}
              priority
              draggable={false}
              className="dh-loader-badge-img"
            />
          </span>
          <p className="dh-loader-wordmark" aria-label="DevHub">
            <span className="dh-word-dev">DEV</span>
            <span className="dh-word-hub">HUB</span>
          </p>
          <p className="dh-loader-sub">OPEN-SOURCE INTELLIGENCE</p>
        </div>

        {/* Progress track with 3 checkpoints + runner pinned above */}
        <div className="dh-loader-trackzone dh-enter dh-enter-4">
          <div className="dh-loader-rail" aria-hidden="true">
            <div className="dh-loader-rail-base" />
            <div ref={fillRef} className="dh-loader-rail-fill" />
            {STAGES.map((label, i) => (
              <span
                key={label}
                className={`dh-loader-dot ${stage >= i ? "is-active" : ""} ${
                  i === 0 ? "is-first" : ""
                } ${i === 1 ? "is-mid" : ""} ${i === 2 ? "is-last" : ""}`}
              />
            ))}
            <div ref={runnerRef} className="dh-loader-runner">
              <span className="dh-runner-streaks" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <Image
                src="/brand/cat-mark.png"
                alt=""
                width={88}
                height={88}
                priority
                draggable={false}
                className="dh-runner-img"
              />
            </div>
          </div>

          <div className="dh-loader-labels" aria-hidden="true">
            {STAGES.map((label, i) => (
              <span key={label} className={`dh-loader-label ${stage >= i ? "is-active" : ""}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Cycling status line — the cat + track carry the progress */}
        <p className="dh-loader-status dh-enter dh-enter-5" aria-hidden="true">
          {STATUS_MESSAGES[statusIndex]}
          <span className="dh-loader-caret">|</span>
        </p>
      </div>
    </div>
  );
}
