"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  ArrowRight,
  Bookmark,
  GitCompareArrows,
  GitFork,
  Search,
  Star,
  Users,
} from "lucide-react";
import Particles from "@/components/particles";
import { LandingAmbient } from "./landing-ambient";
import { LandingNav } from "./landing-nav";
import { LandingFooter } from "./landing-footer";
import { DevhubCatBadge } from "@/components/brand";
import DepthText from "./depth-text";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REPOS = [
  { name: "edge-runtime", lang: "Rust", langClass: "is-rust", status: "Active" },
  { name: "signal-core", lang: "TypeScript", langClass: "is-ts", status: "Active" },
  { name: "queue-lab", lang: "Go", langClass: "is-go", status: "Maintained" },
];

const LANGUAGES = [
  { name: "Rust", note: "Primary", width: "82%", barClass: "is-rust" },
  { name: "TypeScript", note: "Secondary", width: "58%", barClass: "is-ts" },
  { name: "Go", note: "Secondary", width: "44%", barClass: "is-go" },
];

const PEOPLE = [
  { initials: "AR", name: "Ada Reyes", role: "Maintainer" },
  { initials: "JL", name: "Jon Lind", role: "Contributor" },
  { initials: "SO", name: "Sara Okafor", role: "Contributor" },
  { initials: "RK", name: "Ravi Kumar", role: "Reviewer" },
];

export function LandingExperience({
  ready = true,
  navSuppressed = false,
}: {
  ready?: boolean;
  navSuppressed?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Remeasure triggers once the loader releases the scroll lock.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 140);
    return () => window.clearTimeout(t);
  }, [ready]);

  // One shared reveal observer for all story sections.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const targets = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      // Single pinned morph: scattered signal fragments converge into one
      // connected console while the copy hands off between two beats.
      const frags = gsap.utils.toArray<HTMLElement>(".frag");
      const scatter: Record<number, { x: number; y: number; r: number }> = {
        0: { x: -130, y: 90, r: -6 },
        1: { x: 140, y: 70, r: 5 },
        2: { x: -110, y: -80, r: 4 },
        3: { x: 120, y: -90, r: -5 },
        4: { x: 10, y: 120, r: 3 },
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".morph-pin",
          start: "top top",
          end: "+=170%",
          scrub: 1,
        },
      });
      frags.forEach((frag, i) => {
        const s = scatter[i] ?? { x: 0, y: 90, r: 0 };
        tl.fromTo(
          frag,
          { x: s.x, y: s.y, rotation: s.r, autoAlpha: 0.55 },
          { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 1 },
          0
        );
      });
      tl.fromTo(".morph-links path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0.25);
      tl.fromTo(".morph-hub", { scale: 0.7, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.8 }, 0.3);
      tl.to(".morph-beat.is-a", { autoAlpha: 0, y: -22, duration: 0.4 }, 0.45);
      tl.fromTo(
        ".morph-beat.is-b",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0.55
      );

      // Subtle hero console tilt on fine pointers only.
      const console = rootRef.current?.querySelector<HTMLElement>(".hero-console");
      if (console && window.matchMedia("(pointer: fine)").matches) {
        const tiltX = gsap.quickTo(console, "rotationX", { duration: 0.9, ease: "power2.out" });
        const tiltY = gsap.quickTo(console, "rotationY", { duration: 0.9, ease: "power2.out" });
        const onMove = (event: PointerEvent) => {
          const x = event.clientX / window.innerWidth - 0.5;
          const y = event.clientY / window.innerHeight - 0.5;
          tiltX(-y * 5);
          tiltY(x * 7);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      }
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="landing-root">
      {!navSuppressed && <LandingNav />}
      <LandingAmbient />

      {/* ================= HERO ================= */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-particles" aria-hidden="true">
          <Particles
            particleColors={["#5ac8ff", "#8c7bff", "#ffffff"]}
            particleCount={90}
            particleSpread={11}
            speed={0.08}
            particleBaseSize={70}
            moveParticlesOnHover={false}
            alphaParticles
            disableRotation={false}
          />
        </div>

        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow hero-enter">Open-source intelligence</p>
            <DepthText
              text="DEVHUB"
              layers={30}
              depth={2.1}
              faceColor="#f8fafc"
              depthColor="#5b6cff"
              tilt={6}
              smoothing={0.14}
              perspective={900}
              autoOrbit
              orbitSpeed={0.28}
              fontSize="clamp(3.4rem, 8vw, 6.8rem)"
              fontWeight={900}
              shadow
              className="hero-depth hero-enter"
            />
            <h1 id="hero-title" className="hero-enter">
              Developer Intelligence for the <em>Open-Source World</em>
            </h1>
            <p className="hero-lead hero-enter">
              DevHub connects GitHub developer and repository signals — languages,
              contributors, and activity — into intelligence you can act on.
            </p>
            <div className="hero-actions hero-enter">
              <Link href="/dashboard" className="landing-primary-btn hero-cta">
                <span>Explore DevHub</span>
                <ArrowRight size={14} />
              </Link>
              <Link href="/search" className="hero-secondary">
                <Search size={14} />
                <span>Search GitHub</span>
              </Link>
            </div>
          </div>

          <div className="hero-console hero-enter" aria-label="DevHub intelligence preview">
            <div className="console-chrome">
              <span className="chrome-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <p>devhub / intelligence</p>
              <span className="preview-pill">Illustrative preview</span>
            </div>

            <div className="console-profile">
              <DevhubCatBadge size={46} priority />
              <div className="console-identity">
                <p className="micro-label">Developer profile</p>
                <h3>Ada Reyes</h3>
                <p className="muted">@ada · Infrastructure engineer</p>
              </div>
              <div className="console-id-actions">
                <Link href="/favourites" aria-label="Save Ada Reyes">
                  <Bookmark size={14} />
                </Link>
                <Link href="/compare" aria-label="Compare Ada Reyes">
                  <GitCompareArrows size={14} />
                </Link>
              </div>
            </div>

            <div className="console-grid">
              <div className="console-col">
                <p className="micro-label">Repositories</p>
                <ul className="repo-rows">
                  {REPOS.map((repo) => (
                    <li key={repo.name}>
                      <span className={`lang-dot ${repo.langClass}`} aria-hidden="true" />
                      <span className="repo-name">{repo.name}</span>
                      <span className="repo-meta">
                        {repo.lang} · {repo.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="console-col">
                <p className="micro-label">Languages</p>
                <ul className="lang-bars">
                  {LANGUAGES.map((lang) => (
                    <li key={lang.name}>
                      <span className="lang-name">{lang.name}</span>
                      <i className="lang-bar">
                        <b className={lang.barClass} style={{ width: lang.width }} />
                      </i>
                      <span className="lang-note">{lang.note}</span>
                    </li>
                  ))}
                </ul>
                <p className="micro-label push">Activity</p>
                <svg className="spark" viewBox="0 0 260 72" aria-hidden="true">
                  <path
                    className="spark-line"
                    pathLength={1}
                    d="M4 60 C40 58 48 20 82 36 S130 62 156 28 S206 12 256 22"
                  />
                </svg>
                <p className="muted small">Recent contribution trend</p>
              </div>

              <div className="console-col">
                <p className="micro-label">Contributors</p>
                <ul className="people-rows">
                  {PEOPLE.map((person) => (
                    <li key={person.initials}>
                      <b aria-hidden="true">{person.initials}</b>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.role}</small>
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="signal-checks">
                  <li>
                    <Star size={13} /> Stars <em>linked</em>
                  </li>
                  <li>
                    <GitFork size={13} /> Forks <em>linked</em>
                  </li>
                  <li>
                    <Activity size={13} /> Issues <em>linked</em>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FRAGMENTS -> CONNECTED (pinned morph) ================= */}
      <section className="morph" aria-label="From scattered signals to connected intelligence">
        <div className="morph-pin">
          <div className="morph-stage">
            <div className="morph-copy">
              <div className="morph-beat is-a">
                <span>Fragmented signals</span>
                <h2>The data exists. The context is scattered.</h2>
                <p>
                  A profile tells one part of the story. A repository tells another.
                  Contributors, languages, and activity live on separate surfaces.
                </p>
              </div>
              <div className="morph-beat is-b">
                <span>Connected intelligence</span>
                <h2>DevHub connects the signals.</h2>
                <p>
                  Identity, code, people, technology, and momentum become one
                  continuous flow of insight.
                </p>
              </div>
            </div>

            <div className="morph-panel" aria-hidden="true">
              <svg className="morph-links" viewBox="0 0 600 420" preserveAspectRatio="none">
                <path pathLength={1} d="M120 90 C220 110 260 180 300 205" />
                <path pathLength={1} d="M480 90 C400 120 350 170 312 200" />
                <path pathLength={1} d="M110 330 C200 310 250 250 292 222" />
                <path pathLength={1} d="M490 330 C410 300 355 250 315 220" />
                <path pathLength={1} d="M300 380 C300 330 300 280 300 236" />
              </svg>
              <div className="morph-hub">
                <DevhubCatBadge size={52} />
              </div>
              <div className="frag slot-0">
                <p className="micro-label">Profile</p>
                <strong>Ada Reyes</strong>
              </div>
              <div className="frag slot-1">
                <p className="micro-label">Repository</p>
                <strong>edge-runtime</strong>
              </div>
              <div className="frag slot-2">
                <p className="micro-label">Languages</p>
                <strong>Rust · TypeScript</strong>
              </div>
              <div className="frag slot-3">
                <p className="micro-label">Contributors</p>
                <strong>People behind the code</strong>
              </div>
              <div className="frag slot-4">
                <p className="micro-label">Activity</p>
                <strong>Momentum &amp; trends</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEVELOPER ================= */}
      <section className="story" aria-labelledby="story-dev-title">
        <div className="story-inner">
          <div className="story-copy reveal">
            <span>Developer intelligence</span>
            <h2 id="story-dev-title">See the full developer story.</h2>
            <p>
              Follow focus areas, repository spread, and activity in one coherent
              view — instead of stitching tabs together by hand.
            </p>
            <div className="story-links">
              <Link href="/search" className="story-link">
                <Search size={13} /> Find a developer <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <div className="panel reveal" data-delay="1" aria-label="Developer intelligence panel">
            <div className="panel-head">
              <DevhubCatBadge size={38} />
              <div>
                <p className="micro-label">Developer intelligence</p>
                <h3>Ada Reyes</h3>
                <p className="muted">@ada · Infrastructure and distributed systems</p>
              </div>
              <span className="preview-pill">Preview</span>
            </div>
            <div className="focus-pills">
              {["Distributed systems", "Edge runtimes", "Developer tooling"].map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <ul className="repo-rows lined">
              {REPOS.map((repo) => (
                <li key={repo.name}>
                  <span className={`lang-dot ${repo.langClass}`} aria-hidden="true" />
                  <span className="repo-name">{repo.name}</span>
                  <span className="repo-meta">
                    {repo.lang} · {repo.status}
                  </span>
                </li>
              ))}
            </ul>
            <svg className="spark wide" viewBox="0 0 260 72" aria-hidden="true">
              <path
                className="spark-line"
                pathLength={1}
                d="M4 60 C40 58 48 20 82 36 S130 62 156 28 S206 12 256 22"
              />
            </svg>
            <p className="muted small">Contribution rhythm across tracked work</p>
          </div>
        </div>
      </section>

      {/* ================= REPOSITORY ================= */}
      <section className="story flip" aria-labelledby="story-repo-title">
        <div className="story-inner">
          <div className="panel reveal" aria-label="Repository intelligence panel">
            <div className="panel-head">
              <div>
                <p className="micro-label">Repository intelligence</p>
                <h3>edge-runtime</h3>
                <p className="muted">Runtime primitives for edge servers</p>
              </div>
              <span className="preview-pill">Preview</span>
            </div>
            <p className="micro-label">Language composition</p>
            <ul className="lang-bars">
              {LANGUAGES.map((lang) => (
                <li key={lang.name}>
                  <span className="lang-name">{lang.name}</span>
                  <i className="lang-bar">
                    <b className={lang.barClass} style={{ width: lang.width }} />
                  </i>
                  <span className="lang-note">{lang.note}</span>
                </li>
              ))}
            </ul>
            <p className="micro-label push">Core contributors</p>
            <ul className="people-rows cols-2">
              {PEOPLE.map((person) => (
                <li key={person.initials}>
                  <b aria-hidden="true">{person.initials}</b>
                  <span>
                    <strong>{person.name}</strong>
                    <small>{person.role}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="story-copy reveal" data-delay="1">
            <span>Repository intelligence</span>
            <h2 id="story-repo-title">A star count is not the story.</h2>
            <p>
              People, throughput, language mix, and momentum around the code —
              connected into a living picture.
            </p>
            <div className="story-links">
              <Link href="/search" className="story-link">
                <Search size={13} /> Find a repository <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WORKFLOWS ================= */}
      <section className="workflows" aria-labelledby="workflows-title">
        <div className="workflows-head reveal">
          <span>Search · Save · Compare</span>
          <h2 id="workflows-title">One evolving research workflow.</h2>
          <p>
            Start with a name, keep the work worth revisiting, and align two
            entities side by side — without losing context.
          </p>
        </div>
        <ol className="workflow-track">
          <li className="workflow-step reveal">
            <span className="workflow-icon">
              <Search size={16} />
            </span>
            <div>
              <h3>Search</h3>
              <p>Developers and repositories with surrounding context attached.</p>
              <Link href="/search" className="story-link">
                Open search <ArrowRight size={13} />
              </Link>
            </div>
          </li>
          <li className="workflow-step reveal" data-delay="1">
            <span className="workflow-icon">
              <Bookmark size={16} />
            </span>
            <div>
              <h3>Save</h3>
              <p>Keep developers and repositories on a personal watchlist.</p>
              <Link href="/favourites" className="story-link">
                Open saved <ArrowRight size={13} />
              </Link>
            </div>
          </li>
          <li className="workflow-step reveal" data-delay="2">
            <span className="workflow-icon">
              <GitCompareArrows size={16} />
            </span>
            <div>
              <h3>Compare</h3>
              <p>Align signals side by side — factual, no declared winner.</p>
              <Link href="/compare" className="story-link">
                Open compare <ArrowRight size={13} />
              </Link>
            </div>
          </li>
        </ol>
        <p className="workflows-note reveal">
          <Users size={13} /> Every step reads from the same connected signals.
        </p>
      </section>

      <LandingFooter />
    </div>
  );
}
