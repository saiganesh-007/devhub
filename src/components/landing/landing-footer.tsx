"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevhubCatBadge } from "@/components/brand";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/dashboard", label: "Explore" },
      { href: "/search", label: "Search" },
      { href: "/compare", label: "Compare" },
      { href: "/favourites", label: "Saved" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/search", label: "Developers" },
      { href: "/search", label: "Repositories" },
      { href: "/compare", label: "Comparisons" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Get started" },
      { href: "/", label: "Overview" },
    ],
  },
];

/** Supplied footer composition adapted to real DevHub routes only. */
export function LandingFooter() {
  return (
    <div className="landing-close">
      <section className="landing-cta" aria-labelledby="landing-cta-title">
        <p className="landing-cta-eyebrow">Developer intelligence for open source</p>
        <h2 id="landing-cta-title">Search less. Understand more.</h2>
        <p className="landing-cta-copy">
          Start from a developer or repository and follow the connected signals — languages,
          contributors, and activity — in one calm workspace.
        </p>
        <div className="landing-cta-actions">
          <Link href="/dashboard" className="landing-primary-btn landing-cta-primary">
            <span>Explore DevHub</span>
            <ArrowRight size={14} />
          </Link>
          <Link href="/search" className="landing-cta-secondary">
            Search GitHub
          </Link>
        </div>
      </section>

      <footer className="landing-footer" aria-label="Footer">
        <div className="landing-finale-divider" aria-hidden="true" />
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <span className="landing-footer-logo">
              <DevhubCatBadge size={34} />
              <strong>DevHub</strong>
            </span>
            <p>
              Developer intelligence for the open-source world. Connect scattered GitHub signals
              into context you can act on.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="landing-footer-meta">
          <span>© 2026 DevHub. All rights reserved.</span>
          <span className="landing-footer-note">Built on public GitHub signals.</span>
        </div>
        <div className="landing-footer-wordmark" aria-hidden="true">
          
        </div>
      </footer>
    </div>
  );
}
