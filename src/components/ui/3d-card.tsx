"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * Reusable subtle-3D + cursor-light interaction system.
 *
 * Reduced-strength take on the CardContainer / CardBody / CardItem
 * architecture: the container owns ONE rAF loop and writes transforms
 * and CSS variables (`--mouse-x`, `--mouse-y`, `--glow-o`) directly to
 * the DOM — no React state updates on pointer movement.
 *
 * Guards: pointer-fine devices only, inert under
 * `prefers-reduced-motion`. Resting state is completely calm.
 */

function motionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type DepthEntry = { el: HTMLElement; z: number; depth: number };

type TiltApi = {
  registerBody: (el: HTMLDivElement | null) => void;
  registerItem: (el: HTMLElement, z: number, depth: number) => () => void;
};

const TiltContext = createContext<TiltApi | null>(null);

type CardContainerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** Perspective distance in px. Keep 900–1200 for subtlety. */
  perspective?: number;
  /** Max rotation in degrees. Keep <= ~5. */
  maxTiltX?: number;
  maxTiltY?: number;
  /** Cursor-following illumination. Default true. */
  glow?: boolean;
  /** Start responding this many px outside the card bounds. */
  proximity?: number;
};

export function CardContainer({
  children,
  className = "",
  style,
  perspective = 1100,
  maxTiltX = 3,
  maxTiltY = 4,
  glow = true,
  proximity = 64,
  ...rest
}: CardContainerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const items = useRef<DepthEntry[]>([]);
  const target = useRef({ x: 0, y: 0, gx: 50, gy: 50, glow: 0 });
  const current = useRef({ x: 0, y: 0, glow: 0 });
  const raf = useRef(0);
  const running = useRef(false);

  const registerBody = useCallback((el: HTMLDivElement | null) => {
    bodyRef.current = el;
  }, []);

  const registerItem = useCallback((el: HTMLElement, z: number, depth: number) => {
    const entry: DepthEntry = { el, z, depth };
    items.current.push(entry);
    return () => {
      items.current = items.current.filter((i) => i !== entry);
    };
  }, []);

  useEffect(() => {
    if (!motionAllowed()) return;
    const host = hostRef.current;
    if (!host) return;

    const step = () => {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.14;
      c.y += (t.y - c.y) * 0.14;
      c.glow += (t.glow - c.glow) * 0.18;

      const body = bodyRef.current;
      if (body) {
        body.style.transform = `rotateX(${c.x.toFixed(3)}deg) rotateY(${c.y.toFixed(3)}deg)`;
        if (glow) {
          body.style.setProperty("--mouse-x", `${t.gx.toFixed(1)}px`);
          body.style.setProperty("--mouse-y", `${t.gy.toFixed(1)}px`);
          body.style.setProperty("--glow-o", c.glow.toFixed(3));
        }
      }
      for (const item of items.current) {
        item.el.style.transform =
          `translate3d(${(c.y * item.depth).toFixed(2)}px, ${(-c.x * item.depth).toFixed(2)}px, 0)` +
          (item.z ? ` translateZ(${item.z}px)` : "");
      }

      const settled =
        Math.abs(t.x - c.x) < 0.01 &&
        Math.abs(t.y - c.y) < 0.01 &&
        Math.abs(t.glow - c.glow) < 0.01;
      if (settled && t.x === 0 && t.y === 0 && t.glow === 0) {
        running.current = false;
        if (body) body.style.transform = "";
        for (const item of items.current) {
          item.el.style.transform = item.z ? `translateZ(${item.z}px)` : "";
        }
        return;
      }
      raf.current = requestAnimationFrame(step);
    };

    const kick = () => {
      if (!running.current) {
        running.current = true;
        raf.current = requestAnimationFrame(step);
      }
    };

    const reset = () => {
      target.current.x = 0;
      target.current.y = 0;
      target.current.glow = 0;
      kick();
    };

    const onMove = (e: PointerEvent) => {
      const surface = bodyRef.current ?? host;
      const rect = surface.getBoundingClientRect();
      const px = e.clientX;
      const py = e.clientY;
      const nearX = px >= rect.left - proximity && px <= rect.right + proximity;
      const nearY = py >= rect.top - proximity && py <= rect.bottom + proximity;
      if (!nearX || !nearY) {
        reset();
        return;
      }
      const inside =
        px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
      const nx = (px - rect.left) / Math.max(1, rect.width) - 0.5;
      const ny = (py - rect.top) / Math.max(1, rect.height) - 0.5;
      target.current.x = inside ? -ny * 2 * maxTiltX : 0;
      target.current.y = inside ? nx * 2 * maxTiltY : 0;
      target.current.gx = Math.min(Math.max(px - rect.left, 0), rect.width);
      target.current.gy = Math.min(Math.max(py - rect.top, 0), rect.height);
      target.current.glow = 1;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", reset);
      running.current = false;
      cancelAnimationFrame(raf.current);
    };
  }, [glow, maxTiltX, maxTiltY, proximity]);

  return (
    <TiltContext.Provider value={{ registerBody, registerItem }}>
      <div
        ref={hostRef}
        className={className}
        style={{ perspective: `${perspective}px`, ...style }}
        {...rest}
      >
        {children}
      </div>
    </TiltContext.Provider>
  );
}

type CardBodyProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
};

export function CardBody({ children, className = "", style, ...rest }: CardBodyProps) {
  const api = useContext(TiltContext);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!api) return;
    api.registerBody(ref.current);
    return () => api.registerBody(null);
  }, [api]);

  return (
    <div
      ref={ref}
      className={`tilt-body ${className}`.trim()}
      style={{ transformStyle: "preserve-3d", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

type CardItemProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Layer depth in px. Keep 12–30 for landing use. */
  translateZ?: number;
  /** Pointer parallax in px. Keep 1–3 so text stays readable. */
  parallax?: number;
};

export function CardItem({
  children,
  className = "",
  style,
  translateZ = 20,
  parallax = 2,
}: CardItemProps) {
  const api = useContext(TiltContext);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!api || !el) return;
    if (!motionAllowed()) {
      if (translateZ) el.style.transform = `translateZ(${translateZ}px)`;
      return;
    }
    return api.registerItem(el, translateZ, parallax);
  }, [api, translateZ, parallax]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/**
 * Delegated cursor light for a set of cards (no tilt, no re-renders).
 * Writes `--mouse-x` / `--mouse-y` / `--glow-o` onto the hovered card;
 * CSS paints a restrained radial illumination from those variables.
 */
export function useCursorGlow(
  rootRef: RefObject<HTMLElement | null>,
  selector: string,
) {
  useEffect(() => {
    if (!motionAllowed()) return;
    const root = rootRef.current;
    if (!root) return;

    let active: HTMLElement | null = null;
    const clear = () => {
      if (active) {
        active.style.setProperty("--glow-o", "0");
        active = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      const found = (e.target as HTMLElement | null)?.closest?.(selector) as
        | HTMLElement
        | null;
      const card = found && root.contains(found) ? found : null;
      if (card !== active) {
        clear();
        active = card;
      }
      if (!active) return;
      const rect = active.getBoundingClientRect();
      active.style.setProperty("--mouse-x", `${(e.clientX - rect.left).toFixed(1)}px`);
      active.style.setProperty("--mouse-y", `${(e.clientY - rect.top).toFixed(1)}px`);
      active.style.setProperty("--glow-o", "1");
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", clear);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", clear);
    };
  }, [rootRef, selector]);
}
