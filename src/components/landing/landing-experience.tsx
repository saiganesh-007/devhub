"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LandingAmbient } from "./landing-ambient";
import { LandingNav } from "./landing-nav";
import {
  SignalWorld,
  DeveloperView,
  RepositoryView,
  ResearchLayers,
  ConnectedView,
  SearchView,
  DeveloperIntelligence,
  TechnologyView,
  RepositoryIntelligence,
  ComparisonView,
  WorkspaceView,
  SystemView,
  FinalView,
} from "./landing-scenes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const story = [
  {
    eyebrow: "Open-source intelligence",
    title: "Read the signals beneath the code.",
    body: "GitHub contains the raw material: developers, repositories, activity, technology, and momentum. The challenge is turning that noise into understanding.",
  },
  {
    eyebrow: "Ecosystem scale",
    title: "Millions of developers. Millions of repositories.",
    body: "Every project leaves traces across people, work, languages, and contribution patterns. The open-source world is enormous and alive.",
  },
  {
    eyebrow: "Fragmented signals",
    title: "The data exists. The context is scattered.",
    body: "A profile tells one part of the story. A repo tells another. Contributors, activity, and technology are split across different surfaces and repeated explorations.",
  },
  {
    eyebrow: "Developer context",
    title: "A profile is only the surface.",
    body: "To understand a person, you need the repositories they shape, the languages they move through, and the momentum behind their work.",
  },
  {
    eyebrow: "Repository context",
    title: "A star count is not the story.",
    body: "It is the people, the throughput, the contributors, the languages, the changes, and the context around the code that reveal meaning.",
  },
  {
    eyebrow: "Research pain",
    title: "The work expands into tabs and tabs.",
    body: "You keep stitching together identity, repositories, activity, and technical signals by hand, over and over again.",
  },
  {
    eyebrow: "DevHub reveal",
    title: "DevHub connects the signals.",
    body: "Identity, code, people, technology, and momentum are no longer separate fragments. They become a continuous flow of insight.",
  },
  {
    eyebrow: "Search as entry",
    title: "Start with a name, a repo, or a question.",
    body: "The system understands the surrounding context, not just the exact object you searched for.",
  },
  {
    eyebrow: "Developer intelligence",
    title: "See the full developer story.",
    body: "Follow focus, contribution patterns, repository spread, and activity in one coherent view.",
  },
  {
    eyebrow: "Repository intelligence",
    title: "See the full repository story.",
    body: "Connect language composition, contributor behavior, stars, issues, and movement into a living picture.",
  },
  {
    eyebrow: "Comparison",
    title: "Compare with context, not guesswork.",
    body: "Useful comparison needs the surrounding signals aligned side by side, not isolated metrics in a vacuum.",
  },
  {
    eyebrow: "Workspace",
    title: "Save the work worth keeping.",
    body: "Track the developers and repositories that matter, then return to the trail when you need it again.",
  },
  {
    eyebrow: "Conclusion",
    title: "Search less. Understand more.",
    body: "DevHub helps you read the open-source world as an interconnected system instead of a scattered archive.",
  },
];

export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const updateNavState = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.95), 1);
      node.style.setProperty("--nav-progress", progress.toFixed(3));
    };

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    return () => window.removeEventListener("scroll", updateNavState);
  }, []);

  useGSAP(
    () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReduced) return;

      const beats = gsap.utils.toArray<HTMLElement>(".story-beat");
      const views = gsap.utils.toArray<HTMLElement>("[data-view]");

      gsap.set(beats.slice(1), { autoAlpha: 0, y: 28, filter: "blur(10px)" });
      gsap.set(views.slice(1), { autoAlpha: 0, scale: 0.96, rotateX: 8, filter: "blur(10px)" });
      gsap.set(".research-core", { autoAlpha: 0.85, y: 24 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.15,
        },
      });

      beats.forEach((beat, index) => {
        const at = index * 2.1;
        if (index > 0) {
          tl.to(beats[index - 1], { autoAlpha: 0, y: -18, filter: "blur(10px)", duration: 0.52 }, at - 0.28)
            .fromTo(
              beat,
              { autoAlpha: 0, y: 28, filter: "blur(12px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
              at
            );
        }
      });

      views.forEach((view, index) => {
        const at = (index + 1) * 2.2;
        if (index > 0) {
          tl.fromTo(
            view,
            { autoAlpha: 0, scale: 0.96, rotateX: 8, filter: "blur(10px)" },
            { autoAlpha: 1, scale: 1, rotateX: 0, filter: "blur(0px)", duration: 0.7 },
            at - 0.2
          );
        }
        if (index < views.length - 1) {
          tl.to(view, { autoAlpha: 0, scale: 1.04, duration: 0.6 }, at + 1.1);
        }
      });

      tl.to(".research-core", { autoAlpha: 1, y: 0, duration: 0.65 }, 0.8)
        .fromTo(".topology-path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.8 }, 0.3)
        .from(".topology-node", { scale: 0, transformOrigin: "center", stagger: 0.06, duration: 1.1 }, 0.6)
        .to(
          ".signal-module",
          {
            x: (i) => [ -110, 160, -80, 120, 40 ][i],
            y: (i) => [ -60, 82, 110, -90, 18 ][i],
            rotate: (i) => [ -2, 2, -1, 1, 0 ][i],
            duration: 2,
          },
          3.2
        )
        .to(".signal-module", { x: 0, y: 0, rotate: 0, duration: 1.5, stagger: 0.05 }, 10.8)
        .fromTo(".connection-pulse", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8 }, 9.8)
        .fromTo(".activity-curve", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6 }, 16.5)
        .to(".workspace-object", { scale: 0.9, y: -18, duration: 1.4 }, 20)
        .from(".system-node", { y: 18, autoAlpha: 0, stagger: 0.1, duration: 1.2 }, 23.2);

      const handlePointerMove = (event: PointerEvent) => {
        if (window.innerWidth < 960) return;
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        gsap.to(".landing-atmosphere", { x: x * -18, y: y * -12, duration: 1.1, overwrite: "auto" });
        gsap.to(".world-mid", { x: x * -8, y: y * -5, duration: 1.1, overwrite: "auto" });
      };

      window.addEventListener("pointermove", handlePointerMove);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
      };
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef} className="landing-journey">
      <LandingNav />

      <div className="landing-stage">
        <LandingAmbient />

        <aside className="story-rail">
          {story.map(({ eyebrow, title, body }, index) => (
            <div className="story-beat" key={`${eyebrow}-${index}`}>
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{body}</p>
            </div>
          ))}
        </aside>

        <div className="world-mid">
          <section className="research-core">
            <div className="research-chrome">
              <span />
              <span />
              <span />
              <p>devhub / intelligence</p>
            </div>

            <div className="research-body">
              <SignalWorld />
              <div data-view="profile" className="research-view"><DeveloperView /></div>
              <div data-view="repository" className="research-view"><RepositoryView /></div>
              <div data-view="layers" className="research-view"><ResearchLayers /></div>
              <div data-view="connected" className="research-view"><ConnectedView /></div>
              <div data-view="search" className="research-view"><SearchView /></div>
              <div data-view="developer" className="research-view"><DeveloperIntelligence /></div>
              <div data-view="dna" className="research-view"><TechnologyView /></div>
              <div data-view="repo-intelligence" className="research-view"><RepositoryIntelligence /></div>
              <div data-view="comparison" className="research-view"><ComparisonView /></div>
              <div data-view="workspace" className="research-view workspace-object"><WorkspaceView /></div>
              <div data-view="system" className="research-view"><SystemView /></div>
              <div data-view="final" className="research-view"><FinalView /></div>
            </div>
          </section>
        </div>

        <footer className="landing-status">
          <span>GitHub intelligence / structured signals</span>
          <i />
        </footer>
      </div>
    </main>
  );
}
