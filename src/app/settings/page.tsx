import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Button, Card, Empty, PageHeader } from "@/components/ui";
import { SettingsExperience } from "@/components/settings-experience";
import { logout } from "@/app/actions/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  if (!supabase) {
    return (
      <AppShell section="Settings">
        <PageHeader title="Workspace settings." />
        <div className="mt-6">
          <Empty
            title="Connect Supabase to use settings"
            detail="Add your public Supabase URL and publishable key to .env.local, then restart DevHub."
          />
        </div>
      </AppShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(
    user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Account",
  );
  const githubUsername =
    (typeof user.user_metadata?.user_name === "string" && user.user_metadata.user_name) ||
    (typeof user.user_metadata?.preferred_username === "string" && user.user_metadata.preferred_username) ||
    (typeof user.user_metadata?.github_username === "string" && user.user_metadata.github_username) ||
    null;
  const avatarUrl =
    (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) ||
    null;
  const providerAvatarUrl =
    (typeof user.user_metadata?.picture === "string" && user.user_metadata.picture) ||
    null;

  const [devCount, repoCount, viewCount] = await Promise.all([
    supabase.from("favorite_developers").select("id", { count: "exact", head: true }),
    supabase.from("favorite_repositories").select("id", { count: "exact", head: true }),
    supabase.from("recent_views").select("id", { count: "exact", head: true }),
  ]);

  return (
    <AppShell section="Settings">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings."
        description="Tune how DevHub looks and manage your private workspace."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <SettingsExperience
          displayName={name}
          email={user.email ?? ""}
          githubUsername={githubUsername}
          avatarUrl={avatarUrl}
          providerAvatarUrl={providerAvatarUrl}
          savedDevelopers={devCount.count ?? 0}
          savedRepositories={repoCount.count ?? 0}
          recentViews={viewCount.count ?? 0}
        />

        <aside className="space-y-4">
          <Card className="text-body-secondary p-4">
            Signing out returns you to sign-in. Your saved favourites stay in
            your private Supabase workspace and reappear when you sign back in.
          </Card>
          <form action={logout}>
            <Button
              type="submit"
              variant="danger"
              icon={<LogOut size={15} aria-hidden="true" />}
              className="w-full"
            >
              Sign out
            </Button>
          </form>
        </aside>
      </div>
    </AppShell>
  );
}
