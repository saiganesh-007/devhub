"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { DevhubCatBadge } from "@/components/brand";

type LandingLoaderProps = {
  onComplete?: () => void;
};

/**
 * Final loader reference: official DevHub cat paints the loading bar.
 *
 * Real bug fixed here (not a timeout):
 * - previous loader started its orbit timeline immediately while three
 *   ~500KB chase PNGs were still downloading, so the visible chase only
 *   appeared for a fraction of a second on cold cache;
 * - the completion callback was an unstable inline arrow in the shell, so
 *   `useEffect [onComplete]` restarted the timeline on every parent render;
 * - only the inner scene faded while the opaque overlay stayed mounted and
 *   blocked the landing.
 * This loader uses lightweight inline SVG (no PNG wait), a stable callback
 * ref, and drives bar fill from the same progress value as the brush so the
 * brush visibly causes the fill. The shell owns overlay unmount/exit.
 */
export function LandingLoader({ onComplete }: LandingLoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const catRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const brushRef = useRef<HTMLDivElement | null>(null);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const root = rootRef.current;
    const cat = catRef.current;
    const fill = fillRef.current;
    const glow = glowRef.current;
    const brushArm = brushRef.current;
    if (!root || !cat || !fill) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 0, y: 14 });
      gsap.set(cat, { x: 0, y: 0, rotation: 0 });
      gsap.set(fill, { scaleX: 0, transformOrigin: "0 50%" });
      if (glow) gsap.set(glow, { opacity: 0 });
      if (brushArm) gsap.set(brushArm, { rotation: 0, transformOrigin: "20% 15%" });

      const progress = { t: 0 };
      const paintDuration = reduceMotion ? 1.1 : 2.35;

      const track = root.querySelector<HTMLElement>(".loader-track");
      const travel = () => {
        if (!track || !cat) return 0;
        const w = track.clientWidth;
        // Keep the brush tip inside the track with small insets.
        return Math.max(0, w - 8);
      };

      const applyFrame = () => {
        const t = gsap.utils.clamp(0, 1, progress.t);
        const distance = travel();
        const x = -distance / 2 + t * distance;
        const bob = reduceMotion ? 0 : Math.sin(t * Math.PI * 6) * 3.5;
        const lean = reduceMotion ? 0 : Math.sin(t * Math.PI * 4) * 1.6;
        const dab = reduceMotion ? 0 : Math.sin(t * Math.PI * 12) * 5;
        gsap.set(cat, { x, y: bob, rotation: lean });
        gsap.set(fill, { scaleX: t });
        if (brushArm) gsap.set(brushArm, { rotation: 8 + dab });
      };

      const tl = gsap.timeline({
        onComplete: () => completeRef.current?.(),
      });

      tl.to(root, { autoAlpha: 1, y: 0, duration: reduceMotion ? 0.3 : 0.45, ease: "power2.out" }, 0);
      tl.to(progress, {
        t: 1,
        duration: paintDuration,
        ease: "power1.inOut",
        onUpdate: applyFrame,
        onStart: applyFrame,
      }, 0.35);
      // Completion beat: hold the finished bar, let the fill glow and the
      // cat lift the brush before the shell crossfades into landing.
      tl.to(glow ?? {}, { opacity: 1, duration: 0.35, ease: "power1.out" }, "-=0.35");
      if (!reduceMotion) {
        tl.to(cat, { y: "-=9", duration: 0.22, ease: "power2.out" }, "-=0.3");
        tl.to(cat, { y: "+=9", duration: 0.3, ease: "sine.inOut" }, "-=0.08");
        if (brushArm) {
          tl.to(brushArm, { rotation: -14, duration: 0.32, ease: "power2.out" }, "-=0.38");
        }
      }
      tl.to({}, { duration: reduceMotion ? 0.15 : 0.42 });
      tl.to(root, {
        autoAlpha: 0,
        y: -14,
        filter: "blur(10px)",
        duration: 0.55,
        ease: "power2.inOut",
      });

      applyFrame();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="devhub-loader-scene" role="status" aria-live="polite" aria-label="Loading DevHub">
      <div className="loader-paint-stage">
        <div className="loader-brand">
          <DevhubCatBadge size={40} priority />
          <span className="loader-brand-word">DEVHUB</span>
        </div>

        <div className="loader-bar-wrap">
          <div ref={catRef} className="loader-cat" aria-hidden="true">
            <div ref={brushRef} className="loader-brush-arm">
              <svg className="loader-cat-svg" viewBox="0 0 148 132" role="presentation">
                {/* brush behind paw so bristle meets the bar */}
                <g className="brush">
                  <rect x="96" y="52" width="10" height="52" rx="5" transform="rotate(24 101 78)" fill="#c9b48a" />
                  <rect x="93" y="44" width="14" height="10" rx="2" transform="rotate(24 100 49)" fill="#9aa7b8" />
                  <path d="M88 30 L104 36 L97 52 L84 46 Z" fill="#5ac8ff" />
                </g>
                {/* body */}
                <ellipse cx="62" cy="108" rx="30" ry="18" fill="#0b1526" stroke="rgba(90,200,255,0.28)" strokeWidth="1.5" />
                {/* arm to brush */}
                <path d="M78 96 C90 90 96 80 100 66" stroke="#0b1526" strokeWidth="13" strokeLinecap="round" fill="none" />
                <path d="M78 96 C90 90 96 80 100 66" stroke="rgba(90,200,255,0.25)" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.35" />
                <circle cx="100" cy="64" r="8.5" fill="#0b1526" stroke="rgba(90,200,255,0.3)" strokeWidth="1.5" />
                {/* head */}
                <path d="M28 52 L24 18 L52 32 Z" fill="#0b1526" stroke="rgba(90,200,255,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M96 52 L100 18 L72 32 Z" fill="#0b1526" stroke="rgba(90,200,255,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M32 44 L30 26 L46 35 Z" fill="#5ac8ff" opacity="0.85" />
                <path d="M92 44 L94 26 L78 35 Z" fill="#5ac8ff" opacity="0.85" />
                <rect x="18" y="34" width="88" height="62" rx="30" fill="#0b1526" stroke="rgba(90,200,255,0.3)" strokeWidth="1.5" />
                <ellipse cx="62" cy="66" rx="34" ry="22" fill="#f4f7fb" />
                <ellipse cx="48" cy="64" rx="6.5" ry="9" fill="#0b1526" />
                <ellipse cx="76" cy="64" rx="6.5" ry="9" fill="#0b1526" />
                <circle cx="50" cy="61" r="1.8" fill="#fff" />
                <circle cx="78" cy="61" r="1.8" fill="#fff" />
                <circle cx="62" cy="74" r="2.4" fill="#0b1526" />
                <path d="M57 79 Q62 83 67 79" stroke="#0b1526" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                {/* whiskers */}
                <path d="M20 68 L4 64 M21 74 L6 74" stroke="rgba(244,247,251,0.55)" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M104 68 L120 64 M103 74 L118 74" stroke="rgba(244,247,251,0.55)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="loader-track" aria-hidden="true">
            <div ref={fillRef} className="loader-fill" />
            <div className="loader-fill-hatch" />
            <div ref={glowRef} className="loader-fill-glow" />
          </div>
        </div>

        <p className="loader-caption">Painting your workspace</p>
      </div>
    </div>
  );
}