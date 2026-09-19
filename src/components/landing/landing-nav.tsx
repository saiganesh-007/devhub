"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { DevhubCatMark } from "@/components/brand";

const LINKS = [
  { href: "/dashboard", label: "Explore" },
  { href: "/search", label: "Search" },
  { href: "/compare", label: "Compare" },
];

/**
 * Floating pill navbar: full pill at top, collapses on scroll to a centered
 * cat control, expands on hover/focus, tap/menu on touch.
 * One component transforming — never two navbars swapping.
 */
export function LandingNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [peek, setPeek] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const collapseTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          <DevhubCatMark size={30} priority />
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

        <Link href="/" className="landing-pill-collapsed-cat" aria-label="DevHub — show navigation">
          <DevhubCatMark size={32} priority />
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
