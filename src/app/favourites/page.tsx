import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Empty } from "@/components/ui";
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
    return <AppShell><Empty title="Connect Supabase to use collections" detail="Add your public Supabase URL and publishable key to .env.local, then restart DevHub." /></AppShell>;
  }

  const { data: { user } } = await database.auth.getUser();
  if (!user) redirect("/login");

  const [developerResult, repositoryResult] = await Promise.all([
    database.from("favorite_developers").select("*").order("created_at", { ascending: false }),
    database.from("favorite_repositories").select("*").order("created_at", { ascending: false }),
  ]);
  const developers = (developerResult.data ?? []) as DeveloperFavourite[];
  const repositories = (repositoryResult.data ?? []) as RepositoryFavourite[];

  return <AppShell>
    <p className="workspace-eyebrow">Collections / private workspace</p>
    <div className="collection-heading">
      <div>
        <h1>Saved intelligence.</h1>
        <p>Keep the developers and repositories that deserve another look.</p>
      </div>
      <div className="collection-counts"><span>{developers.length} developers</span><span>{repositories.length} repositories</span></div>
    </div>

    <div className="collection-layout">
      <section aria-labelledby="saved-developers">
        <div className="collection-section-heading"><h2 id="saved-developers">Developers</h2><span>{developers.length.toString().padStart(2, "0")}</span></div>
        {developers.length ? <div className="collection-list">{developers.map((developer) => <article className="collection-row" key={developer.id}>
          <Link href={`/developer/${developer.github_username}`} className="collection-identity">
            {developer.avatar_url && <Image src={developer.avatar_url} alt="" width={42} height={42} className="collection-avatar" />}
            <span><strong>{developer.developer_name || developer.github_username}</strong><small>@{developer.github_username}</small></span>
          </Link>
          <RemoveFavouriteButton endpoint={`/api/favourites/developers/${developer.github_username}`} label={developer.github_username} />
        </article>)}</div> : <Empty title="No developers saved" detail="Save a developer from their intelligence profile." />}
      </section>

      <section aria-labelledby="saved-repositories">
        <div className="collection-section-heading"><h2 id="saved-repositories">Repositories</h2><span>{repositories.length.toString().padStart(2, "0")}</span></div>
        {repositories.length ? <div className="collection-list">{repositories.map((repository) => <article className="collection-row" key={repository.id}>
          <Link href={`/repository/${repository.owner}/${repository.repo_name}`} className="collection-repository">
            <strong>{repository.full_name}</strong>
            <small>{repository.description || "No description provided."}</small>
            <span>{repository.language || "Mixed"} · {repository.stars.toLocaleString()} stars</span>
          </Link>
          <RemoveFavouriteButton endpoint={`/api/favourites/repositories/${repository.id}`} label={repository.full_name} />
        </article>)}</div> : <Empty title="No repositories saved" detail="Save a repository from its intelligence page." />}
      </section>
    </div>
  </AppShell>;
}
