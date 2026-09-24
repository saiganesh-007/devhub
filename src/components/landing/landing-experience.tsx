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
import { CardBody, CardContainer, CardItem, useCursorGlow } from "@/components/ui/3d-card";
import { LandingAmbient } from "./landing-ambient";
import { LandingNav } from "./landing-nav";
import { LandingFooter } from "./landing-footer";
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
  { initials: "S", name: "Sai", role: "Maintainer" },
  { initials: "JL", name: "Jon Lind", role: "Contributor" },
  { initials: "SO", name: "Sara Okafor", role: "Contributor" },
  { initials: "RK", name: "Ravi Kumar", role: "Reviewer" },
];

// Deterministic contribution-cell intensities (0-4). No randomness.
const CELLS = [
  1, 3, 2, 4, 2, 3, 1, 0, 2, 3, 4, 1,
  2, 0, 3, 1, 4, 2, 3, 4, 1, 2, 0, 3,
  1, 4, 2, 3, 0, 2, 4, 3, 1, 2, 3, 0,
];

const BEATS = [
  {
    eyebrow: "Raw signals",
    title: "GitHub tells you what happened.",
    body: "Profiles, repositories, languages, contributors, activity — accurate, but scattered across separate surfaces.",
  },
  {
    eyebrow: "Connected intelligence",
    title: "DevHub helps you understand what it means.",
    body: "Repositories attach to their developer, languages, contributors, and momentum. Relationships replace tabs.",
  },
  {
    eyebrow: "Developer intelligence",
    title: "See the full developer story.",
    body: "Focus areas, repository spread, and contribution rhythm in one coherent view — instead of stitching tabs by hand.",
  },
  {
    eyebrow: "Repository intelligence",
    title: "A star count is not the story.",
    body: "People, throughput, language mix, and momentum around the code — connected into a living picture.",
  },
  {
    eyebrow: "Search as entry",
    title: "Start with a name.",
    body: "Search developers and repositories with surrounding context attached — not just the exact object you typed.",
  },
  {
    eyebrow: "Compare · Save",
    title: "Compare with context. Keep what matters.",
    body: "Align two entities side by side — factual, no scores, no winner — and save the work worth revisiting.",
  },
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

  // One shared reveal observer for non-pinned content.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const targets = root.querySelectorAll(".workflows-note");
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
      { threshold: 0.3 }
    );
    targets.forEach((el) => io.observe(el));

    // Pointer-tracked highlight for the workflow cards: one delegated
    // listener writes --mx/--my per card; CSS paints the glow. No state.
    const track = root.querySelector<HTMLElement>(".workflow-track");
    const onTrackMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement).closest?.(".workflow-step") as HTMLElement | null;
      if (!card || !track?.contains(card)) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    track?.addEventListener("pointermove", onTrackMove, { passive: true });

    return () => {
      io.disconnect();
      track?.removeEventListener("pointermove", onTrackMove);
    };
  }, []);

  // Cursor light for lower-page preview cards (delegated, no tilt, no re-renders).
  useCursorGlow(rootRef, ".j-frame, .workflow-step");

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      // ONE scene-level timeline: 6 beats inside a single pinned journey.
      // Panels transform into each other (clip reveal + 0.96 → 1 scale +
      // depth drift) instead of fading out/in as disconnected sections.
      const scenes = gsap.utils.toArray<HTMLElement>(".j-scene");
      const beats = gsap.utils.toArray<HTMLElement>(".j-beat");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          // Start the moment the journey approaches (pin bottom reaches the
          // viewport bottom) so the FIRST scroll already produces visible
          // motion — no dead scroll while the hero leaves.
          trigger: ".journey-pin",
          start: "top bottom",
          end: "+=640%",
          scrub: 1.2,
        },
      });

      scenes.forEach((scene, i) => {
        if (i === 0) {
          tl.fromTo(
            scene,
            { autoAlpha: 0, scale: 0.96, y: 60 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.8 },
            0
          );
        } else {
          const at = 0.4 + (i - 1) * 1.15;
          const prev = scenes[i - 1];
          tl.to(prev, { autoAlpha: 0, scale: 0.975, y: -46, filter: "blur(8px)", duration: 0.5 }, at);
          tl.fromTo(
            scene,
            { autoAlpha: 0, scale: 0.96, y: 70, clipPath: "inset(8% 4% 8% 4% round 22px)" },
            { autoAlpha: 1, scale: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 0.65 },
            at + 0.12
          );
        }
        if (i < scenes.length - 1) {
          const hold = (i === 0 ? 0.8 : 0.4 + (i - 1) * 1.15 + 0.77) + 0.42;
          tl.to({}, { duration: 0.42 }, hold);
        }
      });

      beats.forEach((beat, i) => {
        if (i === 0) {
          tl.fromTo(beat, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
        } else {
          const at = 0.4 + (i - 1) * 1.15 + 0.1;
          tl.to(beats[i - 1], { autoAlpha: 0, y: -20, duration: 0.35 }, at);
          tl.fromTo(beat, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.08);
        }
      });

      // Outro removed from the pinned timeline on purpose: fading the frame
      // to zero while the CTA still sat below the fold created a full empty
      // viewport. The closing reveal now has its own scrubbed trigger below.

      // Closing reveal: its own short scrubbed timeline across the close
      // section's approach, so CTA + footer arrive as a continuation —
      // layered, unhurried, never an instant pop or a hard cut.
      const closeTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".landing-close",
          start: "top bottom",
          end: "top 30%",
          scrub: 1,
        },
      });
      // CTA content emerges element by element (no card, no lockup):
      // eyebrow → headline (30px) → description (20px) → buttons (15px),
      // small stagger, one calm climb.
      closeTl.fromTo(
        ".landing-cta-eyebrow, .landing-cta h2, .landing-cta-copy, .landing-cta-actions",
        {
          autoAlpha: 0,
          y: (i: number) => [26, 30, 20, 15][i] ?? 20,
        },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09 },
        0
      );
      // Footer grid arrives as one calm group (not column-by-column) so the
      // brand never sits isolated in the transition while scrubbing.
      closeTl.fromTo(
        ".landing-footer-grid",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6 },
        0.35
      );
      closeTl.fromTo(
        ".landing-footer-meta",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0.65
      );
      closeTl.fromTo(
        ".landing-footer-wordmark",
        { yPercent: 30, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.8 },
        0.45
      );

      // Pointer tilt + cursor light for the hero preview are owned by the
      // CardContainer 3D system (rAF, pointer-fine only). Nothing to do here.
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="landing-root">
      {!navSuppressed && <LandingNav />}
      <LandingAmbient />

      {/* ================= HERO (left side preserved) ================= */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-particles" aria-hidden="true">
          <Particles
            particleColors={["#861f3d", "#b14a67", "#c97b90"]}
            particleCount={36}
            particleSpread={11}
            speed={0.06}
            particleBaseSize={60}
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
              layers={14}
              depth={1.2}
              faceColor="#171416"
              depthColor="#861f3d"
              tilt={4}
              smoothing={0.14}
              perspective={900}
              autoOrbit
              orbitSpeed={0.18}
              fontSize="clamp(2.5rem, 4.8vw, 4.2rem)"
              fontWeight={700}
              shadow={false}
              className="hero-depth hero-enter"
              style={{ fontFamily: "var(--font-devhub-wordmark)" }}
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

          {/* RIGHT SIDE: one layered intelligence workspace */}
          <CardContainer
            className="hero-tilt hero-enter"
            perspective={1100}
            maxTiltX={3}
            maxTiltY={4}
            proximity={64}
          >
          <CardBody className="hero-console" aria-label="DevHub intelligence workspace preview">
            <div className="console-chrome">
              <span className="chrome-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <p>devhub / intelligence</p>
              <span className="preview-pill">Illustrative preview</span>
            </div>

            <div className="hw-stage">
              <svg className="hw-traces" viewBox="0 0 640 600" aria-hidden="true">
                <path className="trace" pathLength={1} d="M120 130 C220 150 260 220 320 250" />
                <path className="trace" pathLength={1} d="M520 150 C440 180 400 230 360 255" />
                <path className="trace" pathLength={1} d="M180 480 C260 440 300 380 330 330" />
                <path className="trace" pathLength={1} d="M480 470 C420 430 380 370 350 325" />
              </svg>

              <section className="hw-main hw-layer" aria-label="Developer node">
                <CardItem translateZ={16} parallax={2}>
                <div className="hw-identity">
                  <span className="hw-identity-avatar" aria-hidden="true">
                    S
                  </span>
                  <div>
                    <p className="micro-label">Developer node</p>
                    <h3>Sai</h3>
                    <p className="muted">@sai · Infrastructure engineer</p>
                    <p className="muted small">Berlin, DE · Open source</p>
                  </div>
                  <Link href="/favourites" className="hw-save" aria-label="Save Sai">
                    <Bookmark size={15} />
                  </Link>
                </div>
                </CardItem>
                <ul className="hw-meters">
                  <li>
                    <Star size={13} />
                    <span>Stars</span>
                    <i className="meter"><b style={{ width: "78%" }} /></i>
                  </li>
                  <li>
                    <GitFork size={13} />
                    <span>Forks</span>
                    <i className="meter"><b style={{ width: "52%" }} /></i>
                  </li>
                  <li>
                    <Users size={13} />
                    <span>Contributors</span>
                    <i className="meter"><b style={{ width: "64%" }} /></i>
                  </li>
                </ul>
                <p className="hw-live">
                  <i className="live-dot" aria-hidden="true" /> signals linked
                </p>
              </section>

              <section className="hw-repos hw-layer" aria-label="Repository intelligence">
                <p className="micro-label">Repository intelligence</p>
                <CardItem translateZ={20} parallax={2}>
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
                </CardItem>
                <Link href="/search" className="hw-more">
                  Browse repositories <ArrowRight size={12} />
                </Link>
              </section>

              <section className="hw-langs hw-layer" aria-label="Language signals">
                <p className="micro-label">Language signals</p>
                <CardItem translateZ={18} parallax={2}>
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
                </CardItem>
              </section>

              <section className="hw-activity hw-layer" aria-label="Activity">
                <div className="hw-activity-head">
                  <p className="micro-label">Activity</p>
                  <Activity size={13} />
                </div>
                <CardItem translateZ={20} parallax={2.5}>
                <div className="contrib-grid" aria-hidden="true">
                  {CELLS.map((level, i) => (
                    <i key={i} data-level={level} />
                  ))}
                </div>
                </CardItem>
                <svg className="spark hw-spark" viewBox="0 0 260 64" aria-hidden="true">
                  <path
                    className="hw-spark-line"
                    pathLength={1}
                    d="M4 54 C40 52 48 18 82 32 S130 56 156 26 S206 10 256 20"
                  />
                </svg>
                <p className="muted small">Contribution rhythm across tracked work</p>
              </section>

              <section className="hw-people hw-layer" aria-label="Relationships">
                <p className="micro-label">Relationships</p>
                <CardItem translateZ={18} parallax={2}>
                <ul>
                  {PEOPLE.map((person, i) => (
                    <li key={person.initials} style={{ animationDelay: `${i * 0.7}s` }}>
                      <b aria-hidden="true">{person.initials}</b>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.role}</small>
                      </span>
                    </li>
                  ))}
                </ul>
                </CardItem>
              </section>
            </div>
          </CardBody>
          </CardContainer>
        </div>

      </section>

      {/* ================= CINEMATIC JOURNEY (one pinned frame, 6 beats) ================= */}
      <section className="journey" aria-label="From signals to intelligence">
        <div className="journey-pin">
          <div className="journey-stage">
            <div className="j-copy">
              {BEATS.map((beat, i) => (
                <div className="j-beat" data-beat={i} key={beat.eyebrow}>
                  <span>{beat.eyebrow}</span>
                  <h2>{beat.title}</h2>
                  <p>{beat.body}</p>
                </div>
              ))}
            </div>

            <div className="j-frame" aria-hidden="true">
              <div className="console-chrome">
                <span className="chrome-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <p>devhub / intelligence</p>
                <span className="preview-pill">Illustrative preview</span>
              </div>

              <div className="j-scenes">
                <div className="j-scene" data-scene="0">
                  <div className="j-chips">
                    {[
                      ["Profile", "Sai"],
                      ["Repository", "edge-runtime"],
                      ["Languages", "Rust · TypeScript"],
                      ["Contributors", "People behind the code"],
                      ["Activity", "Momentum & trends"],
                    ].map(([label, value]) => (
                      <div className="j-chip" key={label}>
                        <p className="micro-label">{label}</p>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="j-scene" data-scene="1">
                  <div className="j-chips converged">
                    {[
                      ["Profile", "Sai"],
                      ["Repository", "edge-runtime"],
                      ["Languages", "Rust · TypeScript"],
                      ["Contributors", "People behind the code"],
                      ["Activity", "Momentum & trends"],
                    ].map(([label, value]) => (
                      <div className="j-chip" key={label}>
                        <p className="micro-label">{label}</p>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="j-scene" data-scene="2">
                  <div className="j-dev">
                    <div className="j-dev-head">
                      <span className="j-dev-avatar" aria-hidden="true">
                        S
                      </span>
                      <div>
                        <p className="micro-label">Developer intelligence</p>
                        <h3>Sai</h3>
                        <p className="muted">@sai · Infrastructure and distributed systems</p>
                      </div>
                    </div>
                    <div className="focus-pills">
                      {["Distributed systems", "Edge runtimes", "Developer tooling"].map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <ul className="repo-rows lined">
                      {REPOS.map((repo) => (
                        <li key={repo.name}>
                          <span className={`lang-dot ${repo.langClass}`} />
                          <span className="repo-name">{repo.name}</span>
                          <span className="repo-meta">
                            {repo.lang} · {repo.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="j-scene" data-scene="3">
                  <div className="j-repo">
                    <p className="micro-label">Repository intelligence</p>
                    <h3>edge-runtime</h3>
                    <p className="muted">Runtime primitives for edge servers</p>
                    <p className="micro-label push">Language composition</p>
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
                    <ul className="people-rows cols-4">
                      {PEOPLE.map((person) => (
                        <li key={person.initials}>
                          <b>{person.initials}</b>
                          <span>
                            <strong>{person.name}</strong>
                            <small>{person.role}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="j-scene" data-scene="4">
                  <div className="j-search">
                    <p className="micro-label">Search developers and repositories</p>
                    <div className="j-search-input">
                      <Search size={16} />
                      <span>sai</span>
                      <i className="caret" />
                    </div>
                    <ul className="j-results">
                      <li>
                        <b>S</b>
                        <span>
                          <strong>Sai</strong>
                          <small>@sai · Infrastructure engineer</small>
                        </span>
                        <ArrowRight size={14} />
                      </li>
                      <li>
                        <span className={`lang-dot is-rust`} />
                        <span>
                          <strong>edge-runtime</strong>
                          <small>Rust · Maintained by Sai</small>
                        </span>
                        <ArrowRight size={14} />
                      </li>
                    </ul>
                    <p className="muted small">Illustrative matches — live results in the app</p>
                  </div>
                </div>

                <div className="j-scene" data-scene="5">
                  <div className="j-compare">
                    <div className="j-side">
                      <p className="micro-label">edge-runtime</p>
                      <strong>Sai</strong>
                      <ul>
                        <li>Rust · Primary</li>
                        <li>Status · Active</li>
                      </ul>
                    </div>
                    <div className="j-vs">
                      <GitCompareArrows size={16} />
                    </div>
                    <div className="j-side">
                      <p className="micro-label">signal-core</p>
                      <strong>Sai</strong>
                      <ul>
                        <li>TypeScript · Primary</li>
                        <li>Status · Active</li>
                      </ul>
                    </div>
                  </div>
                  <p className="j-nobanner">Side-by-side context — no scores, no winner</p>
                  <p className="j-saved">
                    <Bookmark size={13} /> Saved to favourites
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WORKFLOWS (real routes) ================= */}
      <section className="workflows" aria-labelledby="workflows-title">
        <div className="workflows-head">
          <span>Search · Save · Compare</span>
          <h2 id="workflows-title">Continue in the product.</h2>
          <p>The story above is the workspace. These are its doors.</p>
        </div>
        <ol className="workflow-track">
          <li className="workflow-step">
            <span className="workflow-icon">
              <Search size={16} />
            </span>
            <div>
              <h3>Search</h3>
              <p>Developers and repositories with context attached.</p>
              <Link href="/search" className="story-link">
                Open search <ArrowRight size={13} />
              </Link>
            </div>
          </li>
          <li className="workflow-step">
            <span className="workflow-icon">
              <Bookmark size={16} />
            </span>
            <div>
              <h3>Save</h3>
              <p>Keep developers and repositories on a watchlist.</p>
              <Link href="/favourites" className="story-link">
                Open saved <ArrowRight size={13} />
              </Link>
            </div>
          </li>
          <li className="workflow-step">
            <span className="workflow-icon">
              <GitCompareArrows size={16} />
            </span>
            <div>
              <h3>Compare</h3>
              <p>Align signals side by side — factual, no winner.</p>
              <Link href="/compare" className="story-link">
                Open compare <ArrowRight size={13} />
              </Link>
            </div>
          </li>
        </ol>
        <p className="workflows-note reveal">Every step reads from the same connected signals.</p>
      </section>

      <LandingFooter />
    </div>
  );
}
