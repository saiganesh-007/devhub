import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Building2, CalendarDays, ExternalLink as ExternalLinkIcon, GitFork, MapPin, Star, User } from "lucide-react";
import { AppShell, RateBadge } from "@/components/shell";
import { Button, Card, ExternalLink, Metric, SectionTitle } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { RecentViewBeacon } from "@/components/recent-view-beacon";
import { compactNumber, formatDate, summarizeRepositories, languagePercentages } from "@/lib/analytics";
import { GitHubError, getUser, getUserRepos } from "@/lib/github/client";
import { LanguageChart } from "@/components/language-chart";

export default async function DeveloperPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let user, repos;
  try {
    [user, repos] = await Promise.all([getUser(username), getUserRepos(username)]);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) notFound();
    throw e;
  }
  const summary = summarizeRepositories(repos);
  const languageDistribution = languagePercentages(
    repos.reduce<Record<string, number>>((acc, repo) => {
      if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + (repo.size || 0);
      return acc;
    }, {}),
  );

  const recentRepos = [...repos]
    .filter((r) => r.pushed_at)
    .sort((a, b) => new Date(b.pushed_at!).getTime() - new Date(a.pushed_at!).getTime())
    .slice(0, 5);

  return (
    <AppShell section="Developer">
      <RecentViewBeacon
        type="developer"
        identifier={user.login}
        metadata={{ name: user.name, avatar_url: user.avatar_url }}
      />

      {/* Hero Section */}
      <div className="profile-hero flex flex-col gap-8 border-b border-line pb-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="profile-identity flex gap-5">
          <div className="relative shrink-0">
            <Image
              src={user.avatar_url}
              alt={`${user.login} avatar`}
              width={128}
              height={128}
              className="size-32 rounded-2xl ring-1 ring-line object-cover"
            />
            {user.login === "torvalds" && (
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-brand1 text-[10px] font-bold text-white">
                ✓
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <RateBadge />
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold tracking-tight text-ink">
                {user.name || user.login}
              </h1>
              <span className="font-mono text-sm text-ink3 self-center">@{user.login}</span>
            </div>

            {user.bio && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink2">{user.bio}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink3">
              {user.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  {user.company}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {user.location}
                </span>
              )}
              {user.blog && (
                <ExternalLink href={user.blog} className="flex items-center gap-1.5">
                  <ExternalLinkIcon size={14} />
                  {user.blog.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </ExternalLink>
              )}
              <ExternalLink href={user.html_url} className="flex items-center gap-1.5">
                <User size={14} />
                GitHub profile
              </ExternalLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row">
          <SaveButton
            kind="developers"
            payload={{
              github_username: user.login,
              developer_name: user.name || null,
              avatar_url: user.avatar_url,
            }}
          />
          <Button
            href={`/compare?type=developer&a=${user.login}`}
            variant="secondary"
          >
            Compare
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="signal-strip mt-10 grid grid-cols-2 border-y border-line py-6 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Followers" value={compactNumber(user.followers || 0)} />
        <Metric label="Following" value={compactNumber(user.following || 0)} />
        <Metric label="Repositories" value={user.public_repos || 0} />
        <Metric label="Total Stars" value={compactNumber(summary.totalStars)} />
        <Metric label="Total Forks" value={compactNumber(summary.totalForks)} />
        <Metric label="Joined" value={formatDate(user.created_at)} />
      </div>

      {/* Main Content Grid */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Left Column - Language Intelligence & Overview */}
        <div className="space-y-10">
          {/* Language Intelligence */}
          <section>
            <SectionTitle eyebrow="Technology Intelligence" title="Language Distribution" />
            <Card variant="developer">
              {languageDistribution.length > 0 ? (
                <LanguageChart data={languageDistribution} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-ink3">No language data available for this developer.</p>
                </div>
              )}
            </Card>
          </section>

          {/* Repository Signals */}
          <section>
            <SectionTitle eyebrow="Repository Signals" title="Aggregate Metrics" />
            <div className="intelligence-facts grid gap-4 sm:grid-cols-2">
              <Card variant="metric">
                <p className="text-metadata">Median Stars / Repo</p>
                <p className="text-statistic mt-2">
                  {user.public_repos && user.public_repos > 0
                    ? compactNumber(Math.round(summary.totalStars / user.public_repos))
                    : "—"}
                </p>
              </Card>
              <Card variant="metric">
                <p className="text-metadata">Most Starred Repo</p>
                <p className="text-statistic mt-2 text-sm">
                  {summary.mostStarred
                    ? compactNumber(summary.mostStarred.stargazers_count)
                    : "—"}
                </p>
              </Card>
              <Card variant="metric">
                <p className="text-metadata">Languages Used</p>
                <p className="text-statistic mt-2">{languageDistribution.length}</p>
              </Card>
              <Card variant="metric">
                <p className="text-metadata">Primary Language</p>
                <p className="text-statistic mt-2 text-sm">
                  {languageDistribution[0]?.name || "—"}
                </p>
              </Card>
              <Card variant="metric" className="sm:col-span-2 lg:col-span-4">
                <p className="text-metadata">Total Repository Size</p>
                <p className="text-statistic mt-2">
                  {compactNumber(repos.reduce((sum, r) => sum + (r.size || 0), 0))} KB
                </p>
              </Card>
              <Card variant="metric" className="sm:col-span-2 lg:col-span-4">
                <p className="text-metadata">Total Open Issues (tracked)</p>
                <p className="text-statistic mt-2">
                  {compactNumber(repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0))}
                </p>
              </Card>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <SectionTitle
              eyebrow="Activity"
              title="Recent Repository Updates"
              action={
                <ExternalLink href={user.html_url} className="text-sm">
                  View all on GitHub
                </ExternalLink>
              }
            />
            <Card variant="developer">
              {recentRepos.length > 0 ? (
                <div className="space-y-1">
                  {recentRepos.map((repo) => (
                    <Link
                      key={repo.id}
                      href={`/repository/${user.login}/${repo.name}`}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-transparent transition-colors hover:border-line hover:bg-panel"
                    >
                      <div className="grid size-12 place-items-center rounded-lg border border-line bg-panel text-brand2 shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium text-ink group-hover:text-brand1 transition-colors truncate">
                            {repo.name}
                          </h3>
                          <span className="font-mono text-[10px] text-ink3 shrink-0">
                            {formatDate(repo.pushed_at)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-[10px] text-ink3">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span
                                className="size-2 rounded"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                              />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star size={11} className="text-brand3" />
                            {compactNumber(repo.stargazers_count)}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork size={11} />
                            {compactNumber(repo.forks_count)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-ink3">No recent activity data available.</p>
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* Right Column - Top Repositories */}
        <div>
          <SectionTitle eyebrow="Public Work" title="Top Repositories" />
          <div className="space-y-1">
            {repos.length === 0 ? (
              <Card variant="empty">
                <p className="text-body-secondary">No public repositories found.</p>
              </Card>
            ) : (
              [...repos]
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 10)
                .map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repository/${user.login}/${repo.name}`}
                    className="group card-surface card-surface--repository p-5 grid grid-cols-[1fr_auto] gap-4 transition-colors hover:border-brand1/30"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-ink group-hover:text-brand1 transition-colors">
                        {repo.name}
                      </h3>
                      {repo.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink2">
                          {repo.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] text-ink3">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span
                              className="size-2 rounded"
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          Updated {formatDate(repo.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-ink3 shrink-0">
                      <span className="flex items-center gap-1">
                        <Star size={13} className="text-brand3" />
                        {compactNumber(repo.stargazers_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={13} />
                        {compactNumber(repo.forks_count)}
                      </span>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Vue: "#42b883",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Lua: "#000080",
    R: "#198CE7",
    Scala: "#c22d40",
    Haskell: "#5e5086",
    Elixir: "#6e4a7e",
    Clojure: "#db5855",
    ObjectiveC: "#438eff",
    Perl: "#0298c3",
    Dockerfile: "#384d54",
  };
  return colors[language] || "#64748b";
}
