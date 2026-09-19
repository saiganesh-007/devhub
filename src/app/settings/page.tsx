import { redirect } from "next/navigation";
import { LogOut, Mail, User } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Button, Card, Empty, PageHeader, SectionTitle } from "@/components/ui";
import { ThemeSettings } from "@/components/theme/theme-settings";
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

  return (
    <AppShell section="Settings">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings."
        description="Tune how DevHub looks and manage your private workspace."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-10">
          <section>
            <SectionTitle title="Appearance" eyebrow="Theme" />
            <ThemeSettings />
          </section>

          <section>
            <SectionTitle title="Profile" eyebrow="Account" />
            <Card>
              <dl className="divide-y divide-line">
                <div className="flex items-center gap-4 py-3">
                  <User size={16} className="text-ink3" />
                  <dt className="w-28 text-sm text-ink3">Name</dt>
                  <dd className="text-sm font-medium text-ink">{name}</dd>
                </div>
                <div className="flex items-center gap-4 py-3">
                  <Mail size={16} className="text-ink3" />
                  <dt className="w-28 text-sm text-ink3">Email</dt>
                  <dd className="text-sm font-medium text-ink">{user.email}</dd>
                </div>
              </dl>
            </Card>
          </section>
        </div>

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