"use client";

import NextImage from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type LandingLoaderProps = {
  onComplete?: () => void;
};

export function LandingLoader({ onComplete }: LandingLoaderProps) {
  const jerryRef = useRef<HTMLImageElement | null>(null);
  const tomRef = useRef<HTMLImageElement | null>(null);
  const grabRef = useRef<HTMLImageElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const jerry = jerryRef.current;
    const tom = tomRef.current;
    const grab = grabRef.current;
    const label = labelRef.current;
    const loader = loaderRef.current;

    if (!jerry || !tom || !grab || !label || !loader) {
      return;
    }

    const chaseDuration = reduceMotion ? 1.8 : 3.1;
    const orbitRadiusX = reduceMotion ? 80 : 170;
    const orbitRadiusY = reduceMotion ? 52 : 118;
    const startGap = reduceMotion ? 1.8 : 2.53;
    const endGap = reduceMotion ? 0.4 : 0.26;
    const orbitStart = -0.8;

    const preloadTom = new window.Image();
    const preloadJerry = new window.Image();
    const preloadGrab = new window.Image();
    preloadTom.src = "/loader/chase/tom.png";
    preloadJerry.src = "/loader/chase/jerry.png";
    preloadGrab.src = "/loader/chase/grab.png";

    const root = gsap.timeline({
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
      },
    });

    const phase = { t: 0 };
    const setCharacter = (
      el: HTMLImageElement,
      x: number,
      y: number,
      rotation: number,
      scaleX: number,
      scaleY: number,
      bounce: number,
      alpha = 1
    ) => {
      gsap.set(el, {
        x,
        y: y + bounce,
        rotation,
        scaleX,
        scaleY,
        xPercent: -50,
        yPercent: -50,
        autoAlpha: alpha,
      });
    };

    gsap.set([jerry, tom, label], { autoAlpha: 1 });
    gsap.set(grab, { autoAlpha: 0, x: 0, y: 0, scale: 0.88, xPercent: -50, yPercent: -50 });
    gsap.set(loader, { autoAlpha: 1 });

    const chase = gsap.timeline({ defaults: { ease: "none" } });

    chase.to(phase, {
      t: chaseDuration,
      duration: chaseDuration,
      onUpdate: () => {
        const progress = gsap.utils.clamp(0, 1, phase.t / chaseDuration);
        const curve = 1 - Math.pow(1 - progress, 1.9);
        const currentGap = startGap - (startGap - endGap) * curve;
        const travelAngle = orbitStart + progress * Math.PI * 2;
        const jerryAngle = travelAngle;
        const tomAngle = jerryAngle - currentGap;

        const jerryX = Math.cos(jerryAngle) * orbitRadiusX;
        const jerryY = Math.sin(jerryAngle) * orbitRadiusY;
        const tomX = Math.cos(tomAngle) * orbitRadiusX;
        const tomY = Math.sin(tomAngle) * orbitRadiusY;

        const jerryVelX = -Math.sin(jerryAngle) * orbitRadiusX * (0.95 + progress * 0.4);
        const tomVelX = -Math.sin(tomAngle) * orbitRadiusX * (1 + progress * 0.55);

        const jerryFlip = jerryVelX >= 0 ? 1 : -1;
        const tomFlip = tomVelX >= 0 ? 1 : -1;

        const jerryBounce = Math.sin(phase.t * 16.5) * 5.5;
        const tomBounce = Math.sin(phase.t * 15.5 + 0.9) * 8.5;

        const jerryStretch = 1 + Math.sin(phase.t * 16.5 + 0.8) * 0.038;
        const tomStretch = 1 + Math.sin(phase.t * 15.5 + 1.2) * 0.05;

        const jerryRot = gsap.utils.clamp(-12, 12, (jerryVelX / (orbitRadiusX * 0.8)) * 22);
        const tomRot = gsap.utils.clamp(-12, 12, (tomVelX / (orbitRadiusX * 0.8)) * 24);

        setCharacter(jerry, jerryX, jerryY, jerryRot, jerryFlip, jerryStretch, jerryBounce, 1);
        setCharacter(tom, tomX, tomY, tomRot, tomFlip, tomStretch, tomBounce, 1);

        if (progress > 0.82) {
          const pounce = (progress - 0.82) / 0.18;
          const pounceX = Math.cos(jerryAngle + currentGap * 0.2) * orbitRadiusX * 0.22 * pounce;
          const pounceY = Math.sin(jerryAngle + currentGap * 0.2) * orbitRadiusY * 0.2 * pounce;
          gsap.set(tom, {
            x: tomX + pounceX,
            y: tomY + pounceY - 6,
            scaleX: tomFlip,
            scaleY: 1.06,
            rotation: tomRot - 7,
            xPercent: -50,
            yPercent: -50,
          });
        }
      },
    });

    chase.set(jerry, { autoAlpha: 0 }, chaseDuration * 0.9);
    chase.set(tom, { autoAlpha: 0 }, chaseDuration * 0.9);
    chase.set(grab, { autoAlpha: 1 }, chaseDuration * 0.9);
    chase.to(
      grab,
      {
        duration: 0.22,
        scale: 1.06,
        y: -8,
        ease: "power2.out",
      },
      chaseDuration * 0.9
    );
    chase.to(
      grab,
      {
        duration: 0.42,
        scale: 1,
        y: 0,
        ease: "sine.inOut",
      },
      chaseDuration * 0.9 + 0.12
    );
    chase.to(label, { autoAlpha: 0.4, duration: 0.24 }, chaseDuration * 0.9 + 0.12);
    chase.to(loader, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" }, chaseDuration + 0.1);

    root.add(chase);

    return () => {
      root.kill();
    };
  }, [onComplete]);

  return (
    <div className="devhub-loader-scene" ref={loaderRef} aria-live="polite" aria-label="Loading DevHub">
      <div className="loading-chase">
        <NextImage
          ref={tomRef}
          className="loading-chase__character loading-chase__character--tom"
          src="/loader/chase/tom.png"
          alt=""
          draggable={false}
          unoptimized
          width={320}
          height={220}
        />
        <NextImage
          ref={jerryRef}
          className="loading-chase__character loading-chase__character--jerry"
          src="/loader/chase/jerry.png"
          alt=""
          draggable={false}
          unoptimized
          width={320}
          height={220}
        />
        <NextImage
          ref={grabRef}
          className="loading-chase__character loading-chase__character--grab"
          src="/loader/chase/grab.png"
          alt=""
          draggable={false}
          unoptimized
          width={320}
          height={220}
        />
      </div>

      <div ref={labelRef} className="loading-chase__label">
        LOADING DEVHUB...
      </div>
    </div>
  );
}
