import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { RecentViewBeacon } from "@/components/recent-view-beacon";
import { RepositoryContent } from "@/components/repository-content";
import { GitHubError, getLanguages, getContributors, getActivity, getRepo } from "@/lib/github/client";

export default async function RepoPage({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await params;
  let repository, languages, contributors, activity;
  try {
    [repository, languages, contributors, activity] = await Promise.all([
      getRepo(owner, repo),
      getLanguages(owner, repo),
      getContributors(owner, repo),
      getActivity(owner, repo),
    ]);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) notFound();
    throw e;
  }

  return (
    <AppShell section="Repository">
      <RecentViewBeacon
        type="repository"
        identifier={repository.full_name || `${owner}/${repo}`}
        metadata={{ name: repository.full_name, description: repository.description, language: repository.language }}
      />

      <RepositoryContent
        repository={repository}
        languages={languages}
        contributors={contributors}
        activity={activity}
      />
    </AppShell>
  );
}