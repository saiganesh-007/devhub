import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Empty, PageHeader, Pill } from "@/components/ui";
import { createSupabaseServer } from "@/lib/supabase/server";
import { CollectionsManager } from "@/components/collections-manager";
import { SavedLibrary, type SavedDeveloper, type SavedRepository } from "@/components/saved-library";

export default async function Favourites() {
  const database = await createSupabaseServer();
  if (!database) return <AppShell section="Favourites"><Empty title="Connect Supabase to use collections" detail="Add your public Supabase URL and publishable key to .env.local, then restart DevHub." /></AppShell>;
  const { data: { user } } = await database.auth.getUser();
  if (!user) redirect("/login");
  const [developerResult, repositoryResult] = await Promise.all([
    database.from("favorite_developers").select("*").order("created_at", { ascending: false }),
    database.from("favorite_repositories").select("*").order("created_at", { ascending: false }),
  ]);
  const developers = (developerResult.data ?? []) as SavedDeveloper[];
  const repositories = (repositoryResult.data ?? []) as SavedRepository[];
  return <AppShell section="Favourites"><div className="border-b border-line pb-8"><PageHeader eyebrow="Collections / private workspace" title="Saved intelligence." description="Search, organize, compare, and annotate the developers and repositories worth another look." actions={<><Pill>{developers.length} developers</Pill><Pill>{repositories.length} repositories</Pill></>} /></div><SavedLibrary developers={developers} repositories={repositories} /><CollectionsManager /></AppShell>;
}
