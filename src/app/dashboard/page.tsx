import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Database,
  Eye,
  GitCompareArrows,
  Languages,
  Search,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/shell";
import { EntityAvatar } from "@/components/entity-avatar";
import { compactNumber, formatDate } from "@/lib/analytics";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ActivityChart, type ViewPoint } from "./activity-chart";
import { CompareMiniForm } from "./compare-mini-form";
import { DashboardClock } from "./dashboard-clock";
import { DashboardGreeting } from "./dashboard-greeting";
import "./dashboard.css";

type SavedDeveloper = {
  id: string;
  github_username: string;
  developer_name: string | null;
  avatar_url: string | null;
  created_at?: string | null;
};

type SavedRepository = {
  id: string;
  owner: string;
  repo_name: string;
  full_name: string;
  description: string | null;
  stars: number | null;
  language: string | null;
  created_at?: string | null;
};

type RecentView = {
  id: string;
  entity_type: "developer" | "repository";
  entity_identifier: string;
  metadata: Record<string, unknown>;
  viewed_at: string;
};

type ViewSeriesPoint = {
  viewed_at: string;
  entity_type: "developer" | "repository";
  entity_identifier: string;
};

function metaString(view: RecentView, key: string): string {
  const value = view.metadata?.[key];
  return typeof value === "string" ? value : "";
}

function recentHref(view: RecentView): string {
  return view.entity_type === "repository"
    ? `/repository/${view.entity_identifier.replace(/^\//, "")}`
    : `/developer/${view.entity_identifier.replace(/^@/, "")}`;
}

function recentTitle(view: RecentView): string {
  const name = metaString(view, "name");
  if (name) return name;
  return view.entity_type === "repository"
    ? view.entity_identifier
    : `@${view.entity_identifier.replace(/^@/, "")}`;
}

function recentSub(view: RecentView): string {
  if (view.entity_type === "repository") {
    return metaString(view, "description") || metaString(view, "language") || "";
  }
  const login = `@${view.entity_identifier.replace(/^@/, "")}`;
  const name = metaString(view, "name");
  return name && name !== login ? login : "";
}

function recentAvatar(view: RecentView): { src: string; name: string } {
  if (view.entity_type === "repository") {
    const owner = view.entity_identifier.split("/")[0] || "github";
    return { src: `https://github.com/${owner}.png`, name: owner };
  }
  const login = view.entity_identifier.replace(/^@/, "");
  return {
    src: metaString(view, "avatar_url") || `https://github.com/${login}.png`,
    name: login,
  };
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return "—";
  const diffMs = Date.now() - time;
  if (diffMs < 0) return "just now";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

const LANGUAGE_DOT: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#c9a227",
  Python: "#3572a5",
  Rust: "#c2703d",
  Go: "#00add8",
  Ruby: "#8c1d18",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4f5d95",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Dart: "#0175c2",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

function languageColor(language: string | null): string {
  if (!language) return "#8d8185";
  return LANGUAGE_DOT[language] ?? "#8d8185";
}

type Insight = {
  key: string;
  title: string;
  text: string;
  href: string;
  kind: "developer" | "language" | "saved" | "recent";
};

type FeedItem = {
  key: string;
  kind: "view" | "save";
  entity: "developer" | "repository";
  title: string;
  sub: string;
  href: string;
  avatar: { src: string; name: string };
  at: string | null;
};

export default async function Dashboard() {
  const supabase = await createSupabaseServer();
  let userName = "Explorer";
  let userEmail = "";
  let avatarUrl: string | null = null;
  let providerUrl: string | null = null;
  let developers: SavedDeveloper[] = [];
  let repositories: SavedRepository[] = [];
  let recent: RecentView[] = [];
  let series: ViewSeriesPoint[] = [];
  let devSaveTimes: { created_at: string | null; github_username: string }[] = [];
  let repoSaveTimes: { created_at: string | null; full_name: string }[] = [];
  let developerCount = 0;
  let repositoryCount = 0;
  let viewsCount = 0;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    userName = String(
      user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Explorer",
    );
    userEmail = user.email ?? "";
    avatarUrl =
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) ||
      null;
    providerUrl =
      (typeof user.user_metadata?.picture === "string" && user.user_metadata.picture) ||
      null;

    const [d, r, v, dc, rc, vc, s, ds, rs] = await Promise.all([
      supabase
        .from("favorite_developers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("favorite_repositories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("recent_views").select("*").order("viewed_at", { ascending: false }).limit(7),
      supabase.from("favorite_developers").select("id", { count: "exact", head: true }),
      supabase.from("favorite_repositories").select("id", { count: "exact", head: true }),
      supabase.from("recent_views").select("id", { count: "exact", head: true }),
      supabase
        .from("recent_views")
        .select("viewed_at, entity_type, entity_identifier")
        .order("viewed_at", { ascending: false })
        .limit(1000),
      supabase
        .from("favorite_developers")
        .select("created_at, github_username")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("favorite_repositories")
        .select("created_at, full_name")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);
    developers = (d.data ?? []) as SavedDeveloper[];
    repositories = (r.data ?? []) as SavedRepository[];
    recent = (v.data ?? []) as RecentView[];
    developerCount = dc.count ?? developers.length;
    repositoryCount = rc.count ?? repositories.length;
    viewsCount = vc.count ?? recent.length;
    series = ((s.data ?? []) as ViewSeriesPoint[]).filter((p) => p.viewed_at);
    devSaveTimes = (ds.data ?? []) as { created_at: string | null; github_username: string }[];
    repoSaveTimes = (rs.data ?? []) as { created_at: string | null; full_name: string }[];
  }

  const savedTotal = developerCount + repositoryCount;

  const metrics = [
    { label: "Repositories tracked", value: compactNumber(repositoryCount), Icon: Database },
    { label: "Developers tracked", value: compactNumber(developerCount), Icon: Users },
    { label: "Saved signals", value: compactNumber(savedTotal), Icon: Bookmark },
    { label: "Recent views", value: compactNumber(viewsCount), Icon: Eye },
  ];

  // Insights derived only from data that actually exists.
  const insights: Insight[] = [];
  const devFreq = new Map<string, number>();
  for (const p of series) {
    if (p.entity_type !== "developer") continue;
    const login = p.entity_identifier.replace(/^@/, "");
    if (login) devFreq.set(login, (devFreq.get(login) ?? 0) + 1);
  }
  const topDev = [...devFreq.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topDev) {
    insights.push({
      key: "top-dev",
      title: `Most viewed developer`,
      text: `@${topDev[0]} · viewed ${topDev[1]} time${topDev[1] === 1 ? "" : "s"}`,
      href: `/developer/${topDev[0]}`,
      kind: "developer",
    });
  }
  const langFreq = new Map<string, number>();
  for (const repo of repositories) {
    if (repo.language) langFreq.set(repo.language, (langFreq.get(repo.language) ?? 0) + 1);
  }
  const topLang = [...langFreq.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topLang) {
    insights.push({
      key: "top-lang",
      title: `${topLang[0]} leads your library`,
      text: `${topLang[1]} saved repositor${topLang[1] === 1 ? "y" : "ies"} in ${topLang[0]}`,
      href: "/favourites",
      kind: "language",
    });
  }
  if (savedTotal > 0) {
    insights.push({
      key: "saved",
      title: `${savedTotal} saved signal${savedTotal === 1 ? "" : "s"}`,
      text: `${repositoryCount} repositor${repositoryCount === 1 ? "y" : "ies"} · ${developerCount} developer${developerCount === 1 ? "" : "s"}`,
      href: "/favourites",
      kind: "saved",
    });
  }
  const latest = recent[0];
  if (latest) {
    insights.push({
      key: "latest",
      title: "Recently active",
      text: `${recentTitle(latest)} · ${timeAgo(latest.viewed_at)}`,
      href: recentHref(latest),
      kind: "recent",
    });
  }

  // Unified activity: real views + real saves, newest first.
  const feed: FeedItem[] = [
    ...recent.map((view) => ({
      key: `view-${view.id}`,
      kind: "view" as const,
      entity: view.entity_type,
      title: recentTitle(view),
      sub: recentSub(view),
      href: recentHref(view),
      avatar: recentAvatar(view),
      at: view.viewed_at,
    })),
    ...developers
      .filter((dev) => dev.created_at)
      .map((dev) => ({
        key: `save-dev-${dev.id}`,
        kind: "save" as const,
        entity: "developer" as const,
        title: dev.developer_name || `@${dev.github_username}`,
        sub: `@${dev.github_username}`,
        href: `/developer/${dev.github_username}`,
        avatar: {
          src: dev.avatar_url || `https://github.com/${dev.github_username}.png`,
          name: dev.github_username,
        },
        at: dev.created_at ?? null,
      })),
    ...repositories
      .filter((repo) => repo.created_at)
      .map((repo) => ({
        key: `save-repo-${repo.id}`,
        kind: "save" as const,
        entity: "repository" as const,
        title: repo.full_name,
        sub: repo.description || repo.language || "",
        href: `/repository/${repo.full_name}`,
        avatar: {
          src: `https://github.com/${repo.owner}.png`,
          name: repo.owner,
        },
        at: repo.created_at ?? null,
      })),
  ]
    .sort((a, b) => {
      const ta = a.at ? new Date(a.at).getTime() : 0;
      const tb = b.at ? new Date(b.at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 7);

  const chartPoints: ViewPoint[] = series.map((p) => ({
    at: p.viewed_at,
    type: p.entity_type,
    id: p.entity_identifier,
  }));

  const savePoints = [
    ...(devSaveTimes
      .filter((s) => s.created_at)
      .map((s) => ({
        at: s.created_at as string,
        label: `@${s.github_username}`,
        kind: "developer" as const,
      }))),
    ...(repoSaveTimes
      .filter((s) => s.created_at)
      .map((s) => ({
        at: s.created_at as string,
        label: s.full_name,
        kind: "repository" as const,
      }))),
  ];

  return (
    <AppShell section="Dashboard" layout="workspace" userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} providerUrl={providerUrl}>
      <div className="dash">
        <header className="dash-head">
          <div>
            <DashboardGreeting name={userName} />
            <p className="dash-sub">Here&apos;s a snapshot of what&apos;s happening in the open-source world.</p>
          </div>
          <DashboardClock />
        </header>

        <section className="dash-metrics" aria-label="Workspace metrics">
          {metrics.map(({ label, value, Icon }) => (
            <div key={label} className="dash-card dash-metric">
              <span className="dash-metric-icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              <div>
                <span className="dash-metric-value">{value}</span>
                <span className="dash-metric-label">{label}</span>
              </div>
            </div>
          ))}
        </section>

        <div className="dash-grid">
          <div className="dash-main">
            <section className="dash-card dash-card--signal" aria-labelledby="signal-activity">
              <ActivityChart points={chartPoints} saves={savePoints} />
            </section>

            <section className="dash-card" aria-labelledby="tracked-repos">
              <div className="dash-card-head">
                <div>
                  <h2 id="tracked-repos">Tracked Repositories</h2>
                  <p>Your monitored repositories and their latest activity</p>
                </div>
                {repositories.length > 0 && (
                  <Link href="/favourites" className="dash-view-all">
                    View all <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                )}
              </div>
              {repositories.length > 0 ? (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th scope="col">Repository</th>
                        <th scope="col">Language</th>
                        <th scope="col">Stars</th>
                        <th scope="col">Saved</th>
                        <th scope="col">Status</th>
                        <th scope="col">
                          <span className="dash-sr">Open</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {repositories.map((repo) => (
                        <tr key={repo.id}>
                          <td>
                            <Link href={`/repository/${repo.full_name}`} className="dash-repo-cell">
                              <EntityAvatar
                                src={`https://github.com/${repo.owner}.png`}
                                name={repo.owner}
                                size={30}
                                rounded="lg"
                              />
                              <span className="dash-repo-text">
                                <strong>{repo.full_name}</strong>
                                {repo.description && <small>{repo.description}</small>}
                              </span>
                            </Link>
                          </td>
                          <td>
                            <span className="dash-lang">
                              <i aria-hidden="true" style={{ background: languageColor(repo.language) }} />
                              {repo.language ?? "—"}
                            </span>
                          </td>
                          <td className="dash-num">{repo.stars != null ? compactNumber(repo.stars) : "—"}</td>
                          <td className="dash-muted">{repo.created_at ? timeAgo(repo.created_at) : "—"}</td>
                          <td>
                            <span className="dash-badge">Saved</span>
                          </td>
                          <td>
                            <Link
                              href={`/repository/${repo.full_name}`}
                              className="dash-row-go"
                              aria-label={`Open ${repo.full_name}`}
                            >
                              <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dash-empty">
                  <Database size={18} aria-hidden="true" />
                  <p>No repositories tracked yet. Save repositories to monitor them here.</p>
                  <Link href="/search?type=repositories" className="dash-empty-link">
                    Explore repositories →
                  </Link>
                </div>
              )}
            </section>

            {developerCount === 0 && (
              <section className="dash-card" aria-labelledby="tracked-devs">
                <div className="dash-card-head">
                  <div>
                    <h2 id="tracked-devs">Tracked Developers</h2>
                    <p>Developers you follow across DevHub</p>
                  </div>
                </div>
                <div className="dash-empty">
                  <Users size={18} aria-hidden="true" />
                  <p>No developers tracked yet. Save developers to follow them here.</p>
                  <Link href="/search?type=developers" className="dash-empty-link">
                    Discover developers →
                  </Link>
                </div>
              </section>
            )}

            <section className="dash-card" aria-labelledby="compare-repos">
              <div className="dash-card-head">
                <div>
                  <h2 id="compare-repos">Compare Repositories</h2>
                  <p>Quickly compare key metrics between repositories</p>
                </div>
              </div>
              <CompareMiniForm />
            </section>
          </div>

          <div className="dash-aside">
            <section className="dash-card" aria-labelledby="insights">
              <div className="dash-card-head">
                <div>
                  <h2 id="insights">Insights for you</h2>
                </div>
              </div>
              {insights.length > 0 ? (
                <ul className="dash-insights">
                  {insights.map((insight) => (
                    <li key={insight.key}>
                      <Link href={insight.href} className="dash-insight">
                        <span className="dash-insight-icon" aria-hidden="true">
                          {insight.kind === "developer" ? (
                            <Users size={15} />
                          ) : insight.kind === "language" ? (
                            <Languages size={15} />
                          ) : insight.kind === "saved" ? (
                            <Bookmark size={15} />
                          ) : (
                            <Activity size={15} />
                          )}
                        </span>
                        <span className="dash-insight-text">
                          <strong>{insight.title}</strong>
                          <small>{insight.text}</small>
                        </span>
                        <ChevronRight size={14} aria-hidden="true" className="dash-insight-go" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="dash-empty">
                  <Activity size={18} aria-hidden="true" />
                  <p>Insights appear as you explore, save, and revisit signals.</p>
                </div>
              )}
            </section>

            <section className="dash-card" aria-labelledby="recent-activity">
              <div className="dash-card-head">
                <div>
                  <h2 id="recent-activity">Recent Activity</h2>
                </div>
              </div>
              {feed.length > 0 ? (
                <ul className="dash-feed">
                  {feed.map((item) => (
                    <li key={item.key}>
                      <Link href={item.href} className="dash-feed-row">
                        <EntityAvatar
                          src={item.avatar.src}
                          name={item.avatar.name}
                          size={30}
                          rounded={item.entity === "repository" ? "lg" : "full"}
                        />
                        <span className="dash-feed-text">
                          <span className="dash-feed-line">
                            <strong>{item.title}</strong>
                            <span>
                              {item.kind === "save" ? "Saved " : "Viewed "}
                              {item.entity}
                            </span>
                          </span>
                          {item.sub && <small>{item.sub}</small>}
                        </span>
                        <span className="dash-feed-time">{timeAgo(item.at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="dash-empty">
                  <Eye size={18} aria-hidden="true" />
                  <p>No recent activity yet. Your views and saves will show up here.</p>
                </div>
              )}
            </section>

            <section className="dash-card" aria-labelledby="quick-actions">
              <div className="dash-card-head">
                <div>
                  <h2 id="quick-actions">Quick Actions</h2>
                  <p>Jump into the tools you use most</p>
                </div>
              </div>
              <div className="dash-quick">
                <Link href="/search" className="dash-quick-btn">
                  <Search size={14} aria-hidden="true" /> Explore <ArrowRight size={12} aria-hidden="true" />
                </Link>
                <Link href="/compare" className="dash-quick-btn">
                  <GitCompareArrows size={14} aria-hidden="true" /> Compare <ArrowRight size={12} aria-hidden="true" />
                </Link>
                <Link href="/favourites" className="dash-quick-btn">
                  <Bookmark size={14} aria-hidden="true" /> Saved <ArrowRight size={12} aria-hidden="true" />
                </Link>
                <Link href="/insights" className="dash-quick-btn">
                  <Eye size={14} aria-hidden="true" /> Insights <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
