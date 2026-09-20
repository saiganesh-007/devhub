"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Mood = "idle" | "identity" | "password" | "confirm" | "error" | "success";
const copy: Record<Mood, string> = {
  idle: "Your next discovery starts here.",
  identity: "Let’s get you to your workspace.",
  password: "Your secret is safe. I won’t look.",
  confirm: "One more time, just to be sure.",
  error: "Something needs another look. Check the message below.",
  success: "You’re all set. Welcome to DevHub.",
};

export function AuthMascot() {
  const root = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<Mood>("idle");

  useEffect(() => {
    const panel = root.current?.closest(".auth-panel");
    if (!panel) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function focus(event: Event) {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      setMood(input.name === "confirm" ? "confirm" : input.type === "password" ? "password" : "identity");
    }
    function reset() { setMood("idle"); }
    function error() { setMood("error"); }
    function success() { setMood("success"); }
    function move(event: Event) {
      if (motion.matches || !art.current || !(event instanceof PointerEvent)) return;
      const box = panel!.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width - .5));
      art.current.style.transform = `rotate(${x * 6}deg)`;
    }
    function leave() { if (art.current) art.current.style.transform = ""; }
    panel.addEventListener("focusin", focus);
    panel.addEventListener("focusout", reset);
    panel.addEventListener("pointermove", move);
    panel.addEventListener("pointerleave", leave);
    window.addEventListener("devhub:auth-error", error);
    window.addEventListener("devhub:auth-success", success);
    return () => {
      panel.removeEventListener("focusin", focus);
      panel.removeEventListener("focusout", reset);
      panel.removeEventListener("pointermove", move);
      panel.removeEventListener("pointerleave", leave);
      window.removeEventListener("devhub:auth-error", error);
      window.removeEventListener("devhub:auth-success", success);
    };
  }, []);

  return <div ref={root} className="auth-mascot" data-state={mood}>
    <div ref={art} className="auth-mascot-art" aria-hidden="true">
      <Image src="/brand/cat-mark.png" alt="" width={92} height={92} priority />
      <span className="auth-mascot-cover" />
    </div>
    <p className="auth-mascot-status" aria-live="polite">{copy[mood]}</p>
  </div>;
}
