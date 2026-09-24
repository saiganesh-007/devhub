"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type DepthTextProps = {
  text?: string;
  layers?: number;
  depth?: number;
  faceColor?: string;
  depthColor?: string;
  tilt?: number;
  pointerTracking?: boolean;
  smoothing?: number;
  perspective?: number;
  autoOrbit?: boolean;
  orbitSpeed?: number;
  fontSize?: string;
  fontWeight?: number | string;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * React Bits DepthText adapted for DevHub hero use only.
 * Layered extrusion + subtle pointer tilt + idle orbit + reduced-motion
 * fallback. Keep off body copy, cards, tables and section headings.
 */
export default function DepthText({
  text = "Elevate",
  layers = 34,
  depth = 2.4,
  faceColor = "#171416",
  depthColor = "#861f3d",
  tilt = 7.5,
  pointerTracking = true,
  smoothing = 0.14,
  perspective = 900,
  autoOrbit = true,
  orbitSpeed = 0.35,
  fontSize = "clamp(3rem, 12vw, 7rem)",
  fontWeight = 900,
  shadow = true,
  className = "",
  style,
}: DepthTextProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const safeLayers = Math.max(2, Math.min(60, Math.round(layers)));

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduceMotion) return;

    let raf = 0;
    let orbitT = 0;
    let last = performance.now();
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      target.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
      target.current.x = 0;
      target.current.y = 0;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (autoOrbit && (!hovering || !pointerTracking)) {
        orbitT += dt * orbitSpeed * Math.PI * 2;
        target.current.x = Math.cos(orbitT) * 0.35;
        target.current.y = Math.sin(orbitT * 0.8) * 0.28;
      }
      current.current.x += (target.current.x - current.current.x) * smoothing * 4;
      current.current.y += (target.current.y - current.current.y) * smoothing * 4;
      const rx = (-current.current.y * tilt).toFixed(3);
      const ry = (current.current.x * tilt).toFixed(3);
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    raf = requestAnimationFrame(tick);

    if (pointerTracking && finePointer) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [pointerTracking, smoothing, tilt, autoOrbit, orbitSpeed]);

  const back = Array.from({ length: safeLayers - 1 }, (_, i) => {
    const t = (i + 1) / safeLayers;
    return (
      <span
        key={i}
        aria-hidden="true"
        className="depth-text-layer"
        style={{
          transform: `translateZ(${-((i + 1) * depth).toFixed(2)}px)`,
          color: depthColor,
          opacity: 0.28 + t * 0.5,
        }}
      >
        {text}
      </span>
    );
  });

  return (
    <div
      ref={wrapRef}
      className={`depth-text ${className}`.trim()}
      style={{ perspective: `${perspective}px`, ...style }}
    >
      <div ref={innerRef} className="depth-text-inner" style={{ fontSize, fontWeight }}>
        {back}
        <span
          className="depth-text-face"
          style={{
            color: faceColor,
            textShadow: shadow ? `0 18px 60px ${depthColor}55, 0 2px 0 rgba(255,255,255,0.25)` : undefined,
          }}
        >
          {text}
        </span>
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}
