import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Empty, PageHeader, Pill } from "@/components/ui";
import { RemoveFavouriteButton } from "@/components/remove-favourite-button";
import { createSupabaseServer } from "@/lib/supabase/server";

type DeveloperFavourite = {
  id: string;
  github_username: string;
  developer_name: string | null;
  avatar_url: string | null;
};

type RepositoryFavourite = {
  id: string;
  owner: string;
  repo_name: string;
  full_name: string;
  description: string | null;
  stars: number;
  language: string | null;
};

export default async function Favourites() {
  const database = await createSupabaseServer();

  if (!database) {
    return (
      <AppShell section="Favourites">
        <Empty
          title="Connect Supabase to use collections"
          detail="Add your public Supabase URL and publishable key to .env.local, then restart DevHub."
        />
      </AppShell>
    );
  }

  const {
    data: { user },
  } = await database.auth.getUser();
  if (!user) redirect("/login");

  const [developerResult, repositoryResult] = await Promise.all([
    database
      .from("favorite_developers")
      .select("*")
      .order("created_at", { ascending: false }),
    database
      .from("favorite_repositories")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const developers = (developerResult.data ?? []) as DeveloperFavourite[];
  const repositories = (repositoryResult.data ?? []) as RepositoryFavourite[];

  return (
    <AppShell section="Favourites">
      <div className="border-b border-line pb-8">
        <PageHeader
          eyebrow="Collections / private workspace"
          title="Saved intelligence."
          description="Keep the developers and repositories that deserve another look."
          actions={
            <>
              <Pill>{developers.length} developers</Pill>
              <Pill>{repositories.length} repositories</Pill>
            </>
          }
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="saved-developers">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <h2 id="saved-developers" className="text-section-title">
              Developers
            </h2>
            <span className="text-technical">
              {developers.length.toString().padStart(2, "0")}
            </span>
          </div>

          {developers.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {developers.map((developer) => (
                <li key={developer.id} className="flex items-center gap-4 py-4">
                  <Link
                    href={`/developer/${developer.github_username}`}
                    className="group flex min-w-0 flex-1 items-center gap-3"
                  >
                    {developer.avatar_url ? (
                      <Image
                        src={developer.avatar_url}
                        alt=""
                        width={42}
                        height={42}
                        className="size-[42px] rounded-full border border-line"
                      />
                    ) : (
                      <span className="grid size-[42px] shrink-0 place-items-center rounded-full border border-line bg-panel text-ink3">
                        @
                      </span>
                    )}
                    <span className="min-w-0">
                      <strong className="block truncate text-sm font-medium text-ink group-hover:text-brand1">
                        {developer.developer_name || developer.github_username}
                      </strong>
                      <small className="block truncate text-xs text-ink3">
                        @{developer.github_username}
                      </small>
                    </span>
                  </Link>
                  <RemoveFavouriteButton
                    endpoint={`/api/favourites/developers/${developer.github_username}`}
                    label={developer.github_username}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              title="No developers saved"
              detail="Save a developer from their intelligence profile."
            />
          )}
        </section>

        <section aria-labelledby="saved-repositories">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <h2 id="saved-repositories" className="text-section-title">
              Repositories
            </h2>
            <span className="text-technical">
              {repositories.length.toString().padStart(2, "0")}
            </span>
          </div>

          {repositories.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {repositories.map((repository) => (
                <li key={repository.id} className="flex items-center gap-4 py-4">
                  <Link
                    href={`/repository/${repository.owner}/${repository.repo_name}`}
                    className="group flex min-w-0 flex-1 flex-col"
                  >
                    <strong className="truncate text-sm font-medium text-ink group-hover:text-brand1">
                      {repository.full_name}
                    </strong>
                    <small className="mt-1 truncate text-xs text-ink3">
                      {repository.description || "No description provided."}
                    </small>
                    <small className="mr-6 mt-2 font-mono text-[10px] uppercase tracking-wider text-ink3">
                      {repository.language || "Mixed"} ·{" "}
                      {repository.stars.toLocaleString()} stars
                    </small>
                  </Link>
                  <RemoveFavouriteButton
                    endpoint={`/api/favourites/repositories/${repository.id}`}
                    label={repository.full_name}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              title="No repositories saved"
              detail="Save a repository from its intelligence page."
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}