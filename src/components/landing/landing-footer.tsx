"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Lock, Mail } from "lucide-react";
import { DevHubLogo } from "@/components/brand";

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
      { href: "/settings", label: "Settings" },
      { href: "/", label: "Overview" },
    ],
  },
];

/**
 * GitHub mark (inline — lucide no longer ships brand icons). This is the
 * only social URL the project actually references (see dashboard footer).
 */
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/** Small hand-drawn style curved arrow flourish for the community note. */
function CurveArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 19 C9 13 13 11 19 11" />
      <path d="M15 7 L19 11 L15 15" />
    </svg>
  );
}
export function LandingFooter() {
  const [updatesSent, setUpdatesSent] = useState(false);

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

        <svg
          className="cta-footer-wave"
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          focusable="false"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ctaWaveBlend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4A1020" stopOpacity="0" />
              <stop offset="0.22" stopColor="#4A1020" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#5D1E34" stopOpacity="0.95" />
              <stop offset="0.65" stopColor="#964B62" stopOpacity="0.6" />
              <stop offset="0.82" stopColor="#CD96A8" stopOpacity="0.35" />
              <stop offset="1" stopColor="#FBF8F9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,26 C300,38 520,68 760,66 C1000,64 1200,40 1440,44 L1440,110 L0,110 Z"
            fill="url(#ctaWaveBlend)"
            stroke="none"
          />
        </svg>
      </section>

      <footer className="landing-footer" aria-label="Footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-intro">
            <p className="landing-footer-eyebrow">
              <span aria-hidden="true" />
              Build a more open developer world
              <span aria-hidden="true" />
            </p>
            <h2>
              Ideas. Code. People. <em>In Context.</em>
            </h2>
            <p>DevHub helps you explore the open-source world with deeper understanding.</p>
          </div>

          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <span className="landing-footer-logo">
                <DevHubLogo size={40} label="DevHub" />
                <span className="landing-footer-wordmark" aria-label="DevHub">
                  <span className="dh-word-dev">DEV</span>
                  <span className="dh-word-hub">HUB</span>
                </span>
              </span>
              <p className="landing-footer-tag">Open-source intelligence</p>
              <p>
                Developer intelligence for the open-source world. Connect scattered GitHub signals
                into context you can act on.
              </p>
              <div className="landing-social" aria-label="Community links">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="DevHub on GitHub"
                >
                  <GithubIcon />
                </a>
              </div>
              <p className="landing-community">
                <span className="landing-community-arrow" aria-hidden="true">
                  <CurveArrow />
                </span>
                Join a global community of builders.
              </p>
            </div>
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title} className="landing-footer-col">
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
            <aside className="landing-updates" aria-label="Product updates">
              <div className="landing-updates-head">
                <span className="landing-updates-icon" aria-hidden="true">
                  <Mail size={16} />
                </span>
                <div>
                  <p className="landing-updates-eyebrow">Stay in the loop</p>
                  <h3>Get product updates, new features and open-source insights.</h3>
                </div>
              </div>
              {updatesSent ? (
                <p className="landing-updates-soon" role="status">
                  The newsletter isn&apos;t live yet — coming soon.
                </p>
              ) : (
                <form
                  className="landing-updates-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setUpdatesSent(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    aria-label="Email address"
                  />
                  <button type="submit" aria-label="Get notified">
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
              <p className="landing-updates-note">
                <Lock size={12} aria-hidden="true" /> No spam. Just meaningful updates.
              </p>
            </aside>
          </div>

          <div className="landing-legal">
            <div>
              <p>© 2026 DevHub. All rights reserved.</p>
              <p className="landing-legal-muted">Open source makes a brighter internet.</p>
            </div>
            <p className="landing-legal-love">
              <Heart size={13} aria-hidden="true" /> Built for developers, with care.
            </p>
          </div>

          <svg
            className="landing-bottom-wave"
            viewBox="0 0 1440 40"
            preserveAspectRatio="none"
            focusable="false"
            aria-hidden="true"
          >
            <path
              d="M0,24 C360,32 720,8 1080,18 C1260,23 1380,26 1440,22"
              fill="none"
              stroke="rgba(134,31,61,.10)"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="landing-mascot-mark" aria-hidden="true">
          <Image
            src="/brand/devhub-logo.png"
            alt=""
            width={340}
            height={340}
            draggable={false}
          />
          <span className="landing-code-mark">&lt;/&gt;</span>
        </div>
      </footer>
    </div>
  );
}
