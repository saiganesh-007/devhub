import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, GitFork, Heart, Star, User as UserIcon } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Card, Empty, Metric, PageHeader, SectionTitle } from "@/components/ui";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatDate } from "@/lib/analytics";

type SavedDeveloper = {
  id: string;
  github_username: string;
  developer_name: string | null;
};

type SavedRepository = {
  id: string;
  owner: string;
  repo_name: string;
  full_name: string;
  description: string | null;
};

type RecentView = {
  id: string;
  entity_type: "developer" | "repository";
  entity_identifier: string;
  metadata: Record<string, unknown>;
  viewed_at: string;
};

export default async function Dashboard() {
  const supabase = await createSupabaseServer();
  let name = "Explorer";
  let developers: SavedDeveloper[] = [];
  let repositories: SavedRepository[] = [];
  let recent: RecentView[] = [];

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    name = String(
      user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Explorer",
    );

    const [d, r, v] = await Promise.all([
      supabase
        .from("favorite_developers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("favorite_repositories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("recent_views")
        .select("*")
        .order("viewed_at", { ascending: false })
        .limit(6),
    ]);
    developers = d.data || [];
    repositories = r.data || [];
    recent = v.data || [];
  }

  return (
    <AppShell section="Dashboard">
      <PageHeader
        eyebrow="Personal intelligence"
        title={`Welcome back, ${name}.`}
        description="Your open-source research, distilled into one workspace."
      />

      {!supabase && (
        <Card className="mt-8 border border-warn/30 bg-warn/5">
          <p className="text-sm text-warn">
            Preview mode — configure Supabase to enable private saved
            collections and recent views.
          </p>
        </Card>
      )}

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Saved developers" value={developers.length} />
        <Metric label="Saved repositories" value={repositories.length} />
        <Metric label="Recent views" value={recent.length} />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle title="Favourite developers" />
          {developers.length ? (
            <div className="space-y-3">
              {developers.map((d) => (
                <Link
                  key={d.id}
                  href={`/developer/${d.github_username}`}
                  className="card-surface card-surface--interactive flex items-center gap-3 p-4"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-panel text-ink3">
                    <UserIcon size={16} />
                  </span>
                  <span>
                    <span className="block font-medium text-ink">
                      {String(d.developer_name || d.github_username)}
                    </span>
                    <span className="block text-sm text-ink3">
                      @{d.github_username}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No developers saved"
              detail="Search GitHub and save profiles you want to track."
            />
          )}
        </div>

        <div>
          <SectionTitle title="Favourite repositories" />
          {repositories.length ? (
            <div className="space-y-3">
              {repositories.map((r) => (
                <Link
                  key={r.id}
                  href={`/repository/${r.owner}/${r.repo_name}`}
                  className="card-surface card-surface--interactive flex items-center gap-3 p-4"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-panel text-ink3">
                    <Heart size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {r.full_name}
                    </span>
                    {r.description && (
                      <span className="block truncate text-sm text-ink3">
                        {r.description}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No repositories saved"
              detail="Build a focused collection from repository intelligence pages."
            />
          )}
        </div>
      </div>

      <div className="mt-12">
        <SectionTitle
          title="Recent views"
          action={
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink3">
              {recent.length.toString().padStart(2, "0")} viewed
            </span>
          }
        />
        {recent.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {recent.map((view) => {
              const isRepo = view.entity_type === "repository";
              const href = isRepo
                ? `/repository/${view.entity_identifier.replace(/^\//, "")}`
                : `/developer/${view.entity_identifier.replace(/^@/, "")}`;
              const title =
                (view.metadata?.name as string) ||
                (isRepo
                  ? view.entity_identifier
                  : `@${view.entity_identifier}`);
              const meta =
                (isRepo
                  ? (view.metadata?.language as string) ||
                    (view.metadata?.description as string)
                  : undefined) || "";
              return (
                <li key={view.id}>
                  <Link
                    href={href}
                    className="card-surface card-surface--interactive flex items-center gap-3 p-4"
                  >
                    {isRepo ? (
                      <GitFork size={16} className="shrink-0 text-brand2" />
                    ) : (
                      <Star size={16} className="shrink-0 text-brand1" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {title}
                      </span>
                      {meta && (
                        <span className="block truncate text-xs text-ink3">
                          {meta}
                        </span>
                      )}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink3">
                      <Clock size={11} />
                      {formatDate(view.viewed_at)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty
            title="No signals viewed yet"
            detail="Visit a developer or repository page and it will appear here."
          />
        )}
      </div>
    </AppShell>
  );
}