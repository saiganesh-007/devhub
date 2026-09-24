"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { DevhubCatBadge } from "@/components/brand";

const LINKS = [
  { href: "/dashboard", label: "Explore" },
  { href: "/search", label: "Search" },
  { href: "/compare", label: "Compare" },
];

/**
 * Floating pill navbar: full pill at top, collapses on scroll to a centered
 * cat control, expands on hover/focus, tap/menu on touch.
 * One component transforming — never two navbars swapping.
 *
 * Scroll stability: the pill ignores jitter and tiny drifts, collapses only
 * after ~100px of sustained downward travel (with a short settle delay so
 * it never flickers), and re-expands quickly on upward scroll.
 */
const TOP_ZONE_PX = 72;
const COLLAPSE_TRAVEL_PX = 100;
const REVEAL_TRAVEL_PX = 24;
const JITTER_PX = 8;
const COLLAPSE_SETTLE_MS = 150;

export function LandingNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [peek, setPeek] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const collapseTimer = useRef<number | null>(null);
  const lastY = useRef(0);
  const downTravel = useRef(0);
  const upTravel = useRef(0);
  const settleTimer = useRef<number | null>(null);
  const collapsedRef = useRef(false);

  const setCollapsedStable = (value: boolean) => {
    if (collapsedRef.current === value) return;
    collapsedRef.current = value;
    setCollapsed(value);
  };

  const clearSettle = () => {
    if (settleTimer.current !== null) {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      lastY.current = y;

      // At the very top the full pill is always shown.
      if (y <= TOP_ZONE_PX) {
        clearSettle();
        downTravel.current = 0;
        upTravel.current = 0;
        setCollapsedStable(false);
        return;
      }

      // Ignore sub-pixel jitter / trackpad noise.
      if (Math.abs(dy) < JITTER_PX) return;

      if (dy > 0) {
        // Scrolling down: accumulate sustained travel; a reversal below
        // cancels the pending collapse so the pill never flickers.
        upTravel.current = 0;
        downTravel.current += dy;
        if (downTravel.current >= COLLAPSE_TRAVEL_PX && !collapsedRef.current) {
          clearSettle();
          settleTimer.current = window.setTimeout(() => {
            // Only collapse if the user kept moving down during the delay.
            if (downTravel.current >= COLLAPSE_TRAVEL_PX) {
              setCollapsedStable(true);
            }
            settleTimer.current = null;
          }, COLLAPSE_SETTLE_MS);
        }
      } else {
        // Scrolling up: reveal quickly after a short upward run.
        downTravel.current = 0;
        clearSettle();
        upTravel.current += -dy;
        if (upTravel.current >= REVEAL_TRAVEL_PX) {
          setCollapsedStable(false);
        }
      }
    };

    lastY.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearSettle();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
    };
  }, []);

  const expanded = !collapsed || peek || menuOpen;

  const handleEnter = () => {
    if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
    if (collapsed) setPeek(true);
  };
  const handleLeave = () => {
    // Calm delay before collapsing again while still scrolled.
    if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
    collapseTimer.current = window.setTimeout(() => setPeek(false), 320);
  };

  return (
    <header className="landing-nav-zone">
      <div
        className={`landing-pill ${collapsed ? "is-collapsed" : ""} ${expanded ? "is-expanded" : ""} ${menuOpen ? "is-menu-open" : ""}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocusCapture={handleEnter}
        onBlurCapture={handleLeave}
      >
        <Link
          href="/"
          className="landing-pill-brand"
          aria-label="DevHub home"
          tabIndex={collapsed && !expanded ? -1 : 0}
        >
          <DevhubCatBadge size={32} priority />
          <span className="landing-pill-word">DEVHUB</span>
        </Link>

        <nav className="landing-pill-links" aria-label="Primary" inert={!expanded ? true : undefined}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} tabIndex={!expanded ? -1 : 0}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="landing-pill-actions" inert={!expanded ? true : undefined}>
          <Link href="/login" className="landing-pill-signin" tabIndex={!expanded ? -1 : 0}>
            Sign in
          </Link>
          <Link href="/register" className="landing-primary-btn" tabIndex={!expanded ? -1 : 0}>
            <span>Get started</span>
            <ArrowRight size={13} />
          </Link>
          <button
            type="button"
            className="landing-pill-menu-btn"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <Link
          href="/"
          className="landing-pill-collapsed-cat"
          aria-label="DevHub — show navigation"
          aria-hidden={collapsed && !expanded ? undefined : true}
          tabIndex={collapsed && !expanded ? 0 : -1}
        >
          <DevhubCatBadge size={34} priority />
        </Link>
      </div>

      {menuOpen ? (
        <nav className="landing-mobile-menu" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Sign in
          </Link>
          <Link href="/register" className="landing-primary-btn" onClick={() => setMenuOpen(false)}>
            <span>Get started</span>
            <ArrowRight size={13} />
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
