"use client";

import { useEffect, useRef, useState } from "react";

type Mood =
  | "idle"
  | "curious"
  | "happy"
  | "name"
  | "email"
  | "recognized"
  | "password"
  | "confirm"
  | "peek"
  | "match"
  | "mismatch"
  | "valid"
  | "button"
  | "surprised"
  | "annoyed"
  | "dizzy"
  | "recovering"
  | "loading"
  | "error"
  | "success";

type Gait = "sit" | "walk" | "run";

const STATUS: Record<Mood, string> = {
  idle: "Come on in.",
  curious: "Curious.",
  happy: "Happy.",
  name: "Nice to meet you.",
  email: "Got it.",
  recognized: "Looks good.",
  password: "Not looking.",
  confirm: "Still not looking.",
  peek: "Just a peek.",
  match: "Perfect.",
  mismatch: "Almost.",
  valid: "Looking good.",
  button: "Ready.",
  surprised: "Hey.",
  annoyed: "Rude.",
  dizzy: "Whoa.",
  recovering: "Okay, okay.",
  loading: "Checking…",
  error: "Hmm. Try again.",
  success: "Welcome in.",
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function looksLikeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function inputValue(scope: Document | HTMLElement, name: string) {
  const input = scope.querySelector(`input[name="${name}"]`);
  return input instanceof HTMLInputElement ? input.value : "";
}

function passwordReqsSatisfied(pw: string) {
  return (
    pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
  );
}

/** Full signup validity, read live from the DOM so the mascot can get
 *  excited the moment the form becomes submittable. */
function isFormValid(scope: Document | HTMLElement) {
  const name = inputValue(scope, "name").trim();
  const email = inputValue(scope, "email");
  const pw = inputValue(scope, "password");
  const cf = inputValue(scope, "confirm");
  return (
    name.length >= 2 &&
    looksLikeEmail(email) &&
    passwordReqsSatisfied(pw) &&
    cf.length > 0 &&
    pw === cf
  );
}

function confirmState(scope: Document | HTMLElement): "empty" | "match" | "mismatch" {
  const pw = inputValue(scope, "password");
  const cf = inputValue(scope, "confirm");
  if (cf.length === 0) return "empty";
  return pw === cf && pw.length > 0 ? "match" : "mismatch";
}

/**
 * DevHub cat — roaming virtual-pet mascot for the register environment.
 * Same silhouette, physics, and interaction system as the login mascot,
 * retuned for signup: welcoming name/email states, strict password privacy
 * with a tiny post-typing peek on confirm, match/mismatch reactions, and a
 * visibly excited valid-form state. All continuous motion is ref-driven
 * (translate3d, no per-frame setState).
 *
 * Priority: loading/error/success > dizzy/recovering > password/confirm >
 * match/mismatch/valid > name/email > tap reactions > curiosity/happy >
 * button > walk/run > idle.
 */
export function RegisterMascot() {
  const rootRef = useRef<HTMLDivElement>(null);
  const squashRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGGElement>(null);
  const eyeRRef = useRef<SVGGElement>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [facing, setFacing] = useState<1 | -1>(1);
  const [gait, setGait] = useState<Gait>("sit");
  const moodRef = useRef<Mood>("idle");
  const facingRef = useRef<1 | -1>(1);
  const gaitRef = useRef<Gait>("sit");
  const peekTimer = useRef<number | null>(null);
  const emailTimer = useRef<number | null>(null);
  const confirmTimer = useRef<number | null>(null);
  const transientTimer = useRef<number | null>(null);
  const confirmTypingUntil = useRef<number>(0);

  function applyMood(next: Mood) {
    if (moodRef.current === next) return;
    moodRef.current = next;
    setMood(next);
  }

  function face(dir: 1 | -1) {
    if (facingRef.current === dir) return;
    facingRef.current = dir;
    setFacing(dir);
  }

  function setGaitBoth(g: Gait) {
    if (gaitRef.current === g) return;
    gaitRef.current = g;
    setGait(g);
  }

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const node: HTMLDivElement = el;
    const squash = squashRef.current;
    const scope = document.getElementById("login-root") ?? document;
    const visual = document.querySelector<HTMLElement>(".login-visual");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
    const canTrack = () => !reduceMotion.matches && !coarsePointer.matches;
    const roamingAllowed = () =>
      !reduceMotion.matches &&
      !coarsePointer.matches &&
      window.innerWidth > 900;

    type Sample = { x: number; y: number; t: number };
    const pointer = {
      x: 0, y: 0, active: false,
      vx: 0, vy: 0, lx: 0, ly: 0, lt: 0,
      cx: 0, cy: 0, seen: false,
      presence: 0,
      speed: 0,
      history: [] as Sample[],
    };
    // Smoothed raw pointer — first layer of the slow-follow cascade.
    const soft = { x: 0, y: 0 };
    const eye = { x: 0, y: 0 };
    const head = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 };
    const body = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 };
    let tailLag = 0;

    // --- locomotion (ref-driven, GPU-friendly translate3d) ---
    // Rest anchor: slightly up, slightly toward the form. Roam steps
    // are planned around it so the cat lives upper-center-left.
    const pos = { x: 0, y: -30 };
    const tgt = { x: 0, y: -30, active: false };
    const queue = [] as Array<{ x: number; y: number }>;
    let stepPauseUntil = 0;
    const bounds = { x: 120, y: 34 };
    const anchor = { x: 26, y: -30 };
    let idleUntil = performance.now() + 4200;
    let curiousUntil = performance.now() + 9000;
    let jumpY = 0;
    let jumpV = 0;
    let bobT = 0;
    let wanderT = Math.random() * 10;
    let lastT = performance.now();

    // --- tap / curiosity / petting state (discrete, ref-driven) ---
    const taps = { count: 0, firstAt: 0, lastAt: 0 };
    const tapGaze = { x: 0, y: 0 };
    let curiousDwell = 0;
    let curiousStepped = false;
    let petDwell = 0;
    let squashS = 1;
    let squashV = 0;
    let tailFlick = 0;
    let tailFlickV = 0;

    function measureBounds() {
      if (!visual) return;
      const vw = visual.clientWidth;
      const ww = node.offsetWidth || 300;
      bounds.x = Math.max(0, (vw - ww) / 2 - 30);
      bounds.y = visual.clientHeight > 320 ? 36 : 14;
    }
    measureBounds();
    window.addEventListener("resize", measureBounds);

    const WALK = 115;
    const RUN = 340;

    function pickStroll() {
      // Intentional stepping: 2–4 small steps around the rest anchor,
      // occasionally one longer run. Pauses live in the idle branch.
      queue.length = 0;
      const roll = Math.random();
      if (roll < 0.12) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        queue.push({
          x: clamp(anchor.x + dir * (140 + Math.random() * 90), -bounds.x, bounds.x),
          y: clamp(anchor.y + (Math.random() - 0.5) * 2 * bounds.y, -bounds.y, bounds.y),
        });
        setGaitBoth("run");
      } else {
        const steps = 2 + Math.floor(Math.random() * 3);
        let cx = pos.x;
        for (let i = 0; i < steps; i++) {
          const nx = clamp(
            anchor.x + (Math.random() - 0.5) * 150 + (cx - anchor.x) * 0.25,
            -bounds.x, bounds.x,
          );
          const ny = clamp(anchor.y + (Math.random() - 0.5) * 52, -bounds.y, bounds.y);
          if (Math.abs(nx - cx) > 20 || i === 0) {
            queue.push({ x: nx, y: ny });
            cx = nx;
          }
        }
        if (queue.length === 0) {
          queue.push({
            x: clamp(anchor.x + (pos.x >= anchor.x ? -64 : 64), -bounds.x, bounds.x),
            y: anchor.y,
          });
        }
        setGaitBoth("walk");
      }
      tgt.x = queue[0].x;
      tgt.y = queue[0].y;
      tgt.active = true;
      face(tgt.x >= pos.x ? 1 : -1);
    }

    /** After a transient tap/mischief mood, return to whatever owns focus. */
    function settleAfterTransient() {
      const ae = document.activeElement;
      if (ae instanceof HTMLInputElement && ae.name === "password") {
        applyMood("password");
        return;
      }
      if (ae instanceof HTMLInputElement && ae.name === "confirm") {
        settleConfirm();
        return;
      }
      if (ae instanceof HTMLInputElement && ae.name === "email") {
        applyMood(looksLikeEmail(ae.value) ? "recognized" : "email");
        return;
      }
      if (ae instanceof HTMLInputElement && ae.name === "name") {
        applyMood("name");
        return;
      }
      if (isFormValid(scope)) {
        applyMood("valid");
        return;
      }
      applyMood("idle");
      idleUntil = performance.now() + 2600;
      curiousUntil = performance.now() + 6000;
    }

    /** Resolve the confirm-field mood: privacy while typing, otherwise the
     *  live match result (valid wins when the whole form is submittable). */
    function settleConfirm() {
      if (performance.now() < confirmTypingUntil.current) {
        applyMood("confirm");
        return;
      }
      if (isFormValid(scope)) {
        applyMood("valid");
        return;
      }
      const st = confirmState(scope);
      if (st === "match") applyMood("match");
      else if (st === "mismatch") applyMood("mismatch");
      else applyMood("confirm");
    }

    function clearTransient() {
      if (transientTimer.current) {
        window.clearTimeout(transientTimer.current);
        transientTimer.current = null;
      }
    }

    function focusTarget(): { x: number; y: number } | null {
      switch (moodRef.current) {
        case "name":
          return { x: 0.72, y: 0.15 };
        case "email":
        case "recognized":
          return { x: 0.72, y: 0.22 };
        case "password":
          return { x: -0.4, y: 0.4 };
        case "confirm":
          return { x: -0.35, y: 0.35 };
        case "peek":
          return { x: 0.5, y: 0.3 };
        case "match":
          return { x: 0.3, y: 0.1 };
        case "mismatch":
          return { x: 0.2, y: 0.25 };
        case "valid":
          return { x: 0.3, y: 0.08 };
        case "button":
          return { x: 0.62, y: 0.55 };
        case "surprised":
        case "annoyed":
          return { x: tapGaze.x, y: tapGaze.y };
        case "recovering":
          return { x: 0, y: 0.12 };
        case "loading":
        case "success":
          return { x: 0.1, y: 0.08 };
        case "error":
          return { x: 0.1, y: 0.25 };
        default:
          return null;
      }
    }

    // Pointer influence per mood — privacy/dizzy get zero.
    function pointerWeight() {
      const m = moodRef.current;
      if (
        m === "password" || m === "confirm" || m === "peek" ||
        m === "loading" || m === "dizzy"
      )
        return 0;
      if (m === "idle" || m === "curious" || m === "happy" || m === "button") return 1;
      if (m === "surprised" || m === "annoyed" || m === "recovering") return 0.4;
      return 0.1;
    }

    function currentEmail(): HTMLInputElement | null {
      const input = scope.querySelector?.('input[name="email"]');
      return input instanceof HTMLInputElement ? input : null;
    }

    function scheduleEmailCheck() {
      if (emailTimer.current) window.clearTimeout(emailTimer.current);
      emailTimer.current = window.setTimeout(() => {
        const input = currentEmail();
        const v = input?.value ?? "";
        const focused =
          document.activeElement instanceof HTMLInputElement &&
          document.activeElement.name === "email";
        if (
          looksLikeEmail(v) &&
          (moodRef.current === "email" || (moodRef.current === "idle" && v))
        ) {
          applyMood("recognized");
        } else if (moodRef.current === "recognized" && !looksLikeEmail(v)) {
          applyMood(focused ? "email" : "idle");
        }
      }, 550);
    }

    function onPointerMove(e: Event) {
      if (!(e instanceof PointerEvent)) return;
      if (e.pointerType === "touch") return;
      const now = performance.now();
      // Speed estimate for petting detection (px/s, smoothed later).
      if (pointer.seen) {
        const d = Math.hypot(e.clientX - pointer.cx, e.clientY - pointer.cy);
        const dt = Math.max(8, now - (pointer.lt || now));
        const inst = (d / dt) * 1000;
        pointer.speed += (inst - pointer.speed) * 0.25;
      }
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.seen = true;
      if (!canTrack()) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.42;
      const nx = clamp((e.clientX - cx) / 380, -1, 1);
      const ny = clamp((e.clientY - cy) / 300, -1, 1);
      const dt = Math.max(16, now - (pointer.lt || now));
      pointer.vx = clamp(((nx - pointer.lx) / dt) * 16 * 0.5, -1, 1);
      pointer.vy = clamp(((ny - pointer.ly) / dt) * 16 * 0.5, -1, 1);
      pointer.lx = nx;
      pointer.ly = ny;
      pointer.lt = now;
      pointer.x = nx;
      pointer.y = ny;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.x = 0;
      pointer.y = 0;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.active = false;
    }

    function onFocusIn(e: Event) {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      const m = moodRef.current;
      if (m === "loading" || m === "error" || m === "success") return;
      if (m === "dizzy" || m === "recovering") return;
      if (t.name === "email" || t.type === "email") {
        clearTransient();
        if (looksLikeEmail(t.value)) applyMood("recognized");
        else applyMood("email");
      } else if (t.name === "password") {
        clearTransient();
        applyMood("password");
      } else if (t.name === "confirm") {
        clearTransient();
        settleConfirm();
      } else if (t.name === "name") {
        clearTransient();
        applyMood("name");
      }
    }

    function onFocusOut() {
      const m = moodRef.current;
      if (m === "loading" || m === "error" || m === "success") return;
      if (m === "dizzy" || m === "recovering") return;
      window.setTimeout(() => {
        const cur = moodRef.current;
        if (cur === "loading" || cur === "error" || cur === "success") return;
        if (cur === "dizzy" || cur === "recovering") return;
        const ae = document.activeElement;
        if (ae instanceof HTMLInputElement && ae.name === "password") {
          applyMood("password");
          return;
        }
        if (ae instanceof HTMLInputElement && ae.name === "confirm") {
          settleConfirm();
          return;
        }
        if (ae instanceof HTMLInputElement && ae.name === "email") {
          applyMood(looksLikeEmail(ae.value) ? "recognized" : "email");
          return;
        }
        if (ae instanceof HTMLInputElement && ae.name === "name") {
          applyMood("name");
          return;
        }
        if (isFormValid(scope)) {
          applyMood("valid");
          idleUntil = performance.now() + 2500;
          return;
        }
        if (
          cur === "name" || cur === "email" || cur === "recognized" ||
          cur === "password" || cur === "confirm" || cur === "match" ||
          cur === "mismatch" || cur === "valid" ||
          cur === "peek" || cur === "button" || cur === "curious" || cur === "happy"
        )
          applyMood("idle");
        idleUntil = performance.now() + 2500;
      }, 60);
    }

    function onInput(e: Event) {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      const m = moodRef.current;
      if (m === "loading" || m === "error" || m === "success") return;
      if (m === "dizzy" || m === "recovering") return;
      if (t.name === "email") scheduleEmailCheck();
      if (
        t.name === "name" && m !== "name" &&
        m !== "password" && m !== "confirm" && m !== "peek"
      ) {
        applyMood("name");
      }
      if (t.name === "password" && m !== "password" && m !== "peek") {
        applyMood("password");
      }
      if (t.name === "confirm") {
        // Privacy while typing; a tiny peek once typing pauses.
        confirmTypingUntil.current = performance.now() + 900;
        if (m !== "confirm" && m !== "peek") applyMood("confirm");
        if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
        confirmTimer.current = window.setTimeout(() => {
          const ae = document.activeElement;
          if (
            !(ae instanceof HTMLInputElement) || ae.name !== "confirm" ||
            moodRef.current === "loading" || moodRef.current === "error" ||
            moodRef.current === "success" || moodRef.current === "dizzy" ||
            moodRef.current === "recovering"
          )
            return;
          applyMood("peek");
          peekTimer.current = window.setTimeout(() => {
            if (moodRef.current !== "peek") return;
            const cur2 = document.activeElement;
            if (cur2 instanceof HTMLInputElement && cur2.name === "confirm") {
              settleConfirm();
            } else {
              settleAfterTransient();
            }
          }, 550);
        }, 900);
      }
      // Re-check overall validity live so "valid" lands the moment the
      // last requirement is satisfied (unless privacy owns the moment).
      if (t.name === "name" || t.name === "email" || t.name === "password") {
        window.setTimeout(() => {
          const cur3 = moodRef.current;
          if (
            cur3 === "loading" || cur3 === "error" || cur3 === "success" ||
            cur3 === "dizzy" || cur3 === "recovering" ||
            cur3 === "password" || cur3 === "confirm" || cur3 === "peek"
          )
            return;
          if (performance.now() < confirmTypingUntil.current) return;
          if (isFormValid(scope)) applyMood("valid");
          else if (cur3 === "valid") settleAfterTransient();
        }, 60);
      }
    }

    function onMoodEvent(e: Event) {
      const detail = (e as CustomEvent<string>).detail as Mood | undefined;
      if (!detail) return;
      if (peekTimer.current) {
        window.clearTimeout(peekTimer.current);
        peekTimer.current = null;
      }
      if (detail === "peek") {
        if (
          moodRef.current !== "password" && moodRef.current !== "peek" &&
          moodRef.current !== "confirm"
        )
          return;
        applyMood("peek");
        peekTimer.current = window.setTimeout(() => {
          const ae = document.activeElement;
          if (ae instanceof HTMLInputElement && ae.name === "password")
            applyMood("password");
          else if (ae instanceof HTMLInputElement && ae.name === "confirm")
            settleConfirm();
          else settleAfterTransient();
        }, 800);
        return;
      }
      if (detail === "button") {
        const m = moodRef.current;
        if (
          m === "idle" || m === "curious" || m === "happy" ||
          m === "match" || m === "mismatch" || m === "valid" ||
          m === "name" || m === "email" || m === "recognized"
        )
          applyMood("button");
        return;
      }
      if (detail === "idle") {
        const m = moodRef.current;
        if (
          m === "idle" || m === "button" || m === "curious" || m === "happy" ||
          m === "match" || m === "mismatch"
        )
          settleAfterTransient();
        return;
      }
      if (detail === "match" || detail === "mismatch") {
        const m = moodRef.current;
        if (
          m === "loading" || m === "error" || m === "success" ||
          m === "dizzy" || m === "recovering" || m === "password"
        )
          return;
        // Privacy owns active typing; the confirm-pause timer delivers
        // the verdict a beat later instead.
        if (performance.now() < confirmTypingUntil.current) return;
        const ae = document.activeElement;
        if (ae instanceof HTMLInputElement && ae.name === "password") return;
        if (isFormValid(scope)) {
          if (!reduceMotion.matches) jumpV = -90;
          applyMood("valid");
        } else {
          applyMood(detail);
        }
        return;
      }
      if (detail === "valid") {
        const m = moodRef.current;
        if (
          m === "loading" || m === "error" || m === "success" ||
          m === "dizzy" || m === "recovering" || m === "password"
        )
          return;
        if (performance.now() < confirmTypingUntil.current) return;
        if (!isFormValid(scope)) return;
        if (!reduceMotion.matches && m !== "valid") jumpV = -90;
        applyMood("valid");
        return;
      }
      if (detail === "success") {
        clearTransient();
        jumpV = -170;
        applyMood(detail);
        return;
      }
      if (detail === "loading" || detail === "error") clearTransient();
      applyMood(detail);
    }

    function onButtonEnter() {
      const m = moodRef.current;
      if (
        m === "idle" || m === "curious" || m === "happy" ||
        m === "match" || m === "mismatch" || m === "valid" ||
        m === "name" || m === "email" || m === "recognized"
      )
        applyMood("button");
    }
    function onButtonLeave() {
      if (moodRef.current === "button") {
        settleAfterTransient();
      }
    }

    /** Virtual-pet tap: surprised → annoyed → dizzy, with timed reset. */
    function handleTap(clientX: number, clientY: number) {
      const m = moodRef.current;
      if (m === "loading" || m === "error" || m === "success") return;
      if (m === "dizzy" || m === "recovering") return;
      // Form states outrank taps — privacy first.
      if (
        m === "password" || m === "confirm" || m === "peek" ||
        m === "name" || m === "email" || m === "recognized" ||
        m === "match" || m === "mismatch" || m === "valid" || m === "button"
      )
        return;
      const now = performance.now();
      if (now - taps.lastAt > 1300) taps.count = 0;
      taps.count += 1;
      taps.lastAt = now;
      if (taps.count === 1) taps.firstAt = now;
      clearTransient();

      const rect = node.getBoundingClientRect();
      const side = clientX >= rect.left + rect.width / 2 ? 1 : -1;
      tapGaze.x = clamp((clientX - (rect.left + rect.width / 2)) / 200, -1, 1) * 0.7;
      tapGaze.y = clamp((clientY - (rect.top + rect.height / 2)) / 200, -1, 1) * 0.5;
      face(side === 1 ? 1 : -1);

      if (taps.count <= 1) {
        // Surprised: squash + widen + small hop away from the tap.
        if (!reduceMotion.matches) {
          squashV = -3.2;
          pos.x = clamp(pos.x - side * 22, -bounds.x, bounds.x);
        }
        applyMood("surprised");
        transientTimer.current = window.setTimeout(() => {
          if (moodRef.current === "surprised") settleAfterTransient();
        }, 750);
      } else if (taps.count === 2) {
        // Annoyed: head shake (CSS), tail flick, step away.
        if (!reduceMotion.matches) {
          tailFlickV = side * 190;
          pos.x = clamp(pos.x - side * 38, -bounds.x, bounds.x);
        }
        applyMood("annoyed");
        transientTimer.current = window.setTimeout(() => {
          if (moodRef.current !== "annoyed") return;
          applyMood("recovering");
          transientTimer.current = window.setTimeout(() => {
            if (moodRef.current === "recovering") settleAfterTransient();
          }, 750);
        }, 950);
      } else {
        // Dizzy: ~1.5s wobble + stars, then recover.
        taps.count = 0;
        applyMood("dizzy");
        transientTimer.current = window.setTimeout(() => {
          if (moodRef.current !== "dizzy") return;
          applyMood("recovering");
          transientTimer.current = window.setTimeout(() => {
            if (moodRef.current === "recovering") settleAfterTransient();
          }, 900);
        }, 1500);
      }
    }

    function onTap(e: Event) {
      if (e instanceof MouseEvent) handleTap(e.clientX, e.clientY);
      else if (e instanceof KeyboardEvent) {
        const rect = node.getBoundingClientRect();
        handleTap(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }

    function sampleHistory(backMs: number, now: number) {
      const h = pointer.history;
      const target = now - backMs;
      for (let i = h.length - 1; i >= 0; i--) {
        if (h[i].t <= target) return h[i];
      }
      return h[0];
    }

    let raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      if (reduceMotion.matches) {
        if (pos.x !== 0 || pos.y !== 0) {
          pos.x = 0;
          pos.y = 0;
          node.style.transform = "";
        }
        return;
      }

      const mood = moodRef.current;
      const track = canTrack();

      // Presence envelope: rises fast on activity, decays slowly on leave
      // so the cat watches the cursor go, then drifts home.
      pointer.presence += ((pointer.active ? 1 : 0) - pointer.presence) *
        Math.min(1, dt * (pointer.active ? 10 : 1.4));

      // Raw → soft pointer (first inertia stage).
      soft.x += (pointer.x - soft.x) * Math.min(1, dt * 9);
      soft.y += (pointer.y - soft.y) * Math.min(1, dt * 9);
      pointer.history.push({ x: soft.x, y: soft.y, t: now });
      while (pointer.history.length > 40) pointer.history.shift();

      // Slow-follow cascade: eyes read a ~130ms-old sample,
      // head a ~260ms-old one, body follows live-soft, tail trails body.
      const eyeS = sampleHistory(130, now) ?? soft;
      const headS = sampleHistory(260, now) ?? soft;
      const override = focusTarget();
      const w = pointerWeight();
      const pres = track ? pointer.presence : 0;

      // Idle look-around: when the cursor is gone the gaze slowly wanders
      // instead of staring at one spot.
      let wx = 0;
      let wy = 0;
      if (!override && pres < 0.25 && (mood === "idle" || mood === "curious")) {
        wanderT += dt;
        wx = Math.sin(wanderT * 0.45) * 0.5;
        wy = Math.sin(wanderT * 0.7 + 1) * 0.3;
      }

      const ex_t = override
        ? override.x + (track ? pointer.x * w * pres : 0)
        : (track ? (eyeS.x * pres + wx * (1 - pres)) * w : wx * w);
      const ey_t = override
        ? override.y + (track ? pointer.y * w * pres : 0)
        : (track ? (eyeS.y * pres + wy * (1 - pres)) * w : wy * w);
      const hx_t = override
        ? override.x + (track ? pointer.x * w * pres : 0)
        : (track ? (headS.x * pres + wx * (1 - pres)) * w : wx * w);
      const hy_t = override
        ? override.y + (track ? pointer.y * w * pres : 0)
        : (track ? (headS.y * pres + wy * (1 - pres)) * w : wy * w);

      // Eyes: medium lerp — first to arrive, never snapping.
      const eyeA = Math.min(1, dt * 7);
      eye.x += (clamp(ex_t, -1, 1) - eye.x) * eyeA;
      eye.y += (clamp(ey_t, -1, 1) - eye.y) * eyeA;

      // Head: slow spring — lag + restrained overshoot.
      const hs = Math.min(1, dt * 3.1);
      const hd = Math.exp(-dt * 7.5);
      const kick = track ? clamp(pointer.vx * 0.1, -0.1, 0.1) * w * pres : 0;
      const kickY = track ? clamp(pointer.vy * 0.08, -0.08, 0.08) * w * pres : 0;
      head.vx = (head.vx + (hx_t + kick - head.x) * hs) * hd;
      head.vy = (head.vy + (hy_t + kickY - head.y) * hs) * hd;
      head.vr = (head.vr + (hx_t * 0.9 - head.r) * hs) * hd;
      head.x += head.vx * dt * 60;
      head.y += head.vy * dt * 60;
      head.r += head.vr * dt * 60;

      // Body: barely follows — very slow spring.
      const bs = Math.min(1, dt * 1.7);
      const bd = Math.exp(-dt * 6.5);
      const bx_t = override ? override.x * 0.9 : (track ? soft.x * w * pres : 0);
      const by_t = override ? override.y * 0.7 : (track ? soft.y * w * pres : 0);
      body.vx = (body.vx + (bx_t - body.x) * bs) * bd;
      body.vy = (body.vy + (by_t - body.y) * bs) * bd;
      body.vr = (body.vr + (bx_t - body.r) * bs) * bd;
      body.x += body.vx * dt * 60;
      body.y += body.vy * dt * 60;
      body.r += body.vr * dt * 60;

      // --- locomotion ---
      const roam = roamingAllowed();
      let bobY = 0;
      let speedNow = 0;

      if (!roam) {
        queue.length = 0;
        if (mood === "idle") {
          bobT += dt;
          pos.x += (Math.sin(bobT * (Math.PI * 2 / 14)) * 5 - pos.x) * Math.min(1, dt * 1.2);
          pos.y += (0 - pos.y) * Math.min(1, dt * 2);
        } else {
          pos.x += (0 - pos.x) * Math.min(1, dt * 3);
          pos.y += (0 - pos.y) * Math.min(1, dt * 3);
        }
        if (gaitRef.current !== "sit") setGaitBoth("sit");
        tgt.active = false;
      } else if (mood === "name" || mood === "email" || mood === "recognized") {
        face(1);
        tgt.x = bounds.x - 4;
        tgt.y = clamp(pos.y * 0.9, -bounds.y, bounds.y);
        tgt.active = true;
        setGaitBoth("walk");
      } else if (mood === "password" || mood === "confirm" || mood === "peek") {
        face(-1);
        tgt.x = -(bounds.x - 6);
        tgt.y = clamp(pos.y * 0.9 + 6, -bounds.y, bounds.y);
        tgt.active = true;
        setGaitBoth(Math.abs(tgt.x - pos.x) > 130 ? "run" : "walk");
      } else if (mood !== "idle" && mood !== "curious" && mood !== "happy") {
        tgt.active = (mood === "surprised" || mood === "annoyed") ? tgt.active : false;
        if (
          mood === "button" || mood === "match" || mood === "mismatch" ||
          mood === "valid"
        )
          face(1);
        if (gaitRef.current !== "sit" && !tgt.active) setGaitBoth("sit");
      } else {
        // Idle / curious / happy: step chains, pauses, anchor drift.
        if (!tgt.active) {
          if (queue.length > 0 && mood === "idle" && now >= stepPauseUntil) {
            tgt.x = queue[0].x;
            tgt.y = queue[0].y;
            tgt.active = true;
            setGaitBoth("walk");
            face(tgt.x >= pos.x ? 1 : -1);
          } else if (now >= idleUntil && mood === "idle" && queue.length === 0) {
            pickStroll();
          } else if (
            mood === "idle" &&
            now >= stepPauseUntil &&
            Math.hypot(anchor.x - pos.x, anchor.y - pos.y) > 14
          ) {
            // Drift home toward the rest anchor when far from it.
            tgt.x = clamp(anchor.x, -bounds.x, bounds.x);
            tgt.y = clamp(anchor.y, -bounds.y, bounds.y);
            tgt.active = true;
            setGaitBoth("walk");
            face(tgt.x >= pos.x ? 1 : -1);
          } else {
            if (gaitRef.current !== "sit") setGaitBoth("sit");
            // Curiosity: cursor loitering near the cat.
            if (track && pointer.seen && (mood === "idle" || mood === "curious" || mood === "happy")) {
              const rect = node.getBoundingClientRect();
              const dx = pointer.cx - (rect.left + rect.width / 2);
              const dy = pointer.cy - (rect.top + rect.height / 2);
              const dist = Math.hypot(dx, dy);
              const slow = pointer.speed < 260;
              if (dist < 230 && slow) {
                curiousDwell += dt;
                petDwell = dist < 105 && pointer.speed < 80 ? petDwell + dt : 0;
              } else {
                curiousDwell = Math.max(0, curiousDwell - dt * 2);
                petDwell = 0;
                if (mood === "curious" || mood === "happy") {
                  if (dist > 330 || !slow) {
                    applyMood("idle");
                    curiousStepped = false;
                  }
                }
              }
              if (mood === "idle" && curiousDwell > 1.2 && now >= curiousUntil) {
                applyMood("curious");
                curiousStepped = false;
              }
              if (mood === "curious" && !curiousStepped && roam) {
                // One tiny step toward the cursor — never a chase.
                const rect2 = node.getBoundingClientRect();
                const sx = clamp((pointer.cx - (rect2.left + rect2.width / 2)) * 0.14, -52, 52);
                const sy = clamp((pointer.cy - (rect2.top + rect2.height / 2)) * 0.08, -18, 18);
                if (Math.abs(sx) > 12) {
                  tgt.x = clamp(pos.x + sx, -bounds.x, bounds.x);
                  tgt.y = clamp(pos.y + sy, -bounds.y, bounds.y);
                  tgt.active = true;
                  setGaitBoth("walk");
                  face(tgt.x >= pos.x ? 1 : -1);
                }
                curiousStepped = true;
                curiousUntil = now + 10000;
              }
              // Petting: slow hover right over the head.
              if ((mood === "idle" || mood === "curious") && petDwell > 1.5) {
                applyMood("happy");
              }
              if (mood === "happy" && (petDwell === 0 && dist > 150)) {
                applyMood("idle");
                curiousUntil = now + 7000;
              }
            }
          }
        }
      }

      if (tgt.active && roam) {
        const dx = tgt.x - pos.x;
        const dy = tgt.y - pos.y;
        const dist = Math.hypot(dx, dy);
        const running = gaitRef.current === "run";
        const top = running ? RUN : WALK;
        if (dist < 2.5) {
          pos.x = tgt.x;
          pos.y = tgt.y;
          queue.shift();
          if (queue.length > 0 && moodRef.current === "idle") {
            // Next small step after a look-around pause.
            tgt.x = queue[0].x;
            tgt.y = queue[0].y;
            stepPauseUntil = now + 450 + Math.random() * 800;
            tgt.active = false;
            setGaitBoth("sit");
            face(tgt.x >= pos.x ? 1 : -1);
          } else {
            queue.length = 0;
            tgt.active = false;
            setGaitBoth("sit");
            idleUntil = now + 3500 + Math.random() * 3500;
            curiousUntil = now + 5000 + Math.random() * 5000;
          }
        } else {
          const v = top * clamp(dist / 70, 0.22, 1);
          speedNow = v;
          pos.x += (dx / dist) * v * dt;
          pos.y += (dy / dist) * v * dt;
          pos.x = clamp(pos.x, -bounds.x - 4, bounds.x + 4);
          pos.y = clamp(pos.y, -bounds.y - 4, bounds.y + 4);
          face(dx >= 0 ? 1 : -1);
          bobT += dt * (running ? 11 : 6.4);
          bobY = Math.abs(Math.sin(bobT * Math.PI)) * (running ? 3.2 : 1.7);
        }
      }

      // Success hop (impulse — never delays navigation).
      if (jumpV !== 0 || jumpY !== 0) {
        jumpV += 620 * dt;
        jumpY += jumpV * dt;
        if (jumpY >= 0) {
          jumpY = 0;
          jumpV = 0;
        }
      }

      // Surprise squash spring (underdamped jiggle, settles fast).
      if (squashV !== 0 || squashS !== 1) {
        const acc = (1 - squashS) * 170 - squashV * 11;
        squashV += acc * dt;
        squashS += squashV * dt;
        if (Math.abs(squashS - 1) < 0.001 && Math.abs(squashV) < 0.01) {
          squashS = 1;
          squashV = 0;
        }
        if (squash) {
          const sx = 1 + (1 - squashS) * 0.7;
          squash.style.transform = `scale(${sx.toFixed(3)}, ${squashS.toFixed(3)})`;
        }
      }

      node.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${(pos.y + bobY + jumpY).toFixed(1)}px, 0)`;

      // Eyes (+ dizzy orbit drift).
      let ox = 0;
      let oy = 0;
      if (mood === "dizzy") {
        const t = now / 1000;
        ox = Math.sin(t * Math.PI * 2 * 1.5) * 3.4;
        oy = Math.cos(t * Math.PI * 2 * 1.1) * 2.4;
      }
      const ex = clamp(eye.x, -1, 1) * 5 + ox;
      const ey = clamp(eye.y, -1, 1) * 3.6 + oy;
      if (eyeLRef.current) eyeLRef.current.style.transform = `translate(${ex.toFixed(2)}px, ${ey.toFixed(2)}px)`;
      if (eyeRRef.current) eyeRRef.current.style.transform = `translate(${ex.toFixed(2)}px, ${ey.toFixed(2)}px)`;
      if (headRef.current) {
        let wob = 0;
        if (mood === "dizzy") wob = Math.sin(now / 210) * 7;
        else if (mood === "annoyed") wob = Math.sin(now / 55) * 4 * Math.exp(-((now % 950) / 950) * 2);
        headRef.current.style.transform = `translate(${(head.x * 9).toFixed(2)}px, ${(head.y * 7).toFixed(2)}px) rotate(${((head.r * 5.5) + wob).toFixed(2)}deg)`;
      }
      if (bodyRef.current) {
        const lean = gaitRef.current === "run" ? facingRef.current * 2.2 : 0;
        const sway = mood === "dizzy" ? Math.sin(now / 260) * 3.5 : 0;
        // Tiny idle breathing — visible only when sitting still.
        const sitting = gaitRef.current === "sit" && !tgt.active;
        const breath = sitting && mood !== "loading" && mood !== "dizzy"
          ? Math.sin((now / 1000) * Math.PI * 2 * 0.22) * 1.1
          : 0;
        bodyRef.current.style.transform = `translate(${(body.x * 6).toFixed(2)}px, ${(body.y * 4 + breath).toFixed(2)}px) rotate(${((body.r * 1.6) + lean + sway).toFixed(2)}deg)`;
      }
      // Contact shadow tightens as the cat hops.
      if (shadowRef.current) {
        const lift = clamp(-jumpY / 60, 0, 1);
        shadowRef.current.style.transform = `translateX(-50%) scale(${(1 - lift * 0.22).toFixed(3)})`;
        shadowRef.current.style.opacity = (0.9 - lift * 0.35).toFixed(2);
      }
      if (tailRef.current) {
        const t = now / 1000;
        let sway: number;
        let base = 0;
        if (mood === "curious") base = -7;
        else if (mood === "happy") base = -4;
        else if (mood === "match") base = -4;
        else if (mood === "valid") base = -5;
        else if (mood === "name") base = -4;
        else if (mood === "annoyed") base = 5;
        else if (mood === "mismatch") base = 3;
        if (mood === "password" || mood === "confirm" || mood === "peek") {
          // Privacy: tail pauses, nearly still.
          sway = Math.sin(t * 0.6) * 0.8;
        } else if (gaitRef.current === "run" && tgt.active) {
          sway = -facingRef.current * 9 + Math.sin(t * 9) * 3;
        } else if (gaitRef.current === "walk" && tgt.active) {
          sway = Math.sin(bobT * Math.PI) * 6 + Math.sin(t * 1.7) * 2;
        } else if (mood === "dizzy") {
          sway = Math.sin(t * 5.3) * 7 + Math.sin(t * 8.7) * 4;
        } else if (mood === "happy" || mood === "match") {
          sway = Math.sin(t * 4.2) * 5.5;
        } else if (mood === "valid") {
          // Excited: faster, wider happy wag.
          sway = Math.sin(t * 6.1) * 7;
        } else if (mood === "name") {
          sway = Math.sin(t * 2.2) * 3.2;
        } else if (mood === "annoyed") {
          sway = Math.sin(t * 11) * 4;
        } else {
          sway = Math.sin(t * 1.4) * 2.5;
        }
        // Annoyed flick impulse (decaying).
        tailFlickV += (-tailFlick * 26) * dt;
        tailFlickV *= Math.exp(-dt * 5);
        tailFlick += tailFlickV * dt;
        const trail = clamp(-speedNow * 0.02 * facingRef.current, -6, 6);
        // Tail is the last layer: follows with its own lag.
        tailLag += ((body.r * -5 - body.x * 2 + sway + trail + base + tailFlick) - tailLag) * Math.min(1, dt * 7);
        tailRef.current.style.transform = `rotate(${tailLag.toFixed(2)}deg)`;
      }

      pointer.vx *= 0.9;
      pointer.vy *= 0.9;
    }

    let blinkTimeout: number | null = null;
    function scheduleBlink() {
      if (blinkTimeout) window.clearTimeout(blinkTimeout);
      const next = 2600 + Math.random() * 3200;
      blinkTimeout = window.setTimeout(() => {
        if (
          !reduceMotion.matches &&
          moodRef.current !== "password" &&
          moodRef.current !== "confirm" &&
          moodRef.current !== "peek" &&
          moodRef.current !== "loading" &&
          moodRef.current !== "dizzy"
        ) {
          node.setAttribute("data-blink", "true");
          window.setTimeout(() => {
            node.setAttribute("data-blink", "false");
          }, 150);
        }
        // Narrow happy blink (content slow-blink).
        if (
          !reduceMotion.matches &&
          (moodRef.current === "happy" ||
            moodRef.current === "match" ||
            moodRef.current === "valid")
        ) {
          node.setAttribute("data-blink", "soft");
          window.setTimeout(() => {
            if (node.getAttribute("data-blink") === "soft") node.setAttribute("data-blink", "false");
          }, 320);
        }
        scheduleBlink();
      }, next);
    }

    scope.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    scope.addEventListener("pointerleave", onPointerLeave);
    scope.addEventListener("focusin", onFocusIn);
    scope.addEventListener("focusout", onFocusOut);
    scope.addEventListener("input", onInput);
    window.addEventListener("devhub:register-mood", onMoodEvent as EventListener);
    node.addEventListener("click", onTap as EventListener);
    const onKey = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        onTap(e);
      }
    };
    node.addEventListener("keydown", onKey as EventListener);
    const btn = document.getElementById("register-submit");
    btn?.addEventListener("pointerenter", onButtonEnter);
    btn?.addEventListener("pointerleave", onButtonLeave);
    btn?.addEventListener("focus", onButtonEnter);
    btn?.addEventListener("blur", onButtonLeave);

    raf = requestAnimationFrame(tick);
    scheduleBlink();

    const onReduce = () => {
      if (reduceMotion.matches) {
        if (eyeLRef.current) eyeLRef.current.style.transform = "";
        if (eyeRRef.current) eyeRRef.current.style.transform = "";
        if (headRef.current) headRef.current.style.transform = "";
        if (bodyRef.current) bodyRef.current.style.transform = "";
        if (tailRef.current) tailRef.current.style.transform = "";
        if (squash) squash.style.transform = "";
        node.style.transform = "";
      }
    };
    reduceMotion.addEventListener?.("change", onReduce);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureBounds);
      if (blinkTimeout) window.clearTimeout(blinkTimeout);
      if (peekTimer.current) window.clearTimeout(peekTimer.current);
      if (emailTimer.current) window.clearTimeout(emailTimer.current);
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
      if (transientTimer.current) window.clearTimeout(transientTimer.current);
      scope.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      scope.removeEventListener("pointerleave", onPointerLeave);
      scope.removeEventListener("focusin", onFocusIn);
      scope.removeEventListener("focusout", onFocusOut);
      scope.removeEventListener("input", onInput);
      window.removeEventListener("devhub:register-mood", onMoodEvent as EventListener);
      node.removeEventListener("click", onTap as EventListener);
      node.removeEventListener("keydown", onKey as EventListener);
      btn?.removeEventListener("pointerenter", onButtonEnter);
      btn?.removeEventListener("pointerleave", onButtonLeave);
      btn?.removeEventListener("focus", onButtonEnter);
      btn?.removeEventListener("blur", onButtonLeave);
      reduceMotion.removeEventListener?.("change", onReduce);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="lm-wrap"
      data-mood={mood}
      data-blink="false"
      data-facing={facing === 1 ? "right" : "left"}
      data-gait={gait}
      role="button"
      tabIndex={0}
      aria-label="DevHub cat — activate for a reaction"
    >
      <div className="lm-stage" aria-hidden="true">
        <div className="lm-squash" ref={squashRef}>
        <div className="lm-flip">
        <svg viewBox="-60 -20 440 370" className="lm-svg" role="presentation">
          <defs>
            <linearGradient id="lm-ear" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#c97b90" />
            </linearGradient>
            <linearGradient id="lm-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d1a31" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c97b90" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <g className="lm-stars" aria-hidden="true">
            <path d="M160 2 l2.2 5.6 5.6 2.2 -5.6 2.2 -2.2 5.6 -2.2 -5.6 -5.6 -2.2 5.6 -2.2 Z" fill="#c97b90" />
            <path d="M132 16 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 Z" fill="#b14a67" />
            <path d="M188 16 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 Z" fill="#861f3d" />
          </g>

          <g ref={tailRef} className="lm-tail">
            <path
              d="M80 242 C 46 238, 24 216, 30 190 C 33 174, 46 164, 60 164 L 58 182 C 50 182, 44 188, 43 198 C 41 216, 56 230, 82 232 Z"
              fill="#0c1428"
              stroke="url(#lm-rim)"
              strokeWidth="2.5"
            />
            <path d="M34 200 L 48 190 L 34 180" fill="none" stroke="#c97b90" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48 206 L 62 196 L 48 186" fill="none" stroke="#6d1a31" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          <g ref={bodyRef} className="lm-body">
            <ellipse cx="160" cy="272" rx="86" ry="12" fill="#000" opacity="0.45" />
            <path
              d="M104 268 C 100 226, 118 204, 160 204 C 202 204, 220 226, 216 268 C 214 280, 204 286, 192 286 L 128 286 C 116 286, 106 280, 104 268 Z"
              fill="#0c1428"
              stroke="#26365c"
              strokeWidth="2"
            />
            <path
              d="M108 262 C 106 232, 120 212, 142 206"
              fill="none"
              stroke="#6d1a31"
              strokeWidth="2.5"
              opacity="0.7"
              strokeLinecap="round"
            />
            <ellipse cx="126" cy="272" rx="22" ry="20" fill="#0a1122" stroke="#6d1a31" strokeWidth="2.5" />
            <ellipse cx="194" cy="272" rx="22" ry="20" fill="#0a1122" stroke="#6d1a31" strokeWidth="2.5" />
            <g className="lm-laptop">
              <rect x="122" y="228" width="76" height="48" rx="6" fill="#111c33" stroke="#6d1a31" strokeWidth="2" />
              <rect x="122" y="228" width="76" height="8" rx="4" fill="#1b2a4d" />
              <path d="M146 248 L 140 254 L 146 260" fill="none" stroke="#c97b90" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M174 248 L 180 254 L 174 260" fill="none" stroke="#c97b90" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M163 244 L 157 264" stroke="#6d1a31" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>

          <g ref={headRef} className="lm-head">
          <g className="lm-mood-tilt">
            <g className="lm-ear lm-ear-l">
              <path d="M84 96 L 78 44 L 126 62 Z" fill="#0b1327" stroke="#26365c" strokeWidth="2" strokeLinejoin="round" />
              <path d="M94 82 L 91 56 L 114 66 Z" fill="url(#lm-ear)" opacity="0.95" />
            </g>
            <g className="lm-ear lm-ear-r">
              <path d="M236 96 L 242 44 L 194 62 Z" fill="#0b1327" stroke="#26365c" strokeWidth="2" strokeLinejoin="round" />
              <path d="M226 82 L 229 56 L 206 66 Z" fill="url(#lm-ear)" opacity="0.95" />
            </g>
            <ellipse cx="160" cy="132" rx="92" ry="78" fill="#0b1327" stroke="#26365c" strokeWidth="2" />
            <path d="M84 96 C 100 74, 130 64, 160 64 C 190 64, 220 74, 236 96" fill="none" stroke="#6d1a31" strokeWidth="2.5" opacity="0.65" strokeLinecap="round" />
            <ellipse cx="160" cy="148" rx="68" ry="46" fill="#f1f5f9" />
            <g stroke="#861f3d" strokeWidth="2" strokeLinecap="round" opacity="0.85">
              <line x1="66" y1="148" x2="90" y2="150" />
              <line x1="68" y1="160" x2="90" y2="158" />
              <line x1="254" y1="148" x2="230" y2="150" />
              <line x1="252" y1="160" x2="230" y2="158" />
            </g>
            <g className="lm-brows" stroke="#f87171" strokeWidth="3" strokeLinecap="round">
              <line x1="112" y1="112" x2="136" y2="118" />
              <line x1="208" y1="112" x2="184" y2="118" />
            </g>
            <g ref={eyeLRef} className="lm-eye">
              <g className="lm-pupil">
                <ellipse cx="130" cy="148" rx="15" ry="19" fill="#0b1220" />
                <circle cx="134" cy="141" r="4" fill="#fff" opacity="0.95" />
              </g>
            </g>
            <g ref={eyeRRef} className="lm-eye">
              <g className="lm-pupil">
                <ellipse cx="190" cy="148" rx="15" ry="19" fill="#0b1220" />
                <circle cx="194" cy="141" r="4" fill="#fff" opacity="0.95" />
              </g>
            </g>
            <path d="M154 162 L 166 162 L 160 168 Z" fill="#0b1220" />
            <path className="lm-mouth lm-mouth-idle" d="M148 174 Q 160 184, 172 174" fill="none" stroke="#0b1220" strokeWidth="2.6" strokeLinecap="round" />
            <path className="lm-mouth lm-mouth-attentive" d="M150 174 Q 160 180, 170 174" fill="none" stroke="#0b1220" strokeWidth="2.6" strokeLinecap="round" />
            <path className="lm-mouth lm-mouth-happy" d="M146 173 Q 160 186, 174 173" fill="none" stroke="#0b1220" strokeWidth="2.8" strokeLinecap="round" />
            <path className="lm-mouth lm-mouth-surprised" d="M154 174 m-6 0 a6 7 0 1 0 12 0 a6 7 0 1 0 -12 0" fill="none" stroke="#0b1220" strokeWidth="2.6" />
            <path className="lm-mouth lm-mouth-concerned" d="M148 179 Q 160 171, 172 179" fill="none" stroke="#0b1220" strokeWidth="2.6" strokeLinecap="round" />
            <path className="lm-mouth lm-mouth-calm" d="M151 175 L 169 175" fill="none" stroke="#0b1220" strokeWidth="2.4" strokeLinecap="round" />
            <g className="lm-paws">
              <g className="lm-paw lm-paw-l">
                <ellipse cx="130" cy="150" rx="20" ry="24" fill="#0c1428" stroke="#6d1a31" strokeWidth="2.5" />
                <circle cx="124" cy="146" r="2.4" fill="#c97b90" opacity="0.9" />
                <circle cx="132" cy="144" r="2.4" fill="#c97b90" opacity="0.9" />
                <circle cx="130" cy="154" r="3.2" fill="#1b2a4d" />
              </g>
              <g className="lm-paw lm-paw-r">
                <ellipse cx="190" cy="150" rx="20" ry="24" fill="#0c1428" stroke="#6d1a31" strokeWidth="2.5" />
                <circle cx="184" cy="146" r="2.4" fill="#c97b90" opacity="0.9" />
                <circle cx="192" cy="144" r="2.4" fill="#c97b90" opacity="0.9" />
                <circle cx="190" cy="154" r="3.2" fill="#1b2a4d" />
              </g>
            </g>
          </g>
          </g>
        </svg>
        </div>
        </div>

        <div className="lm-shadow" ref={shadowRef} />
      </div>

      <div className="lm-bubble">
        <p className="lm-line" aria-live="polite">
          {STATUS[mood]}
        </p>
      </div>
    </div>
  );
}
