import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";

export async function AuthStatus() {
  const supabase = await createSupabaseServer();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    return (
      <Link href="/login" className="btn btn-primary btn-sm">
        Sign in
      </Link>
    );
  }

  const name = String(
    user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Account",
  );

  return <UserMenu name={name} />;
}