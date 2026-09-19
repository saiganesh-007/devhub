"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, GitCompareArrows, GitFork, Search, Star } from "lucide-react";

export function SignalWorld() {
  return (
    <div className="signal-world" data-view="signals">
      <svg className="topology" viewBox="0 0 760 560" aria-hidden="true">
        <path
          className="topology-path"
          pathLength="1"
          d="M84 154 L252 98 L393 190 L570 115 L675 266 L532 418 L318 454 L132 350 Z"
        />
        <path
          className="topology-path"
          pathLength="1"
          d="M252 98 L318 454 M393 190 L132 350 M570 115 L532 418"
        />
        {[[84, 154], [252, 98], [393, 190], [570, 115], [675, 266], [532, 418], [318, 454], [132, 350]].map(
          ([x, y], i) => (
            <circle className="topology-node" key={i} cx={x} cy={y} r={i % 3 === 0 ? 6 : 4} />
          )
        )}
      </svg>

      <div className="signal-modules">
        <SignalModule className="signal-identity" label="Developer identity">
          <div className="mini-person">
            <b>AM</b>
            <span>
              <strong>Alex Morgan</strong>
              <small>Infrastructure engineer</small>
            </span>
          </div>
        </SignalModule>

        <SignalModule className="signal-repository" label="Repository">
          <h3>edge-runtime</h3>
          <p>Runtime primitives for edge servers.</p>
          <div className="tiny-metrics">
            <span><Star size={12} color="var(--lh-amber)" fill="var(--lh-amber)" /> 18.4k</span>
            <span><GitFork size={12} /> 2.1k</span>
          </div>
        </SignalModule>

        <SignalModule className="signal-language" label="Languages">
          <LanguageStrip />
        </SignalModule>

        <SignalModule className="signal-people" label="Contributors">
          <div className="avatar-row">
            {["AM", "JL", "SO", "RK"].map((x) => (
              <b key={x}>{x}</b>
            ))}
          </div>
        </SignalModule>

        <SignalModule className="signal-activity" label="Commit Activity">
          <MiniChart />
        </SignalModule>
      </div>
    </div>
  );
}

export function SignalModule({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`signal-module ${className}`}>
      <span className="micro-label">{label}</span>
      {children}
    </section>
  );
}

export function DeveloperView() {
  return (
    <div className="profile-layout">
      <div className="identity-rail">
        <span className="demo-avatar">AM</span>
        <h3>Alex Morgan</h3>
        <p>@alexm · Infrastructure engineer</p>
        <div className="identity-meta">
          <span>14.8k followers</span>
          <span>84 repositories</span>
          <span>Berlin, DE</span>
        </div>
      </div>
      <div className="context-rail">
        <p>Profile summary</p>
        <div className="context-placeholder" />
        <div className="context-placeholder short" />
        <small>The work behind the profile is still elsewhere.</small>
      </div>
    </div>
  );
}

export function RepositoryView() {
  return (
    <div className="repository-layout">
      <header>
        <span className="micro-label">Selected Repository</span>
        <h3>edge-runtime</h3>
        <p>Runtime primitives for edge servers.</p>
      </header>
      <div className="repo-overview">
        <DataPoint label="Stars" value="18.4k" />
        <DataPoint label="Forks" value="2.1k" />
        <DataPoint label="Open PRs" value="42" />
      </div>
      <div className="question-list">
        <span>Who builds it?</span>
        <span>What powers it?</span>
        <span>Is it moving?</span>
        <span>How does it evolve?</span>
      </div>
    </div>
  );
}

export function ResearchLayers() {
  return (
    <div className="research-layers">
      {["Developer overview", "Repository analytics", "Contributors", "Language composition", "Activity history", "Comparison"].map(
        (x, i) => (
          <div key={x} style={{ transform: `translate(${i * 14}px, ${i * 12}px)` }}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{x}</strong>
            <i />
          </div>
        )
      )}
    </div>
  );
}

export function ConnectedView() {
  return (
    <div className="connected-view">
      <svg viewBox="0 0 700 380">
        <path className="connection-pulse" pathLength="1" d="M55 191 C142 68 218 314 319 182 S494 54 646 187" />
      </svg>
      {["Identity", "Repositories", "Languages", "People", "Activity"].map((x, i) => (
        <span key={x} style={{ left: `${8 + i * 20}%`, top: `${38 + (i % 2) * 24}%` }}>
          {x}
        </span>
      ))}
      <div className="connected-mark">DH</div>
    </div>
  );
}

export function SearchView() {
  return (
    <div className="search-demo">
      <span className="micro-label">Search developers and repositories</span>
      <div className="search-demo-input">
        <Search />
        <span>alexm</span>
        <i />
      </div>
      <div className="search-demo-result">
        <span className="demo-avatar small">AM</span>
        <div>
          <strong style={{ color: "#fff" }}>Alex Morgan</strong>
          <small style={{ display: "block" }}>@alexm · 14.8k followers · 84 repositories</small>
        </div>
        <ArrowRight size={15} style={{ marginLeft: "auto", color: "var(--lh-cyan)" }} />
      </div>
    </div>
  );
}

export function DeveloperIntelligence() {
  return (
    <div className="developer-demo">
      <header>
        <span className="demo-avatar small">AM</span>
        <div>
          <span className="micro-label">Developer intelligence</span>
          <h3>Alex Morgan</h3>
          <p>@alexm · Infrastructure and distributed systems</p>
        </div>
      </header>
      <div className="demo-metrics">
        <DataPoint label="Followers" value="14.8k" />
        <DataPoint label="Repositories" value="84" />
        <DataPoint label="Repo stars" value="42.6k" />
        <DataPoint label="Forks" value="6.2k" />
      </div>
      <div className="demo-columns">
        <div>
          <span className="micro-label">Top repositories</span>
          {["edge-runtime", "signal-core", "queue-lab"].map((x, i) => (
            <p key={x}>
              <strong style={{ color: "#fff" }}>{x}</strong>
              <span>★ {(18.4 - i * 3.1).toFixed(1)}k</span>
            </p>
          ))}
        </div>
        <div>
          <span className="micro-label">Recent activity</span>
          <MiniChart />
        </div>
      </div>
    </div>
  );
}

export function TechnologyView() {
  return (
    <div className="technology-demo">
      <div>
        <span className="micro-label">Technology composition</span>
        <h3>Languages traced to public work</h3>
        <p>Every percentage remains connected to its repository source.</p>
      </div>
      <div className="weighted-languages">
        {[["Rust", 52], ["Go", 31], ["TypeScript", 11], ["Python", 6]].map(([x, v]) => (
          <div key={x as string}>
            <span>{x}</span>
            <i><b style={{ width: `${v}%` }} /></i>
            <em>{v}%</em>
          </div>
        ))}
      </div>
      <div className="repository-links">
        {["edge-runtime", "signal-core", "queue-lab"].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </div>
  );
}

export function RepositoryIntelligence() {
  return (
    <div className="repo-intelligence">
      <header>
        <span className="micro-label">Repository intelligence</span>
        <h3>edge-runtime</h3>
        <p>Runtime primitives for edge servers.</p>
      </header>
      <div className="repo-intelligence-grid">
        <aside>
          <DataPoint label="Stars" value="18.4k" />
          <DataPoint label="Contributors" value="148" />
          <DataPoint label="Updated" value="Today" />
        </aside>
        <div className="large-chart">
          <MiniChart />
          <span className="micro-label" style={{ marginTop: "10px" }}>Commit activity · 12 months</span>
        </div>
        <div>
          <span className="micro-label">Core contributors</span>
          <div className="contributor-list">
            {["AM", "JL", "SO", "RK"].map((x, i) => (
              <p key={x}>
                <b>{x}</b>
                <span>{428 - i * 67}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonView() {
  return (
    <div className="comparison-demo">
      <header>
        <div>
          <strong style={{ color: "#fff" }}>edge-runtime</strong>
          <small>alexm</small>
        </div>
        <GitCompareArrows />
        <div>
          <strong style={{ color: "#fff" }}>workerd</strong>
          <small>cloudflare</small>
        </div>
      </header>
      {[
        ["Stars", "18.4k", "12.1k"],
        ["Forks", "2.1k", "840"],
        ["Contributors", "148", "91"],
        ["Primary language", "Rust / TS", "C++"],
        ["Updated", "Today", "Yesterday"],
      ].map((row) => (
        <div className="comparison-row" key={row[0]}>
          <strong>{row[1]}</strong>
          <span>{row[0]}</span>
          <strong>{row[2]}</strong>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceView() {
  return (
    <div className="workspace-demo">
      <header>
        <div>
          <span className="micro-label">Personal research</span>
          <h3>Saved intelligence</h3>
        </div>
        <Bookmark />
      </header>
      <div className="workspace-grid">
        <div>
          <span className="micro-label">Developers</span>
          {["Alex Morgan", "Sara Kim", "Jon Bell"].map((x) => (
            <p key={x}>
              <strong style={{ color: "#fff" }}>{x}</strong>
              <span style={{ color: "var(--lh-cyan)" }}>Open</span>
            </p>
          ))}
        </div>
        <div>
          <span className="micro-label">Repositories</span>
          {["edge-runtime", "workerd", "signal-core"].map((x) => (
            <p key={x}>
              <strong style={{ color: "#fff" }}>{x}</strong>
              <span style={{ color: "var(--lh-cyan)" }}>Updated</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SystemView() {
  return (
    <div className="system-demo">
      {["Search", "Developer intelligence", "Repository intelligence", "Compare", "Save"].map((x, i) => (
        <div className="system-node" key={x}>
          <span>{x}</span>
          {i < 4 && <ArrowRight size={12} />}
        </div>
      ))}
    </div>
  );
}

export function FinalView() {
  return (
    <div className="final-demo">
      <span className="micro-label">Developer intelligence for open source</span>
      <h2>
        The signals were always there.<br />
        <em>Now you can read them.</em>
      </h2>
      <p>Move from a name to connected engineering context.</p>
      <div>
        <Link href="/dashboard">
          <span>Explore DevHub</span>
          <ArrowRight size={13} />
        </Link>
        <Link href="/search">Search GitHub</Link>
        <Link href="/login">Sign in</Link>
      </div>
    </div>
  );
}

export function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-point">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function LanguageStrip() {
  return (
    <div className="language-strip">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function MiniChart() {
  return (
    <svg className="mini-chart" viewBox="0 0 260 80">
      <path className="activity-curve" pathLength="1" d="M2 69 C35 66 40 22 72 42 S125 70 148 27 S197 13 258 21" />
    </svg>
  );
}
