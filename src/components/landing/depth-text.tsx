"use client";

import { useEffect, useMemo, useRef } from "react";

type DepthTextProps = {
  text: string;
  layers?: number;
  depth?: number;
  faceColor?: string;
  depthColor?: string;
  tilt?: number;
  perspective?: number;
  autoOrbit?: number;
  smoothing?: number;
};

export function DepthText({
  text,
  layers = 30,
  depth = 2.2,
  faceColor = "#f8fafc",
  depthColor = "#7c3aed",
  tilt = 7.5,
  perspective = 900,
  autoOrbit = 0.5,
  smoothing = 0.14,
}: DepthTextProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  const shadows = useMemo(() => {
    const parts: string[] = [];
    for (let i = 1; i <= layers; i += 1) {
      const offset = i * depth;
      const alpha = Math.max(0, 1 - i / (layers + 4));
      parts.push(
        `${offset}px ${offset * 0.92}px 0 ${shade(depthColor, alpha)}`,
      );
    }
    return parts.join(", ");
  }, [layers, depth, depthColor]);

  useEffect(() => {
    const outer = outerRef.current;
    const el = targetRef.current;
    if (!outer || !el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      el.style.transform = `rotateX(${tilt}deg)`;
      return;
    }

    let orby = 0;
    let pointerY = 0;
    let raf = 0;
    let last = performance.now();

    const onMove = (event: PointerEvent) => {
      const rect = outer.getBoundingClientRect();
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onLeave = () => {
      pointerY = 0;
    };

    const loop = (now: number) => {
      const dt = Math.min(1, (now - last) / 1000);
      last = now;
      const idle = Math.sin(now / 900) * autoOrbit;
      const wobble = idle + pointerY * tilt * 0.9;
      orby += (wobble - orby) * (1 - Math.pow(1 - smoothing, dt * 60));
      el.style.transform = `rotateX(${tilt}deg) rotateY(${orby.toFixed(3)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    outer.addEventListener("pointermove", onMove);
    outer.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      outer.removeEventListener("pointermove", onMove);
      outer.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [tilt, autoOrbit, smoothing]);

  return (
    <div ref={outerRef} style={{ perspective }} className="depth-text">
      <div ref={targetRef} className="depth-text__inner" style={{ transformStyle: "preserve-3d" }}>
        <span
          className="depth-text__glyph"
          style={{ color: faceColor, textShadow: shadows }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

function shade(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((v) => v + v).join("") : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}