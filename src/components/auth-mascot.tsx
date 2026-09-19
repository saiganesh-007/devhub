"use client";

import { useEffect, useRef, useState } from "react";
import { CatMark } from "@/components/brand";

export function AuthMascot() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState<{ x: number; y: number } | null>(null);
  const [focus, setFocus] = useState(false);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      setLook({ x, y });
    };
    const onLeave = () => setLook(null);
    const onPasswordFocus = () => setFocus(true);
    const onPasswordBlur = () => setFocus(false);
    const onError = () => setShake((value) => value + 1);

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    window.addEventListener("devhub:password-focus", onPasswordFocus);
    window.addEventListener("devhub:password-blur", onPasswordBlur);
    window.addEventListener("devhub:auth-error", onError);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("devhub:password-focus", onPasswordFocus);
      window.removeEventListener("devhub:password-blur", onPasswordBlur);
      window.removeEventListener("devhub:auth-error", onError);
    };
  }, []);

  const tilt = look
    ? `rotateY(${9 * look.x}deg) rotateX(${-8 * look.y}deg)`
    : focus
      ? "rotate(-4deg) translateY(6px) scale(.96)"
      : "";

  return (
    <div ref={cardRef} className="flex justify-center">
      <div
        className={`transition-transform duration-200 ease-out ${shake ? "animate-shake" : ""}`}
        style={tilt ? { transform: tilt, transformStyle: "preserve-3d" } : undefined}
        key={shake}
      >
        <CatMark
          size={72}
          className="shadow-[0_14px_40px_-8px_rgba(15,25,47,0.45)]"
        />
      </div>
    </div>
  );
}