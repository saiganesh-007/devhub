import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bookmark,
  Database,
  Eye,
  Languages,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/shell";
import { EntityAvatar } from "@/components/entity-avatar";
import { compactNumber, formatDate } from "@/lib/analytics";
import { createSupabaseServer } from "@/lib/supabase/server";
import "../dashboard/dashboard.css";

export const metadata: Metadata = { title: "Insights" };

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

export default async function InsightsPage() {
  const supabase = await createSupabaseServer();
  let userName = "Explorer";
  let userEmail = "";
  let avatarUrl: string | null = null;
  let providerUrl: string | null = null;
  let developers: SavedDeveloper[] = [];
  let repositories: SavedRepository[] = [];
  let recent: RecentView[] = [];
  let series: { viewed_at: string; entity_type: string; entity_identifier: string }[] = [];
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

    const [d, r, v, dc, rc, vc, s] = await Promise.all([
      supabase.from("favorite_developers").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("favorite_repositories").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("recent_views").select("*").order("viewed_at", { ascending: false }).limit(20),
      supabase.from("favorite_developers").select("id", { count: "exact", head: true }),
      supabase.from("favorite_repositories").select("id", { count: "exact", head: true }),
      supabase.from("recent_views").select("id", { count: "exact", head: true }),
      supabase.from("recent_views").select("viewed_at, entity_type, entity_identifier").order("viewed_at", { ascending: false }).limit(1000),
    ]);
    developers = (d.data ?? []) as SavedDeveloper[];
    repositories = (r.data ?? []) as SavedRepository[];
    recent = (v.data ?? []) as RecentView[];
    developerCount = dc.count ?? developers.length;
    repositoryCount = rc.count ?? repositories.length;
    viewsCount = vc.count ?? recent.length;
    series = ((s.data ?? []) as typeof series).filter((p) => p.viewed_at);
  }

  // Frequency maps — real data only.
  const devFreq = new Map<string, number>();
  const repoFreq = new Map<string, number>();
  for (const p of series) {
    const key = p.entity_identifier.replace(/^@/, "").replace(/^\//, "");
    if (!key) continue;
    if (p.entity_type === "developer") devFreq.set(key, (devFreq.get(key) ?? 0) + 1);
    else repoFreq.set(key, (repoFreq.get(key) ?? 0) + 1);
  }
  const topDev = [...devFreq.entries()].sort((a, b) => b[1] - a[1])[0];
  const topRepo = [...repoFreq.entries()].sort((a, b) => b[1] - a[1])[0];

  const langFreq = new Map<string, number>();
  for (const repo of repositories) {
    if (repo.language) langFreq.set(repo.language, (langFreq.get(repo.language) ?? 0) + 1);
  }
  for (const view of recent) {
    const lang = metaString(view, "language");
    if (view.entity_type === "repository" && lang) {
      langFreq.set(lang, (langFreq.get(lang) ?? 0) + 0.5);
    }
  }
  const topLangs = [...langFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const langTotal = topLangs.reduce((sum, [, n]) => sum + n, 0);

  const latest = recent[0];

  const snapshot = [
    { label: "Saved developers", value: compactNumber(developerCount), Icon: Users, href: "/favourites" },
    { label: "Saved repositories", value: compactNumber(repositoryCount), Icon: Database, href: "/favourites" },
    { label: "Saved signals", value: compactNumber(developerCount + repositoryCount), Icon: Bookmark, href: "/favourites" },
    { label: "Recent views", value: compactNumber(viewsCount), Icon: Eye, href: "/dashboard" },
  ];

  return (
    <AppShell section="Insights" layout="workspace" userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} providerUrl={providerUrl}>
      <div className="dash">
        <header className="dash-head">
          <div>
            <p className="text-metadata" style={{ margin: 0 }}>
              Open-source intelligence
            </p>
            <h1 className="dash-title" style={{ marginTop: 6 }}>
              Your research, summarized.
            </h1>
            <p className="dash-sub">
              Every number below comes from your real DevHub activity — saves and views, nothing invented.
            </p>
          </div>
        </header>

        <section className="dash-card" aria-labelledby="research-snapshot">
          <div className="dash-card-head">
            <div>
              <h2 id="research-snapshot">Research snapshot</h2>
              <p>Totals from your private workspace</p>
            </div>
          </div>
          <div className="dash-metrics" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {snapshot.map(({ label, value, Icon, href }) => (
              <Link key={label} href={href} className="dash-card dash-metric" style={{ textDecoration: "none" }}>
                <span className="dash-metric-icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <div>
                  <span className="dash-metric-value">{value}</span>
                  <span className="dash-metric-label">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="dash-grid">
          <div className="dash-main">
            <section className="dash-card" aria-labelledby="recent-signals">
              <div className="dash-card-head">
                <div>
                  <h2 id="recent-signals">Recent signals</h2>
                  <p>Your latest research activity</p>
                </div>
              </div>
              {recent.length > 0 ? (
                <ul className="dash-feed">
                  {recent.slice(0, 8).map((view) => {
                    const login = view.entity_identifier.replace(/^@/, "").replace(/^\//, "");
                    const avatar =
                      view.entity_type === "repository"
                        ? `https://github.com/${login.split("/")[0] || "github"}.png`
                        : metaString(view, "avatar_url") || `https://github.com/${login}.png`;
                    return (
                      <li key={view.id}>
                        <Link href={recentHref(view)} className="dash-feed-row">
                          <EntityAvatar
                            src={avatar}
                            name={login}
                            size={30}
                            rounded={view.entity_type === "repository" ? "lg" : "full"}
                          />
                          <span className="dash-feed-text">
                            <span className="dash-feed-line">
                              <strong>{recentTitle(view)}</strong>
                              <span>
                                Viewed {view.entity_type} · {timeAgo(view.viewed_at)}
                              </span>
                            </span>
                            {metaString(view, "description") && (
                              <small>{metaString(view, "description")}</small>
                            )}
                          </span>
                          <ArrowRight size={14} aria-hidden="true" className="dash-insight-go" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="dash-empty">
                  <Activity size={18} aria-hidden="true" />
                  <p>No research activity yet. Open a developer or repository to start your trail.</p>
                  <Link href="/search" className="dash-empty-link">
                    Start exploring →
                  </Link>
                </div>
              )}
            </section>

            <section className="dash-card" aria-labelledby="research-history">
              <div className="dash-card-head">
                <div>
                  <h2 id="research-history">Research history</h2>
                  <p>Every view, newest first</p>
                </div>
              </div>
              {series.length > 0 ? (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th scope="col">Entity</th>
                        <th scope="col">Type</th>
                        <th scope="col">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const counts = new Map<string, { type: string; n: number }>();
                        for (const p of series) {
                          const key = `${p.entity_type}:${p.entity_identifier.replace(/^@/, "").replace(/^\//, "")}`;
                          const prev = counts.get(key);
                          counts.set(key, {
                            type: p.entity_type,
                            n: (prev?.n ?? 0) + 1,
                          });
                        }
                        return [...counts.entries()]
                          .sort((a, b) => b[1].n - a[1].n)
                          .slice(0, 10)
                          .map(([key, { type, n }]) => {
                            const identifier = key.split(":").slice(1).join(":");
                            const href =
                              type === "repository"
                                ? `/repository/${identifier}`
                                : `/developer/${identifier}`;
                            return (
                              <tr key={key}>
                                <td>
                                  <Link href={href} className="dash-empty-link">
                                    {identifier}
                                  </Link>
                                </td>
                                <td className="dash-muted">{type}</td>
                                <td className="dash-num">{n}×</td>
                              </tr>
                            );
                          });
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dash-empty">
                  <Eye size={18} aria-hidden="true" />
                  <p>No history yet — your views will accumulate here.</p>
                </div>
              )}
            </section>
          </div>

          <div className="dash-aside">
            <section className="dash-card" aria-labelledby="top-entities">
              <div className="dash-card-head">
                <div>
                  <h2 id="top-entities">Top entities</h2>
                  <p>Most revisited</p>
                </div>
              </div>
              {topDev || topRepo || latest ? (
                <ul className="dash-insights">
                  {topDev && (
                    <li>
                      <Link href={`/developer/${topDev[0]}`} className="dash-insight">
                        <span className="dash-insight-icon" aria-hidden="true">
                          <Users size={15} />
                        </span>
                        <span className="dash-insight-text">
                          <strong>Most viewed developer</strong>
                          <small>
                            @{topDev[0]} · viewed {topDev[1]} time{topDev[1] === 1 ? "" : "s"}
                          </small>
                        </span>
                      </Link>
                    </li>
                  )}
                  {topRepo && (
                    <li>
                      <Link href={`/repository/${topRepo[0]}`} className="dash-insight">
                        <span className="dash-insight-icon" aria-hidden="true">
                          <Database size={15} />
                        </span>
                        <span className="dash-insight-text">
                          <strong>Most viewed repository</strong>
                          <small>
                            {topRepo[0]} · viewed {topRepo[1]} time{topRepo[1] === 1 ? "" : "s"}
                          </small>
                        </span>
                      </Link>
                    </li>
                  )}
                  {latest && (
                    <li>
                      <Link href={recentHref(latest)} className="dash-insight">
                        <span className="dash-insight-icon" aria-hidden="true">
                          <Activity size={15} />
                        </span>
                        <span className="dash-insight-text">
                          <strong>Recently active</strong>
                          <small>
                            {recentTitle(latest)} · {timeAgo(latest.viewed_at)}
                          </small>
                        </span>
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <div className="dash-empty">
                  <Bookmark size={18} aria-hidden="true" />
                  <p>Top entities appear as you explore and revisit signals.</p>
                </div>
              )}
            </section>

            <section className="dash-card" aria-labelledby="language-focus">
              <div className="dash-card-head">
                <div>
                  <h2 id="language-focus">Language focus</h2>
                  <p>Most common among saved repositories</p>
                </div>
              </div>
              {topLangs.length > 0 ? (
                <div className="language-signals">
                  {topLangs.map(([lang, n]) => (
                    <div key={lang} className="language-signal">
                      <div>
                        <span style={{ fontWeight: 600, color: "#171416" }}>{lang}</span>
                        <span className="language-signal-value">
                          {langTotal > 0 ? Math.round((n / langTotal) * 100) : 0}%
                        </span>
                      </div>
                      <div className="language-signal-track">
                        <span style={{ width: `${langTotal > 0 ? Math.round((n / langTotal) * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty">
                  <Languages size={18} aria-hidden="true" />
                  <p>No language signal yet. Save repositories to reveal your focus.</p>
                  <Link href="/search?type=repositories" className="dash-empty-link">
                    Explore repositories →
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
